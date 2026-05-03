-- Atomic transfer_to_goal: also bumps goal current_amount and records goal transaction
CREATE OR REPLACE FUNCTION public.transfer_to_goal(_user_id uuid, _from_account_id uuid, _to_goal_id uuid, _amount numeric, _description text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _from_balance numeric;
  _new_goal_amount bigint;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT balance INTO _from_balance
  FROM public.accounts
  WHERE id = _from_account_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;

  IF _from_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  PERFORM 1 FROM public.saving_goals
  WHERE id = _to_goal_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Saving goal not found';
  END IF;

  UPDATE public.accounts
  SET balance = balance - _amount
  WHERE id = _from_account_id AND user_id = auth.uid();

  UPDATE public.saving_goals
  SET current_amount = current_amount + _amount::bigint
  WHERE id = _to_goal_id AND user_id = auth.uid()
  RETURNING current_amount INTO _new_goal_amount;

  INSERT INTO public.transfers (user_id, from_account_id, to_goal_id, amount, description, transfer_type)
  VALUES (auth.uid(), _from_account_id, _to_goal_id, _amount, _description, 'account_to_goal');

  INSERT INTO public.saving_goal_transactions (goal_id, user_id, amount, type, note)
  VALUES (_to_goal_id, auth.uid(), _amount::bigint, 'deposit', _description);

  RETURN jsonb_build_object('success', true, 'new_goal_amount', _new_goal_amount);
END;
$function$;

-- Add positive-amount + same-account validation to transfer_between_accounts
CREATE OR REPLACE FUNCTION public.transfer_between_accounts(_user_id uuid, _from_account_id uuid, _to_account_id uuid, _amount numeric, _description text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _from_balance numeric;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF _from_account_id = _to_account_id THEN
    RAISE EXCEPTION 'Source and destination must differ';
  END IF;

  SELECT balance INTO _from_balance
  FROM public.accounts
  WHERE id = _from_account_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;

  IF _from_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  PERFORM 1 FROM public.accounts
  WHERE id = _to_account_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Destination account not found';
  END IF;

  UPDATE public.accounts
  SET balance = balance - _amount
  WHERE id = _from_account_id AND user_id = auth.uid();

  UPDATE public.accounts
  SET balance = balance + _amount
  WHERE id = _to_account_id AND user_id = auth.uid();

  INSERT INTO public.transfers (user_id, from_account_id, to_account_id, amount, description, transfer_type)
  VALUES (auth.uid(), _from_account_id, _to_account_id, _amount, _description, 'account_to_account');

  RETURN jsonb_build_object('success', true);
END;
$function$;

-- update_goal_amount: also enforce positive amount
CREATE OR REPLACE FUNCTION public.update_goal_amount(_user_id uuid, _goal_id uuid, _amount bigint, _type text, _note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _current bigint;
  _new_amount bigint;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _type NOT IN ('deposit', 'withdraw') THEN
    RAISE EXCEPTION 'Invalid type: must be deposit or withdraw';
  END IF;

  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT current_amount INTO _current
  FROM public.saving_goals
  WHERE id = _goal_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Saving goal not found';
  END IF;

  IF _type = 'deposit' THEN
    _new_amount := _current + _amount;
  ELSE
    _new_amount := GREATEST(0, _current - _amount);
  END IF;

  UPDATE public.saving_goals
  SET current_amount = _new_amount
  WHERE id = _goal_id AND user_id = auth.uid();

  INSERT INTO public.saving_goal_transactions (goal_id, user_id, amount, type, note)
  VALUES (_goal_id, auth.uid(), _amount, _type, _note);

  RETURN jsonb_build_object('success', true, 'new_amount', _new_amount);
END;
$function$;

-- Database-level CHECK constraints (NOT VALID = don't fail on existing rows)
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_amount_positive CHECK (amount > 0) NOT VALID,
  ADD CONSTRAINT transactions_type_valid CHECK (type IN ('income', 'expense', 'saving')) NOT VALID;

ALTER TABLE public.transfers
  ADD CONSTRAINT transfers_amount_positive CHECK (amount > 0) NOT VALID,
  ADD CONSTRAINT transfers_type_valid CHECK (transfer_type IN ('account_to_account', 'account_to_goal')) NOT VALID,
  ADD CONSTRAINT transfers_accounts_differ CHECK (from_account_id IS DISTINCT FROM to_account_id) NOT VALID;

ALTER TABLE public.saving_goals
  ADD CONSTRAINT saving_goals_target_positive CHECK (target_amount > 0) NOT VALID,
  ADD CONSTRAINT saving_goals_current_nonneg CHECK (current_amount >= 0) NOT VALID;

ALTER TABLE public.saving_goal_transactions
  ADD CONSTRAINT saving_goal_tx_amount_positive CHECK (amount > 0) NOT VALID,
  ADD CONSTRAINT saving_goal_tx_type_valid CHECK (type IN ('deposit', 'withdraw')) NOT VALID;

ALTER TABLE public.debts
  ADD CONSTRAINT debts_total_positive CHECK (total_amount > 0) NOT VALID,
  ADD CONSTRAINT debts_paid_nonneg CHECK (paid_amount >= 0) NOT VALID,
  ADD CONSTRAINT debts_paid_le_total CHECK (paid_amount <= total_amount) NOT VALID;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_type_valid CHECK (type IN ('income', 'expense', 'saving')) NOT VALID,
  ADD CONSTRAINT categories_budget_nonneg CHECK (budget IS NULL OR budget >= 0) NOT VALID;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_type_valid CHECK (type IN ('checking', 'savings', 'cash', 'credit', 'investment')) NOT VALID;