
-- Add a first_visited flag to the profiles table to track if a user has visited the app before
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_visited BOOLEAN DEFAULT NULL;

-- Add comment explaining the purpose of the column
COMMENT ON COLUMN public.profiles.first_visited IS 'Flag indicating if the user has visited the app before, NULL means first visit';

-- Update existing rows to have first_visited = true since they've already seen the welcome screen
UPDATE public.profiles
SET first_visited = true
WHERE first_visited IS NULL;
