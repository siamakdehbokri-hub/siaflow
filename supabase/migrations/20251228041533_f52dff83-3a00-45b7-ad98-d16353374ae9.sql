-- Create saving_goals table
CREATE TABLE public.saving_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_amount BIGINT NOT NULL,
  current_amount BIGINT NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT 'hsl(175, 85%, 42%)',
  icon TEXT NOT NULL DEFAULT 'Target',
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saving_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own saving goals" 
ON public.saving_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saving goals" 
ON public.saving_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saving goals" 
ON public.saving_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saving goals" 
ON public.saving_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saving_goals_updated_at
BEFORE UPDATE ON public.saving_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create saving_goal_transactions table to track deposits/withdrawals
CREATE TABLE public.saving_goal_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.saving_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saving_goal_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own goal transactions" 
ON public.saving_goal_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal transactions" 
ON public.saving_goal_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal transactions" 
ON public.saving_goal_transactions 
FOR DELETE 
USING (auth.uid() = user_id);