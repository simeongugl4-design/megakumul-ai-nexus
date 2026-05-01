
-- Add preference columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_save boolean NOT NULL DEFAULT true;

-- Constrain theme values via trigger (CHECK constraints are fine for static values; using trigger for flexibility)
CREATE OR REPLACE FUNCTION public.validate_profile_theme()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.theme NOT IN ('dark','light','system') THEN
    RAISE EXCEPTION 'Invalid theme value: %', NEW.theme;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_theme_trg ON public.profiles;
CREATE TRIGGER validate_profile_theme_trg
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_profile_theme();

-- Device tokens for push notifications
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

CREATE OR REPLACE FUNCTION public.validate_device_platform()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.platform NOT IN ('ios','android','web') THEN
    RAISE EXCEPTION 'Invalid platform value: %', NEW.platform;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_device_platform_trg ON public.device_tokens;
CREATE TRIGGER validate_device_platform_trg
BEFORE INSERT OR UPDATE ON public.device_tokens
FOR EACH ROW EXECUTE FUNCTION public.validate_device_platform();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS device_tokens_touch ON public.device_tokens;
CREATE TRIGGER device_tokens_touch
BEFORE UPDATE ON public.device_tokens
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own device tokens"
  ON public.device_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own device tokens"
  ON public.device_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own device tokens"
  ON public.device_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own device tokens"
  ON public.device_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
