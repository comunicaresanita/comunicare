CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, role, first_name, last_name, email, address, bio, numero_opi, partita_iva, verified, lat, lng, professional_type, numero_fnofi)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'paziente'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'numero_opi', ''),
    COALESCE(NEW.raw_user_meta_data->>'partita_iva', ''),
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'paziente') = 'professionista' THEN true ELSE false END,
    CASE WHEN NEW.raw_user_meta_data->>'lat' IS NOT NULL THEN (NEW.raw_user_meta_data->>'lat')::double precision ELSE NULL END,
    CASE WHEN NEW.raw_user_meta_data->>'lng' IS NOT NULL THEN (NEW.raw_user_meta_data->>'lng')::double precision ELSE NULL END,
    COALESCE(NEW.raw_user_meta_data->>'professional_type', NULL),
    COALESCE(NEW.raw_user_meta_data->>'numero_fnofi', '')
  );
  RETURN NEW;
END;
$function$;