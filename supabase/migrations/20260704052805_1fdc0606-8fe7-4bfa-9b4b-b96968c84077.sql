CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions USING btree (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_categories_user_created ON public.categories USING btree (user_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_saving_goals_user_created ON public.saving_goals USING btree (user_id, created_at DESC);