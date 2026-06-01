
-- 1) Prevent patients from updating sensitive booking columns (status, price, stripe_session_id)
CREATE OR REPLACE FUNCTION public.prevent_patient_sensitive_booking_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_patient boolean;
  is_professional boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND id = NEW.patient_id
  ) INTO is_patient;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND id = NEW.professional_id
  ) INTO is_professional;

  IF is_patient AND NOT is_professional THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Patients cannot modify booking status';
    END IF;
    IF NEW.price IS DISTINCT FROM OLD.price THEN
      RAISE EXCEPTION 'Patients cannot modify booking price';
    END IF;
    IF NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id THEN
      RAISE EXCEPTION 'Patients cannot modify payment session';
    END IF;
    IF NEW.professional_id IS DISTINCT FROM OLD.professional_id THEN
      RAISE EXCEPTION 'Patients cannot reassign booking professional';
    END IF;
    IF NEW.patient_id IS DISTINCT FROM OLD.patient_id THEN
      RAISE EXCEPTION 'Patients cannot reassign booking patient';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_prevent_patient_sensitive_updates ON public.bookings;
CREATE TRIGGER bookings_prevent_patient_sensitive_updates
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_patient_sensitive_booking_updates();

-- 2) Restrict professional profile exposure
DROP POLICY IF EXISTS "Anyone authenticated can view professional profiles" ON public.profiles;

CREATE OR REPLACE VIEW public.public_professionals
WITH (security_invoker = true) AS
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

-- New permissive policy: authenticated users can SELECT only public-safe columns of professional rows
-- We achieve column-level safety by exposing the view, which only references safe columns.
-- Re-add a row policy that only allows the view (which uses security_invoker) to read professional rows;
-- since the view selects only safe columns, sensitive ones remain inaccessible.
CREATE POLICY "Authenticated can view professional public columns"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'professionista');

-- Note: The above policy still technically permits direct SELECT of all columns at the table level.
-- To enforce column-level restriction, revoke column privileges on sensitive columns from authenticated,
-- but keep them for service_role and for the row owner via a SECURITY DEFINER helper if needed.
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (
  id, user_id, role, first_name, last_name, bio, photo_url,
  lat, lng, zona, professional_type, verified,
  numero_opi, numero_fnofi, partita_iva, created_at, email
) ON public.profiles TO authenticated;

-- Allow owners to read their own private columns via a SECURITY DEFINER function/view
CREATE OR REPLACE VIEW public.my_profile
WITH (security_invoker = true) AS
SELECT * FROM public.profiles WHERE user_id = auth.uid();

GRANT SELECT ON public.my_profile TO authenticated;
GRANT SELECT ON public.public_professionals TO authenticated, anon;
