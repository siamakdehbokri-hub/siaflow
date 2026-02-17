
-- 1. Atomic transfer between accounts
CREATE OR REPLACE FUNCTION public.transfer_between_accounts(
  _user_id uuid,
  _from_account_id uuid,
  _to_account_id uuid,
  _amount numeric,
  _description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _from_balance numeric;
BEGIN
  -- Lock and get source balance
  SELECT balance INTO _from_balance
  FROM public.accounts
  WHERE id = _from_account_id AND user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;

  IF _from_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Lock destination
  PERFORM 1 FROM public.accounts
  WHERE id = _to_account_id AND user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Destination account not found';
  END IF;

  -- Debit source
  UPDATE public.accounts
  SET balance = balance - _amount
  WHERE id = _from_account_id AND user_id = _user_id;

  -- Credit destination
  UPDATE public.accounts
  SET balance = balance + _amount
  WHERE id = _to_account_id AND user_id = _user_id;

  -- Record transfer
  INSERT INTO public.transfers (user_id, from_account_id, to_account_id, amount, description, transfer_type)
  VALUES (_user_id, _from_account_id, _to_account_id, _amount, _description, 'account_to_account');

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 2. Atomic transfer to saving goal
CREATE OR REPLACE FUNCTION public.transfer_to_goal(
  _user_id uuid,
  _from_account_id uuid,
  _to_goal_id uuid,
  _amount numeric,
  _description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _from_balance numeric;
BEGIN
  -- Lock and get source balance
  SELECT balance INTO _from_balance
  FROM public.accounts
  WHERE id = _from_account_id AND user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;

  IF _from_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Lock goal
  PERFORM 1 FROM public.saving_goals
  WHERE id = _to_goal_id AND user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Saving goal not found';
  END IF;

  -- Debit source account
  UPDATE public.accounts
  SET balance = balance - _amount
  WHERE id = _from_account_id AND user_id = _user_id;

  -- Record transfer
  INSERT INTO public.transfers (user_id, from_account_id, to_goal_id, amount, description, transfer_type)
  VALUES (_user_id, _from_account_id, _to_goal_id, _amount, _description, 'account_to_goal');

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 3. Atomic goal amount update with transaction recording
CREATE OR REPLACE FUNCTION public.update_goal_amount(
  _user_id uuid,
  _goal_id uuid,
  _amount bigint,
  _type text,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _current bigint;
  _new_amount bigint;
BEGIN
  IF _type NOT IN ('deposit', 'withdraw') THEN
    RAISE EXCEPTION 'Invalid type: must be deposit or withdraw';
  END IF;

  -- Lock and get current amount
  SELECT current_amount INTO _current
  FROM public.saving_goals
  WHERE id = _goal_id AND user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Saving goal not found';
  END IF;

  IF _type = 'deposit' THEN
    _new_amount := _current + _amount;
  ELSE
    _new_amount := GREATEST(0, _current - _amount);
  END IF;

  -- Update goal
  UPDATE public.saving_goals
  SET current_amount = _new_amount
  WHERE id = _goal_id AND user_id = _user_id;

  -- Record transaction
  INSERT INTO public.saving_goal_transactions (goal_id, user_id, amount, type, note)
  VALUES (_goal_id, _user_id, _amount, _type, _note);

  RETURN jsonb_build_object('success', true, 'new_amount', _new_amount);
END;
$$;
