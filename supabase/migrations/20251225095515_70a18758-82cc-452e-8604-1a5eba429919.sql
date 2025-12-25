-- Add tags column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add weekly_budget column to categories for weekly budget support
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS budget_type text DEFAULT 'monthly';

-- Create index for tags search
CREATE INDEX IF NOT EXISTS idx_transactions_tags ON public.transactions USING GIN(tags);