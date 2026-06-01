
-- Revert column-level revoke; owners need full access to own row
GRANT SELECT ON public.profiles TO authenticated;

-- Drop the row policy added in the previous migration; we'll expose professionals only via the view
DROP POLICY IF EXISTS "Authenticated can view professional public columns" ON public.profiles;

-- Recreate view WITHOUT security_invoker so it bypasses RLS and exposes only safe columns
DROP VIEW IF EXISTS public.public_professionals;
CREATE VIEW public.public_professionals AS
SELECT
  id,
  user_id,
  role,
  first_name,
  last_name,
  bio,
  photo_url,
  lat,
  lng,
  zona,
  professional_type,
  verified,
  numero_opi,
  numero_fnofi,
  partita_iva,
  created_at
FROM public.profiles
WHERE role = 'professionista';

GRANT SELECT ON public.public_professionals TO authenticated, anon;

DROP VIEW IF EXISTS public.my_profile;

-- Lock down trigger function: revoke public EXECUTE (only the trigger needs it)
REVOKE ALL ON FUNCTION public.prevent_patient_sensitive_booking_updates() FROM PUBLIC, anon, authenticated;
