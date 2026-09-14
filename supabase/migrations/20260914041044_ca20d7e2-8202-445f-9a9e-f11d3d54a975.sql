-- Extend debts for long-term installment tracking
ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS installment_count integer,
  ADD COLUMN IF NOT EXISTS installment_amount bigint,
  ADD COLUMN IF NOT EXISTS frequency text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS next_due_date date,
  ADD COLUMN IF NOT EXISTS interest_rate numeric NOT NULL DEFAULT 0;

-- Payment history for debts (part-by-part payments)
CREATE TABLE IF NOT EXISTS public.debt_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id uuid NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount bigint NOT NULL,
  paid_at date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debt_payments TO authenticated;
GRANT ALL ON public.debt_payments TO service_role;

ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debt payments"
  ON public.debt_payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debt payments"
  ON public.debt_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.debts d WHERE d.id = debt_payments.debt_id AND d.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own debt payments"
  ON public.debt_payments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt payments"
  ON public.debt_payments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all debt payments"
  ON public.debt_payments FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON public.debt_payments(debt_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_debt_payments_user ON public.debt_payments(user_id, paid_at DESC);

-- Atomic installment payment: records history and updates the debt balance
CREATE OR REPLACE FUNCTION public.pay_debt_installment(
  _debt_id uuid,
  _amount bigint,
  _paid_at date DEFAULT CURRENT_DATE,
  _note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total bigint;
  _paid bigint;
  _new_paid bigint;
  _freq text;
  _next date;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT total_amount, paid_amount, frequency, next_due_date
    INTO _total, _paid, _freq, _next
  FROM public.debts
  WHERE id = _debt_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Debt not found';
  END IF;

  _new_paid := LEAST(_paid + _amount, _total);

  INSERT INTO public.debt_payments (debt_id, user_id, amount, paid_at, note)
  VALUES (_debt_id, auth.uid(), _amount, COALESCE(_paid_at, CURRENT_DATE), _note);

  IF _next IS NOT NULL AND _new_paid < _total THEN
    _next := CASE _freq
      WHEN 'weekly' THEN _next + interval '7 days'
      WHEN 'biweekly' THEN _next + interval '14 days'
      WHEN 'quarterly' THEN _next + interval '3 months'
      WHEN 'yearly' THEN _next + interval '1 year'
      ELSE _next + interval '1 month'
    END;
  END IF;

  UPDATE public.debts
  SET paid_amount = _new_paid,
      next_due_date = CASE WHEN _new_paid >= _total THEN NULL ELSE _next END
  WHERE id = _debt_id AND user_id = auth.uid();

  RETURN jsonb_build_object('success', true, 'paid_amount', _new_paid, 'next_due_date', _next);
END;
$$;

REVOKE ALL ON FUNCTION public.pay_debt_installment(uuid, bigint, date, text) FROM public;
GRANT EXECUTE ON FUNCTION public.pay_debt_installment(uuid, bigint, date, text) TO authenticated;