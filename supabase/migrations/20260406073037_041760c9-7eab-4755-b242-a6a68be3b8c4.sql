CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, first_name, last_name, email, address, bio, numero_opi, partita_iva, verified)
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
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'paziente') = 'professionista' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$;