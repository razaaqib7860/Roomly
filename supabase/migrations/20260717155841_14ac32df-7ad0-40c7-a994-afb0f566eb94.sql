
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  year TEXT NOT NULL,
  hobbies TEXT NOT NULL DEFAULT '',
  sleeping_schedule TEXT NOT NULL DEFAULT 'flexible',
  smoking TEXT NOT NULL DEFAULT 'no',
  gaming TEXT NOT NULL DEFAULT 'no',
  instagram TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  found_roommate BOOLEAN NOT NULL DEFAULT false,
  owner_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create a profile"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update (client-side token check)"
  ON public.profiles FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete (client-side token check)"
  ON public.profiles FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
