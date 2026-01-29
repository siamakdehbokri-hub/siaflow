-- Add UPDATE policy for saving_goal_transactions table
-- This allows users to update their own goal transactions with proper authorization

CREATE POLICY "Users can update their own goal transactions" 
ON public.saving_goal_transactions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);