-- 1) Fix SECURITY DEFINER view: recreate with security_invoker
DROP VIEW IF EXISTS public.public_professionals;
CREATE VIEW public.public_professionals
WITH (security_invoker = true) AS
SELECT id, user_id, role, first_name, last_name, bio, photo_url, lat, lng, zona,
       professional_type, verified, numero_opi, numero_fnofi, partita_iva, created_at
FROM public.profiles
WHERE role = 'professionista';

GRANT SELECT ON public.public_professionals TO anon, authenticated;

-- 2) Strengthen profiles RLS: explicit WITH CHECK preventing role/verified escalation
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
  AND verified IS NOT DISTINCT FROM (SELECT p.verified FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 3) Strengthen bookings RLS: prevent patients from changing sensitive fields at policy level
DROP POLICY IF EXISTS "Patients can update own bookings" ON public.bookings;
CREATE POLICY "Patients can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND status = (SELECT b.status FROM public.bookings b WHERE b.id = bookings.id)
  AND price = (SELECT b.price FROM public.bookings b WHERE b.id = bookings.id)
  AND professional_id = (SELECT b.professional_id FROM public.bookings b WHERE b.id = bookings.id)
  AND patient_id = (SELECT b.patient_id FROM public.bookings b WHERE b.id = bookings.id)
  AND stripe_session_id IS NOT DISTINCT FROM (SELECT b.stripe_session_id FROM public.bookings b WHERE b.id = bookings.id)
);

-- 4) Restrict reviews: hide patient_id from general public; expose via safe view
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Patients can see their own reviews
CREATE POLICY "Patients can view own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Professionals can see reviews about them (incl. patient_id)
CREATE POLICY "Professionals can view their reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Public-safe view exposing reviews without patient_id for discovery
CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = true) AS
SELECT id, professional_id, booking_id, rating, text, created_at
FROM public.reviews;

GRANT SELECT ON public.public_reviews TO anon, authenticated;