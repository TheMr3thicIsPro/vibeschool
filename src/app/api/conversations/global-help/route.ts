import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

console.log('Global Help API route loaded');

// Create a service role client
const serviceRoleSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be added to your environment variables
);

// Create an anon client for auth verification
const anonSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  console.log('Global Help API route: GET request received');
  console.log('Global Help API route: Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Extract the authorization header to get the session
    const authHeader = request.headers.get('authorization');
    console.log('Global Help API route: Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Global Help API route: Missing or invalid authorization header');
      return Response.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    console.log('Global Help API route: Extracted token (first 10 chars):', token.substring(0, 10) + '...');
    
    // Get the current user session using the token
    const { data: { user }, error: userError } = await anonSupabase.auth.getUser(token);
    console.log('Global Help API route: User fetch result:', { user: user ? { id: user.id } : null, userError });
    
    if (userError || !user) {
      console.log('Global Help API route: Unauthorized - no user found or error:', userError);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upsert the global help conversation using service role
    console.log('Global Help API route: Upserting global help conversation');
    const { data: conversation, error: convError, status: convStatus } = await serviceRoleSupabase
      .from('conversations')
      .upsert({
        type: 'group',
        name: 'Global Help'
      }, { onConflict: 'type,name' })
      .select()
      .single();

    console.log('Global Help API route: Upsert result:', { conversation, convError, convStatus });

    if (convError) {
      console.error('Global Help API route: Error upserting global help conversation:', convError);
      console.error('Global Help API route: Upsert error details:', {
        message: (convError as any).message,
        details: (convError as any).details,
        hint: (convError as any).hint,
        code: (convError as any).code,
        status: convStatus
      });
      return Response.json({ 
        error: 'Failed to upsert global help conversation',
        details: {
          message: (convError as any).message,
          details: (convError as any).details,
          hint: (convError as any).hint,
          code: (convError as any).code,
        }
      }, { status: 500 });
    }

    console.log('Global Help API route: Successfully upserted conversation:', conversation);

    // Check if membership already exists
    console.log('Global Help API route: Checking if membership already exists for user:', user.id, 'in conversation:', conversation.id);
    const { data: existingMembership, error: existingError } = await serviceRoleSupabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', conversation.id)
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Global Help API route: Existing membership check result:', { existingMembership, existingError });
    
    // Upsert the user as a member of the conversation
    console.log('Global Help API route: Upserting user as member of conversation');
    const { error: memberError, status: memberStatus } = await serviceRoleSupabase
      .from('conversation_members')
      .upsert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'member'
      }, { onConflict: 'conversation_id,user_id' });

    console.log('Global Help API route: Member upsert result:', { memberError, memberStatus });

    if (memberError) {
      console.error('Global Help API route: Error upserting user to conversation:', memberError);
      console.error('Global Help API route: Member error details:', {
        code: (memberError as any).code,
        message: (memberError as any).message,
        details: (memberError as any).details,
        hint: (memberError as any).hint,
        status: memberStatus
      });
      return Response.json({ 
        error: 'Failed to add user to conversation',
        details: {
          code: (memberError as any).code,
          message: (memberError as any).message,
          details: (memberError as any).details,
          hint: (memberError as any).hint,
        }
      }, { status: 500 });
    } else {
      console.log('Global Help API route: User successfully upserted as member');
    }

    // Determine if membership was newly created
    const membershipCreated = !existingMembership;
    console.log('Global Help API route: Membership creation status:', { membershipCreated, existingMembership: !!existingMembership });
    
    console.log('Global Help API route: Returning conversation and membership info:', { conversation, membershipCreated, userId: user.id });
    return Response.json({ 
      conversation, 
      membershipCreated,
      userId: user.id
    });
  } catch (error) {
    console.error('Global Help API route: Error in global help conversation API:', error);
    console.error('Global Help API route: Full error details:', {
      message: (error as any).message,
      stack: (error as any).stack
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}