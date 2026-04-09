
-- Add explicit INSERT policy for services
CREATE POLICY "Professionals can insert own services"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK (professional_id IN (
  SELECT profiles.id FROM profiles
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'professionista'
));

-- Add explicit INSERT policy for availability
CREATE POLICY "Professionals can insert own availability"
ON public.availability
FOR INSERT
TO authenticated
WITH CHECK (professional_id IN (
  SELECT profiles.id FROM profiles
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'professionista'
));
