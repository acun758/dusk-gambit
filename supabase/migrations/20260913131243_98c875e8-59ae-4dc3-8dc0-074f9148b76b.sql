ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS verify_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS id_tail text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

CREATE POLICY "avatars_read_authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);