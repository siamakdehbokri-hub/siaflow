
-- Add admin policies to accounts table
CREATE POLICY "Admins can view all accounts"
ON public.accounts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all accounts"
ON public.accounts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies to transfers table
CREATE POLICY "Admins can view all transfers"
ON public.transfers FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all transfers"
ON public.transfers FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
