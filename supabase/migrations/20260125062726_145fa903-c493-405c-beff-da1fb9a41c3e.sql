-- Add missing UPDATE/DELETE policies for transfers so users can correct mistakes

DO $$
BEGIN
  -- UPDATE policy
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transfers'
      AND policyname = 'Users can update their own transfers'
  ) THEN
    CREATE POLICY "Users can update their own transfers"
    ON public.transfers
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- DELETE policy
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transfers'
      AND policyname = 'Users can delete their own transfers'
  ) THEN
    CREATE POLICY "Users can delete their own transfers"
    ON public.transfers
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;