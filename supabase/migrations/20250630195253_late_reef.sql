/*
  # Create music storage bucket and policies

  1. Storage Setup
    - Create 'music' bucket for TTS audio files
    - Enable public access for generated audio files
    
  2. Security
    - Allow authenticated users to upload their own audio files
    - Allow public read access for generated audio URLs
    - Allow users to delete their own audio files
*/

-- Create the music bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to music files
CREATE POLICY "Public read access for music files" ON storage.objects
FOR SELECT USING (bucket_id = 'music');

-- Allow authenticated users to upload their own audio files
CREATE POLICY "Users can upload their own audio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'music' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own audio files
CREATE POLICY "Users can update their own audio files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'music' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own audio files
CREATE POLICY "Users can delete their own audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'music' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);