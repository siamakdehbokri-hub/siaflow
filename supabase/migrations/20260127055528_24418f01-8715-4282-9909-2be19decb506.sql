-- Make avatars bucket private for better security
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Create a new policy that allows only authenticated users to view avatars
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');