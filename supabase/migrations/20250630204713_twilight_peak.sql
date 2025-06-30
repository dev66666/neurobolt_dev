/*
  # Fix RLS policies for music bucket - Final solution

  1. Drop all existing restrictive policies
  2. Create simple, permissive policies for authenticated users
  3. Ensure public read access for video generation services
*/

-- Drop ALL existing policies on storage.objects for music bucket
DROP POLICY IF EXISTS "Users can upload their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload TTS audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update TTS audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete TTS audio" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for music files" ON storage.objects;

-- Create the music bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO NOTHING;

-- Create simple, permissive policies
CREATE POLICY "Anyone can read music files" ON storage.objects
FOR SELECT USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can upload to music bucket" ON storage.objects
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