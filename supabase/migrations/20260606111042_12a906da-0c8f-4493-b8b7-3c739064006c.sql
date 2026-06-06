DROP VIEW IF EXISTS public.public_professionals;
CREATE VIEW public.public_professionals AS
SELECT id, role, first_name, last_name, bio, photo_url, lat, lng, zona, professional_type, verified, created_at
FROM public.profiles
WHERE role = 'professionista';
GRANT SELECT ON public.public_professionals TO anon, authenticated;