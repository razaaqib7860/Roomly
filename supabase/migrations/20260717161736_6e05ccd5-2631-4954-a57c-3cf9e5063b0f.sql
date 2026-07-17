
DROP FUNCTION IF EXISTS public.update_profile(uuid, uuid, text, text, text, text, text, text, text, text, text, text, boolean);
DROP FUNCTION IF EXISTS public.set_found_roommate(uuid, uuid, boolean);
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  year TEXT NOT NULL,
  photo_url TEXT,
  hobbies TEXT NOT NULL DEFAULT '',
  sleeping_schedule TEXT NOT NULL DEFAULT 'flexible',
  smoking TEXT NOT NULL DEFAULT 'no',
  gaming TEXT NOT NULL DEFAULT 'no',
  religion TEXT,
  block_pref TEXT,
  room_pref TEXT,
  looking_for TEXT,
  instagram TEXT,
  whatsapp TEXT,
  bio TEXT,
  found_roommate BOOLEAN NOT NULL DEFAULT false,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users read same-year profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    onboarded = true
    AND found_roommate = false
    AND year = (SELECT year FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own profile" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.enforce_iiitranchi_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR lower(split_part(NEW.email, '@', 2)) <> 'iiitranchi.ac.in' THEN
    RAISE EXCEPTION 'Only @iiitranchi.ac.in email addresses are allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_iiitranchi_email_trigger ON auth.users;
CREATE TRIGGER enforce_iiitranchi_email_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_iiitranchi_email();

-- Storage: bucket already created; add RLS on storage.objects
CREATE POLICY "Signed-in read profile photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users upload own photo" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own photo" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own photo" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
