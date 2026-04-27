ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lives_in_condominio boolean,
  ADD COLUMN IF NOT EXISTS intercom_name text,
  ADD COLUMN IF NOT EXISTS floor_number text,
  ADD COLUMN IF NOT EXISTS access_notes text,
  ADD COLUMN IF NOT EXISTS medical_notes text,
  ADD COLUMN IF NOT EXISTS caregiver_lives_in_condominio boolean,
  ADD COLUMN IF NOT EXISTS caregiver_intercom_name text,
  ADD COLUMN IF NOT EXISTS caregiver_floor_number text,
  ADD COLUMN IF NOT EXISTS caregiver_access_notes text,
  ADD COLUMN IF NOT EXISTS caregiver_emergency_name text,
  ADD COLUMN IF NOT EXISTS caregiver_emergency_phone text,
  ADD COLUMN IF NOT EXISTS caregiver_medical_notes text;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS recipient_type text,
  ADD COLUMN IF NOT EXISTS lives_in_condominio boolean,
  ADD COLUMN IF NOT EXISTS intercom_name text,
  ADD COLUMN IF NOT EXISTS floor_number text,
  ADD COLUMN IF NOT EXISTS access_notes text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS medical_notes text;