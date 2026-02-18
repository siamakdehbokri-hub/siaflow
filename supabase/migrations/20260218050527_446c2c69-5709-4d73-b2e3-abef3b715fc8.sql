
-- ============================================================
-- FIX 1: Change all RESTRICTIVE RLS policies to PERMISSIVE
-- Current: All policies are RESTRICTIVE (AND logic) which means
-- admin policies AND user policies must BOTH pass.
-- Fix: Make them PERMISSIVE (OR logic) so EITHER admin OR owner passes.
-- ============================================================

-- ============ TRANSACTIONS ============
DROP POLICY IF EXISTS "Admins can delete all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete all transactions" ON public.transactions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ CATEGORIES ============
DROP POLICY IF EXISTS "Admins can delete all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;

CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all categories" ON public.categories FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create their own categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete all categories" ON public.categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ DEBTS ============
DROP POLICY IF EXISTS "Admins can delete all debts" ON public.debts;
DROP POLICY IF EXISTS "Admins can view all debts" ON public.debts;
DROP POLICY IF EXISTS "Users can create their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can delete their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can update their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can view their own debts" ON public.debts;

CREATE POLICY "Users can view their own debts" ON public.debts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all debts" ON public.debts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create their own debts" ON public.debts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.debts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.debts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete all debts" ON public.debts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ ACCOUNTS ============
DROP POLICY IF EXISTS "Admins can delete all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can create their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;

CREATE POLICY "Users can view their own accounts" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON public.accounts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create their own accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete all accounts" ON public.accounts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ TRANSFERS ============
DROP POLICY IF EXISTS "Admins can delete all transfers" ON public.transfers;
DROP POLICY IF EXISTS "Admins can view all transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can create their own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can delete their own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can update their own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can view their own transfers" ON public.transfers;

CREATE POLICY "Users can view their own transfers" ON public.transfers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transfers" ON public.transfers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create their own transfers" ON public.transfers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transfers" ON public.transfers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transfers" ON public.transfers FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete all transfers" ON public.transfers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ SAVING_GOALS ============
DROP POLICY IF EXISTS "Admins can delete all saving_goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Admins can view all saving_goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Users can create their own saving goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Users can delete their own saving goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Users can update their own saving goals" ON public.saving_goals;
DROP POLICY IF EXISTS "Users can view their own saving goals" ON public.saving_goals;

CREATE POLICY "Users can view their own saving goals" ON public.saving_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all saving goals" ON public.saving_goals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create their own saving goals" ON public.saving_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saving goals" ON public.saving_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saving goals" ON public.saving_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete all saving goals" ON public.saving_goals FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ SAVING_GOAL_TRANSACTIONS ============
DROP POLICY IF EXISTS "Admins can delete all saving_goal_transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Admins can view all saving_goal_transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Users can create their own goal transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Users can delete their own goal transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Users can update their own goal transactions" ON public.saving_goal_transactions;
DROP POLICY IF EXISTS "Users can view their own goal transactions" ON public.saving_goal_transactions;

CREATE POLICY "Users can view their own goal transactions" ON public.saving_goal_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all goal transactions" ON public.saving_goal_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create their own goal transactions" ON public.saving_goal_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goal transactions" ON public.saving_goal_transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goal transactions" ON public.saving_goal_transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete all goal transactions" ON public.saving_goal_transactions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ PROFILES ============
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ USER_ROLES ============
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- FIX 2: Add missing indexes on foreign keys
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_account_id ON public.transfers(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_account_id ON public.transfers(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_goal_id ON public.transfers(to_goal_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_saving_goals_user_id ON public.saving_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_saving_goal_transactions_user_id ON public.saving_goal_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_saving_goal_transactions_goal_id ON public.saving_goal_transactions(goal_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
