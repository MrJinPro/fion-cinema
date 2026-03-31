DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_reviews'
      AND policyname = 'Admins can view all reviews'
  ) THEN
    CREATE POLICY "Admins can view all reviews"
    ON public.user_reviews
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_reviews'
      AND policyname = 'Admins can update reviews'
  ) THEN
    CREATE POLICY "Admins can update reviews"
    ON public.user_reviews
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_reviews'
      AND policyname = 'Admins can delete reviews'
  ) THEN
    CREATE POLICY "Admins can delete reviews"
    ON public.user_reviews
    FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
