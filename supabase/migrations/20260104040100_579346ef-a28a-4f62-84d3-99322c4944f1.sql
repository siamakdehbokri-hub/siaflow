-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Only admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Only admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add is_active column to profiles for account status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add last_login column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create function to update last_login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login = now() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- RLS policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all transactions
CREATE POLICY "Admins can delete all transactions"
ON public.transactions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
ON public.categories
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all categories
CREATE POLICY "Admins can delete all categories"
ON public.categories
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all debts
CREATE POLICY "Admins can view all debts"
ON public.debts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all debts
CREATE POLICY "Admins can delete all debts"
ON public.debts
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all saving_goals
CREATE POLICY "Admins can view all saving_goals"
ON public.saving_goals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all saving_goals
CREATE POLICY "Admins can delete all saving_goals"
ON public.saving_goals
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all saving_goal_transactions
CREATE POLICY "Admins can view all saving_goal_transactions"
ON public.saving_goal_transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all saving_goal_transactions
CREATE POLICY "Admins can delete all saving_goal_transactions"
ON public.saving_goal_transactions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));