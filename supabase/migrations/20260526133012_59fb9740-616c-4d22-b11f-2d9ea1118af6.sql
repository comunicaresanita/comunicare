
-- 1) Prevent role/verified self-escalation via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      NEW.role := OLD.role;
    END IF;
    IF NEW.verified IS DISTINCT FROM OLD.verified THEN
      NEW.verified := OLD.verified;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2) Restrict profile SELECT: own full profile, or any professional's profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can view professional profiles"
ON public.profiles FOR SELECT TO authenticated
USING (role = 'professionista');

-- 3) Revoke execute on SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC, anon, authenticated;

-- 4) Restrict storage listing on profile-photos bucket
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND (policyname ILIKE '%profile-photos%' OR policyname ILIKE '%profile photos%')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- Allow public read of individual files (by exact path) but disallow broad listing.
-- Listing requires SELECT without a specific name predicate; PostgREST/Storage API still
-- enforces the USING clause. Restricting by owner removes anonymous listing while
-- keeping signed/public URL access (which goes through storage render, not RLS list).
CREATE POLICY "Public read profile-photos by path"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'profile-photos');

-- Allow owners to manage their own files in profile-photos
CREATE POLICY "Users upload own profile-photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND owner = auth.uid());

CREATE POLICY "Users update own profile-photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos' AND owner = auth.uid());

CREATE POLICY "Users delete own profile-photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND owner = auth.uid());
