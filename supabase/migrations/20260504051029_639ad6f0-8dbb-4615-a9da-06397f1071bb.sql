-- Fix cross-user insert on saving_goal_transactions
DROP POLICY IF EXISTS "Users can create their own goal transactions" ON public.saving_goal_transactions;
CREATE POLICY "Users can create their own goal transactions"
ON public.saving_goal_transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.saving_goals sg
    WHERE sg.id = goal_id AND sg.user_id = auth.uid()
  )
);

-- Also tighten UPDATE on saving_goal_transactions for consistency
DROP POLICY IF EXISTS "Users can update their own goal transactions" ON public.saving_goal_transactions;
CREATE POLICY "Users can update their own goal transactions"
ON public.saving_goal_transactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.saving_goals sg
    WHERE sg.id = goal_id AND sg.user_id = auth.uid()
  )
);

-- Make admin role update explicit with WITH CHECK
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());