
-- Add a bio column to the profiles table if it doesn't exist already
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- Add comment explaining the purpose of the column
COMMENT ON COLUMN public.profiles.bio IS 'User biography text';
