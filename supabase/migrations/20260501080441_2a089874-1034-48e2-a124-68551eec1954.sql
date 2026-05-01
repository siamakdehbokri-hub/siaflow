
-- Harden has_role: create a stricter variant that always uses auth.uid()
-- and update all RLS policies to use it. Then revoke execute on the
-- legacy parameterized version from anon/authenticated roles.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
$$;

-- Restrict execution: only postgres/service_role may call these directly.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Re-create admin RLS policies to use is_admin() instead of has_role(auth.uid(), 'admin')

-- accounts
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
CREATE POLICY "Admins can view all accounts" ON public.accounts
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete all accounts" ON public.accounts;
CREATE POLICY "Admins can delete all accounts" ON public.accounts
  FOR DELETE USING (public.is_admin());

-- categories
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
CREATE POLICY "Admins can view all categories" ON public.categories
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete all categories" ON public.categories;
CREATE POLICY "Admins can delete all categories" ON public.categories
  FOR DELETE USING (public.is_admin());

-- debts
DROP POLICY IF EXISTS "Admins can view all debts" ON public.debts;
CREATE POLICY "Admins can view all debts" ON public.debts
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete all debts" ON public.debts;
CREATE POLICY "Admins can delete all debts" ON public.debts
  FOR DELETE USING (public.is_admin());

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- saving_goal_transactions
DROP POLICY IF EXISTS "Admins can view all goal transactions" ON public.saving_goal_transactions;
CREATE POLICY "Admins can view all goal transactions" ON public.saving_goal_transactions
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete all goal transactions" ON public.saving_goal_transactions;
CREATE POLICY "Admins can delete all goal transactions" ON public.saving_goal_transactions
  FOR DELETE USING (public.is_admin());

-- saving_goals
DROP POLICY IF EXISTS "Admins can view all saving goals" ON public.saving_goals;
CREATE POLICY "Admins can view all saving goals" ON public.saving_goals
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete all saving goals" ON public.saving_goals;
CREATE POLICY "Admins can delete all saving goals" ON public.saving_goals
  FOR DELETE USING (public.is_admin());

-- transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete all transactions" ON public.transactions;
CREATE POLICY "Admins can delete all transactions" ON public.transactions
  FOR DELETE USING (public.is_admin());

-- transfers
DROP POLICY IF EXISTS "Admins can view all transfers" ON public.transfers;
CREATE POLICY "Admins can view all transfers" ON public.transfers
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete all transfers" ON public.transfers;
CREATE POLICY "Admins can delete all transfers" ON public.transfers
  FOR DELETE USING (public.is_admin());

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.is_admin());
