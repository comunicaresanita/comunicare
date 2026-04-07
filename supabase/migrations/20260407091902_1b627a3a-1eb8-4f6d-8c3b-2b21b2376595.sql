
-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload own photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-photos');

-- Allow users to update/delete own photos
CREATE POLICY "Users can update own photo"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own photo"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add photo_url column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;
