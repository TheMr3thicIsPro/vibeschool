-- Fix missing is_published column in assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Force schema cache reload (Supabase specific)
NOTIFY pgrst, 'reload schema';
