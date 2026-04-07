ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age integer DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS additional_info text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_caregiver boolean DEFAULT false;