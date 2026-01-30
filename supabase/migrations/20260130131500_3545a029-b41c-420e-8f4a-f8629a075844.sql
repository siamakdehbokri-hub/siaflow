-- Add UPDATE policy to user_roles table for admins only
-- This completes the authorization model by ensuring only admins can modify role assignments

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));