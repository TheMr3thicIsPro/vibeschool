-- Add INSERT policy for profiles table to allow users to create their own profile

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the policies are set correctly
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';