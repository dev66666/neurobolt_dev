/*
  # Fix RLS policies for music bucket

  1. Drop existing policies that are too restrictive
  2. Create new policies that allow authenticated users to upload TTS audio
  3. Maintain public read access for generated audio files
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can upload their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;

-- Create more permissive policies for TTS audio uploads
CREATE POLICY "Authenticated users can upload TTS audio" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'music' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update TTS audio" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'music' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete TTS audio" ON storage.objects
FOR DELETE USING (
  bucket_id = 'music' AND 
  auth.role() = 'authenticated'
);

-- Ensure public read access remains
DROP POLICY IF EXISTS "Public read access for music files" ON storage.objects;
CREATE POLICY "Public read access for music files" ON storage.objects
FOR SELECT USING (bucket_id = 'music');