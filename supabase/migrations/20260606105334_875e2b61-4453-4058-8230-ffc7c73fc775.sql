
ALTER VIEW public.public_professionals SET (security_invoker = true);

DROP POLICY IF EXISTS "Professionals can update assigned bookings" ON public.bookings;

CREATE POLICY "Professionals can update assigned bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  professional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
)
WITH CHECK (
  professional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
  AND professional_id = (SELECT b.professional_id FROM bookings b WHERE b.id = bookings.id)
  AND patient_id      = (SELECT b.patient_id FROM bookings b WHERE b.id = bookings.id)
  AND price           = (SELECT b.price FROM bookings b WHERE b.id = bookings.id)
  AND service_name    = (SELECT b.service_name FROM bookings b WHERE b.id = bookings.id)
  AND day             = (SELECT b.day FROM bookings b WHERE b.id = bookings.id)
  AND time_slot       = (SELECT b.time_slot FROM bookings b WHERE b.id = bookings.id)
  AND NOT (stripe_session_id IS DISTINCT FROM (SELECT b.stripe_session_id FROM bookings b WHERE b.id = bookings.id))
);
