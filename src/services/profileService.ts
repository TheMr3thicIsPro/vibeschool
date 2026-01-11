import { supabase } from '@/lib/supabase';



// Get user profile with fallback to ensure profile exists
export const getUserProfile = async (userId: string) => {
  console.log('getUserProfile: Fetching profile for user:', userId);
  
  // First try to get the existing profile
  let { data, error, status } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  console.log('getUserProfile: Initial query result:', { data, error, status, userId });

  if (error) {
    console.log('getUserProfile: Profile not found (status:', status, '), attempting to create fallback profile');
    console.log('getUserProfile: Error details:', {
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
      code: (error as any).code
    });
    
    // If no profile exists, we need to create one
    // Get the user's email from auth to use as username
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!authError && user && user.email) {
      console.log('getUserProfile: Creating profile for user with email:', user.email);
      
      // Create a profile with email as username
      const { data: newProfile, error: insertError, status: insertStatus } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          email: user.email,
          username: user.email.split('@')[0], // Use part before @ as username
        }], { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('getUserProfile: Error creating profile:', insertError);
        console.error('getUserProfile: Insert error details:', {
          message: (insertError as any).message,
          details: (insertError as any).details,
          hint: (insertError as any).hint,
          code: (insertError as any).code,
          status: insertStatus
        });
        throw insertError;
      }
      
      console.log('getUserProfile: Created new profile:', newProfile);
      return newProfile;
    } else {
      console.error('getUserProfile: Error getting user from auth:', authError);
      console.error('getUserProfile: Auth error details:', {
        message: authError?.message,
        code: authError?.code
      });
      throw error;
    }
  }

  // If data is null (profile doesn't exist), create it
  if (!data) {
    console.log('getUserProfile: Profile does not exist, creating fallback profile');
    
    // Get the user's email from auth to use as username
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!authError && user && user.email) {
      console.log('getUserProfile: Creating profile for user with email:', user.email);
      
      // Create a profile with email as username
      const { data: newProfile, error: insertError, status: insertStatus } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          email: user.email,
          username: user.email.split('@')[0], // Use part before @ as username
        }], { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('getUserProfile: Error creating profile:', insertError);
        console.error('getUserProfile: Insert error details:', {
          message: (insertError as any).message,
          details: (insertError as any).details,
          hint: (insertError as any).hint,
          code: (insertError as any).code,
          status: insertStatus
        });
        throw insertError;
      }
      
      console.log('getUserProfile: Created new profile:', newProfile);
      return newProfile;
    } else {
      console.error('getUserProfile: Error getting user from auth:', authError);
      console.error('getUserProfile: Auth error details:', {
        message: authError?.message,
        code: authError?.code
      });
      throw new Error('User not authenticated or error getting user info');
    }
  }

  console.log('getUserProfile: Result:', { data, error, status });
  return data;
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  profileData: { 
    username?: string; 
    email?: string;
    bio?: string; 
    avatar_url?: string 
  }
) => {
  console.log('updateUserProfile: Updating profile for user:', userId, 'with data:', profileData);
  
  // Check if username is already taken by another user
  if (profileData.username) {
    console.log('updateUserProfile: Checking if username is already taken:', profileData.username);
    const { data: existingUser, error: checkError, status: checkStatus } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', profileData.username)
      .neq('id', userId)
      .maybeSingle();

    console.log('updateUserProfile: Username check result:', { existingUser, checkError, checkStatus });
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is 'Row not found' which is expected if username is not taken
      console.error('updateUserProfile: Error checking username availability:', checkError);
      console.error('updateUserProfile: Check error details:', {
        message: (checkError as any).message,
        details: (checkError as any).details,
        hint: (checkError as any).hint,
        code: (checkError as any).code,
        status: checkStatus
      });
      throw checkError;
    }
    if (existingUser) {
      console.error('updateUserProfile: Username already taken:', profileData.username);
      throw new Error('Username already taken');
    }
  }

  const { data, error, status } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .maybeSingle();

  console.log('updateUserProfile: Update result:', { data, error, status });
  if (error) {
    console.error('updateUserProfile: Error updating profile:', error);
    console.error('updateUserProfile: Update error details:', {
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
      code: (error as any).code,
      status
    });
    throw error;
  }
  return data;
};

// Upload profile picture
export const uploadProfilePicture = async (userId: string, file: File) => {
  console.log('uploadProfilePicture: Uploading picture for user:', userId, 'file:', file.name);
  // Create a unique file name
  const fileName = `${userId}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  console.log('uploadProfilePicture: Upload result:', { data, error });
  if (error) {
    console.error('uploadProfilePicture: Error uploading file:', error);
    throw error;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  console.log('uploadProfilePicture: Public URL:', publicUrl);
  return publicUrl;
};

// Create user profile after signup (this is now handled by the DB trigger)
// But we'll keep this as a fallback
export const createProfile = async (userId: string, email: string, username: string) => {
  console.log('createProfile: Creating profile for user:', { userId, email, username });
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert([{
      id: userId,
      email: email,
      username: username,
    }], { onConflict: 'id' })
    .select()
    .maybeSingle();

  console.log('createProfile: Creation result:', { data, error });
  if (error) {
    console.error('createProfile: Error creating profile:', error);
    throw error;
  }
  return data;
};

// Get all profiles (for search functionality)
export const getAllProfiles = async (limit = 20, offset = 0) => {
  console.log('getAllProfiles: Fetching profiles with limit:', limit, 'offset:', offset);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, avatar_url, bio, created_at')
    .range(offset, offset + limit - 1);

  console.log('getAllProfiles: Result:', { data, error });
  if (error) {
    console.error('getAllProfiles: Error fetching profiles:', error);
    throw error;
  }
  return data;
};

// Search profiles by username
export const searchProfiles = async (searchTerm: string) => {
  console.log('searchProfiles: Searching for username:', searchTerm);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, avatar_url, bio, created_at')
    .ilike('username', `%${searchTerm}%`)
    .limit(20);

  console.log('searchProfiles: Search result:', { data, error });
  if (error) {
    console.error('searchProfiles: Error searching profiles:', error);
    throw error;
  }
  return data;
};