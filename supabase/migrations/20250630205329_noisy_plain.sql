/*
  # Fix storage policies for TTS audio uploads

  1. Update music bucket policies to be less restrictive
  2. Allow authenticated users to upload TTS audio files
  3. Maintain public read access for generated audio URLs
*/

-- Ensure the music bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO NOTHING;

-- Drop all existing policies for music bucket to start fresh
DROP POLICY IF EXISTS "Anyone can read music files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to music bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update music files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete music files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for music files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;

-- Create simple, permissive policies for TTS audio
CREATE POLICY "Public can read music files" ON storage.objects
FOR SELECT USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can upload music files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'music' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update music files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'music' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete music files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'music' AND 
  auth.uid() IS NOT NULL
);