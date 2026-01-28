import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe/client';

console.log('[STRIPE] Initializing session route');

export async function GET(request: NextRequest) {
  console.log('[STRIPE] session GET called', { 
    hasSecret: !!process.env.STRIPE_SECRET_KEY,
    timestamp: new Date().toISOString()
  });

  try {
    // Get Stripe client with error handling
    const { client, error } = getStripeServerClient();
    
    if (error) {
      console.log('[STRIPE] session - returning config error');
      return error;
    }

    if (!client) {
      console.error('[STRIPE] session - No client available');
      return NextResponse.json(
        { error: 'Stripe client not available' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await client.checkout.sessions.retrieve(sessionId);

    console.log('[STRIPE] Session retrieved successfully', { sessionId: session.id });

    return NextResponse.json({
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      planType: session.metadata?.planType,
    });
  } catch (error: any) {
    console.error('[STRIPE] Error retrieving session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}