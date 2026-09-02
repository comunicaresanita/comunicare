-- Allow anonymous (not signed-in) visitors to browse the public directory
GRANT SELECT ON public.public_professionals TO anon;
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.availability TO anon;
GRANT SELECT ON public.availability_overrides TO anon;

DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Anyone can view services"
ON public.services FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
CREATE POLICY "Anyone can view availability"
ON public.availability FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view availability overrides" ON public.availability_overrides;
CREATE POLICY "Anyone can view availability overrides"
ON public.availability_overrides FOR SELECT
TO anon, authenticated
USING (true);