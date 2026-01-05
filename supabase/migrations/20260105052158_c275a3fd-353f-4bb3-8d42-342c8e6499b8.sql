-- Add foreign key constraint to debts table for referential integrity
-- This ensures automatic cleanup when users are deleted
ALTER TABLE public.debts 
ADD CONSTRAINT debts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;