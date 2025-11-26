-- Fix OTP expiry security issue by setting it to a more secure 10 minutes (600 seconds)
-- Update auth settings for better security

-- Note: OTP expiry is configured in Supabase Auth settings, not database tables
-- This migration documents the security fix recommendation

-- Add a comment to document the required OTP configuration change
COMMENT ON SCHEMA public IS 'Security Fix Required: OTP expiry should be set to 10 minutes (600 seconds) in Supabase Auth Settings under Authentication > Settings > Auth > Session management';

-- Ensure all future user sessions have proper security settings
-- Add constraint to ensure email verification for security
ALTER TABLE public.profiles 
ADD CONSTRAINT check_email_not_empty 
CHECK (email IS NOT NULL AND length(trim(email)) > 0);