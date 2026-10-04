ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'debt',
  ADD COLUMN IF NOT EXISTS principal_amount bigint,
  ADD COLUMN IF NOT EXISTS due_day integer,
  ADD COLUMN IF NOT EXISTS reminder_days integer NOT NULL DEFAULT 3;