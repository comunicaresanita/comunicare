
CREATE TABLE public.availability_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specific_date DATE NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL,
  is_unavailable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, specific_date, start_time)
);

ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability overrides" ON public.availability_overrides
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Professionals can manage own overrides" ON public.availability_overrides
  FOR ALL TO authenticated
  USING (professional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'professionista'))
  WITH CHECK (professional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'professionista'));
