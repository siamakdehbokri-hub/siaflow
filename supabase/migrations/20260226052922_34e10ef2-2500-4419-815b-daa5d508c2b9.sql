
-- Fix all RLS policies from RESTRICTIVE to PERMISSIVE for all tables
-- This is needed because RESTRICTIVE requires ALL policies to pass,
-- but we want user OR admin policies to grant access.

-- ========== transactions ==========
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete all transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete all transactions" ON public.transactions FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== categories ==========
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete all categories" ON public.categories;

CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all categories" ON public.categories FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete all categories" ON public.categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== saving_goals ==========
DROP POLICY IF EXISTS "Users can view their own saving goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Users can create their own saving goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Users can update their own saving goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Users can delete their own saving goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Admins can view all saving goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Admins can delete all saving goals" ON public.saving_goals;

CREATE POLICY "Users can view their own saving goals" ON public.saving_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saving goals" ON public.saving_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saving goals" ON public.saving_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saving goals" ON public.saving_goals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all saving goals" ON public.saving_goals FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete all saving goals" ON public.saving_goals FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== accounts ==========
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can create their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can delete all accounts" ON public.accounts;

CREATE POLICY "Users can view their own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON public.accounts FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete all accounts" ON public.accounts FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== debts ==========
DROP POLICY IF EXISTS "Users can view their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can create their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can update their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can delete their own debts" ON public.debts;
DROP POLICY IF EXISTS "Admins can view all debts" ON public.debts;
DROP POLICY IF EXISTS "Admins can delete all debts" ON public.debts;

CREATE POLICY "Users can view their own debts" ON public.debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own debts" ON public.debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.debts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.debts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all debts" ON public.debts FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete all debts" ON public.debts FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== transfers ==========
DROP POLICY IF EXISTS "Users can view their own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can create their own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can update their own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can delete their own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Admins can view all transfers" ON public.transfers;
DROP POLICY IF EXISTS "Admins can delete all transfers" ON public.transfers;

CREATE POLICY "Users can view their own transfers" ON public.transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transfers" ON public.transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transfers" ON public.transfers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transfers" ON public.transfers FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transfers" ON public.transfers FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete all transfers" ON public.transfers FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== profiles ==========
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== user_roles ==========
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== saving_goal_transactions ==========
DROP POLICY IF EXISTS "Users can view their own goal transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Users can create their own goal transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Users can update their own goal transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Users can delete their own goal transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Admins can view all goal transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Admins can delete all goal transactions" ON public.saving_goal_transactions;

CREATE POLICY "Users can view their own goal transactions" ON public.saving_goal_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goal transactions" ON public.saving_goal_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goal transactions" ON public.saving_goal_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goal transactions" ON public.saving_goal_transactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all goal transactions" ON public.saving_goal_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete all goal transactions" ON public.saving_goal_transactions FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
