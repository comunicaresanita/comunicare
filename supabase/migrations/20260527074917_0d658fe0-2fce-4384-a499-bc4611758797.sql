
-- BOOKINGS: restrict updates per role
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

CREATE OR REPLACE FUNCTION public.enforce_booking_update_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_patient boolean;
  is_professional boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = OLD.patient_id AND p.user_id = auth.uid())
    INTO is_patient;
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = OLD.professional_id AND p.user_id = auth.uid())
    INTO is_professional;

  IF is_professional AND NOT is_patient THEN
    -- Professionals can only change status (e.g. mark completed/cancelled)
    IF NEW.patient_id IS DISTINCT FROM OLD.patient_id
       OR NEW.professional_id IS DISTINCT FROM OLD.professional_id
       OR NEW.service_name IS DISTINCT FROM OLD.service_name
       OR NEW.price IS DISTINCT FROM OLD.price
       OR NEW.day IS DISTINCT FROM OLD.day
       OR NEW.time_slot IS DISTINCT FROM OLD.time_slot
       OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
       OR NEW.recipient_address IS DISTINCT FROM OLD.recipient_address
       OR NEW.recipient_type IS DISTINCT FROM OLD.recipient_type
       OR NEW.recipient_first_name IS DISTINCT FROM OLD.recipient_first_name
       OR NEW.recipient_last_name IS DISTINCT FROM OLD.recipient_last_name
       OR NEW.lives_in_condominio IS DISTINCT FROM OLD.lives_in_condominio
       OR NEW.floor_number IS DISTINCT FROM OLD.floor_number
       OR NEW.intercom_name IS DISTINCT FROM OLD.intercom_name
       OR NEW.access_notes IS DISTINCT FROM OLD.access_notes
       OR NEW.emergency_contact_name IS DISTINCT FROM OLD.emergency_contact_name
       OR NEW.emergency_contact_phone IS DISTINCT FROM OLD.emergency_contact_phone
       OR NEW.medical_notes IS DISTINCT FROM OLD.medical_notes
    THEN
      RAISE EXCEPTION 'Professionals can only update booking status';
    END IF;
  ELSIF is_patient THEN
    -- Patients cannot change ownership, price, payment, or status
    IF NEW.patient_id IS DISTINCT FROM OLD.patient_id
       OR NEW.professional_id IS DISTINCT FROM OLD.professional_id
       OR NEW.price IS DISTINCT FROM OLD.price
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
    THEN
      RAISE EXCEPTION 'Patients cannot modify ownership, price, status, or payment fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_booking_update_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_booking_update_columns_trg ON public.bookings;
CREATE TRIGGER enforce_booking_update_columns_trg
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.enforce_booking_update_columns();

CREATE POLICY "Patients can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
WITH CHECK (patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update assigned bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
WITH CHECK (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- REVIEWS: enforce booking ownership/completion
DROP POLICY IF EXISTS "Patients can create reviews for completed bookings" ON public.reviews;

CREATE POLICY "Patients can create reviews for completed bookings"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = reviews.booking_id
      AND b.patient_id = reviews.patient_id
      AND b.professional_id = reviews.professional_id
      AND b.status = 'completed'
  )
);
