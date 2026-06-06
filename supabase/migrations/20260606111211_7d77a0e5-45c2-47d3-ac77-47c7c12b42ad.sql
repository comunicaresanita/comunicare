CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only constrain changes initiated by an authenticated end-user.
  -- The handle_new_user() SECURITY DEFINER function runs with auth.uid() = NULL
  -- (it executes from the auth schema trigger), so signup-time inserts are
  -- unaffected and the role coming from auth metadata is preserved.
  IF auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      -- Authenticated users may never self-create a privileged profile row.
      NEW.role := 'paziente';
      NEW.verified := false;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.role IS DISTINCT FROM OLD.role THEN
        NEW.role := OLD.role;
      END IF;
      IF NEW.verified IS DISTINCT FROM OLD.verified THEN
        NEW.verified := OLD.verified;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trg
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();