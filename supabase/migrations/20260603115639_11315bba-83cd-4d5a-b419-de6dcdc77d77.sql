-- Restore public_professionals as a SECURITY DEFINER-style view (no security_invoker)
-- Rationale: the view is a deliberate public projection of NON-SENSITIVE columns of
-- profiles WHERE role='professionista'. With security_invoker=true it inherited the
-- profiles RLS ("users can view own profile only"), which hid all professionals from
-- patients and broke the map / search. Running as view owner bypasses RLS but only
-- exposes the safe columns enumerated below — no contact info, no address, no caregiver/medical data.

DROP VIEW IF EXISTS public.public_professionals;
CREATE VIEW public.public_professionals AS
SELECT id, user_id, role, first_name, last_name, bio, photo_url, lat, lng, zona,
       professional_type, verified, numero_opi, numero_fnofi, partita_iva, created_at
FROM public.profiles
WHERE role = 'professionista';

GRANT SELECT ON public.public_professionals TO anon, authenticated;