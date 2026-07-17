
DROP POLICY IF EXISTS "Anyone can update (client-side token check)" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can delete (client-side token check)" ON public.profiles;

REVOKE UPDATE, DELETE ON public.profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_profile(
  p_id UUID,
  p_token UUID,
  p_name TEXT,
  p_branch TEXT,
  p_year TEXT,
  p_hobbies TEXT,
  p_sleeping_schedule TEXT,
  p_smoking TEXT,
  p_gaming TEXT,
  p_instagram TEXT,
  p_whatsapp TEXT,
  p_bio TEXT,
  p_found_roommate BOOLEAN
) RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.profiles;
BEGIN
  UPDATE public.profiles SET
    name = p_name,
    branch = p_branch,
    year = p_year,
    hobbies = p_hobbies,
    sleeping_schedule = p_sleeping_schedule,
    smoking = p_smoking,
    gaming = p_gaming,
    instagram = p_instagram,
    whatsapp = p_whatsapp,
    bio = p_bio,
    found_roommate = p_found_roommate
  WHERE id = p_id AND owner_token = p_token
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Invalid token or profile not found';
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_found_roommate(
  p_id UUID,
  p_token UUID,
  p_found BOOLEAN
) RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.profiles;
BEGIN
  UPDATE public.profiles SET found_roommate = p_found
  WHERE id = p_id AND owner_token = p_token
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Invalid token';
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_profile(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_found_roommate(UUID, UUID, BOOLEAN) TO anon, authenticated;
