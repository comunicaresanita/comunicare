ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partita_iva text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;