CREATE TABLE public.recurring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  amount bigint NOT NULL,
  type text NOT NULL DEFAULT 'expense',
  category text NOT NULL,
  subcategory text,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  description text,
  frequency text NOT NULL DEFAULT 'monthly',
  interval_count integer NOT NULL DEFAULT 1,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  next_run_date date NOT NULL DEFAULT CURRENT_DATE,
  last_run_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_rules TO authenticated;
GRANT ALL ON public.recurring_rules TO service_role;

ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring rules" ON public.recurring_rules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recurring rules" ON public.recurring_rules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring rules" ON public.recurring_rules FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring rules" ON public.recurring_rules FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all recurring rules" ON public.recurring_rules FOR SELECT TO authenticated USING (public.is_admin());

CREATE INDEX idx_recurring_rules_user ON public.recurring_rules(user_id);
CREATE INDEX idx_recurring_rules_due ON public.recurring_rules(next_run_date) WHERE is_active;

CREATE TRIGGER update_recurring_rules_updated_at BEFORE UPDATE ON public.recurring_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recurring_rule_id uuid REFERENCES public.recurring_rules(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_recurring_rule ON public.transactions(recurring_rule_id);

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own push subscriptions" ON public.push_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);

CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();