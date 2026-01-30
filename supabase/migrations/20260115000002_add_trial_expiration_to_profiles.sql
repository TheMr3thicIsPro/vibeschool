-- Migration to add trial expiration to profiles table

-- Add trial_started_at and trial_expires_at columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE;

-- Update the existing trigger function to also update trial_expires_at when plan changes
CREATE OR REPLACE FUNCTION update_trial_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- If plan is being changed from 'free' to 'member', clear trial-related fields
    IF OLD.plan = 'free' AND NEW.plan = 'member' THEN
        NEW.trial_started_at := NULL;
        NEW.trial_expires_at := NULL;
        NEW.account_locked := FALSE;
    -- If plan is being changed to 'free' and was not previously 'free', start trial
    ELSIF NEW.plan = 'free' AND COALESCE(OLD.plan, '') != 'free' THEN
        NEW.trial_started_at := COALESCE(NEW.trial_started_at, NOW());
        NEW.trial_expires_at := NEW.trial_started_at + INTERVAL '1 minute';
        NEW.account_locked := FALSE;
    END IF;

    -- Update updated_at timestamp
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old trigger and create the new one with the updated function
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_trial_expiration();

-- Update existing profiles to set trial expiration if they have free plan
UPDATE profiles 
SET 
    trial_started_at = COALESCE(trial_started_at, created_at),
    trial_expires_at = COALESCE(trial_expires_at, 
        CASE 
            WHEN created_at IS NOT NULL 
            THEN created_at + INTERVAL '1 minute'
            ELSE NOW() + INTERVAL '1 minute'
        END)
WHERE plan = 'free' AND trial_expires_at IS NULL;

-- Create a function to check if a user's trial has expired
CREATE OR REPLACE FUNCTION is_trial_expired(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_trial_expires_at TIMESTAMPTZ;
    v_plan TEXT;
BEGIN
    SELECT plan, trial_expires_at INTO v_plan, v_trial_expires_at
    FROM profiles
    WHERE id = p_user_id;
    
    -- If user doesn't exist or plan is not free, return false
    IF v_plan IS NULL OR v_plan != 'free' THEN
        RETURN FALSE;
    END IF;
    
    -- If trial expiration is set and is in the past, return true
    IF v_trial_expires_at IS NOT NULL AND v_trial_expires_at < NOW() THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Update RLS policies to enforce trial expiration
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (
        auth.uid() = id AND 
        (NOT is_trial_expired(auth.uid()) OR (SELECT plan FROM profiles WHERE id = auth.uid()) = 'member')
    );

-- Update RLS policies for other tables to enforce trial expiration for free users
-- Courses
DROP POLICY IF EXISTS "Everyone can view published courses" ON courses;
CREATE POLICY "Everyone can view published courses" ON courses
    FOR SELECT USING (
        is_published = true AND
        ((SELECT plan FROM profiles WHERE id = auth.uid()) = 'member' OR 
         (SELECT plan FROM profiles WHERE id = auth.uid()) = 'free' AND 
         NOT is_trial_expired(auth.uid()))
    );

-- Modules
DROP POLICY IF EXISTS "Everyone can view modules of published courses" ON modules;
CREATE POLICY "Everyone can view modules of published courses" ON modules
    FOR SELECT USING (
        (SELECT is_published FROM courses WHERE id = course_id) = true
        AND ((SELECT plan FROM profiles WHERE id = auth.uid()) = 'member' OR 
             (SELECT plan FROM profiles WHERE id = auth.uid()) = 'free' AND 
             NOT is_trial_expired(auth.uid()))
    );

-- Lessons
DROP POLICY IF EXISTS "Everyone can view published lessons of published courses" ON lessons;
CREATE POLICY "Everyone can view published lessons of published courses" ON lessons
    FOR SELECT USING (
        is_published = true 
        AND (SELECT is_published FROM courses WHERE id = (SELECT course_id FROM modules WHERE id = module_id)) = true
        AND ((SELECT plan FROM profiles WHERE id = auth.uid()) = 'member' OR 
             (SELECT plan FROM profiles WHERE id = auth.uid()) = 'free' AND 
             NOT is_trial_expired(auth.uid()))
    );

-- Allow free users to access preview lessons even after trial expires
CREATE POLICY "Free users can access preview lessons" ON lessons
    FOR SELECT USING (
        is_preview = true 
        AND (SELECT plan FROM profiles WHERE id = auth.uid()) = 'free'
        AND is_trial_expired(auth.uid())
    );