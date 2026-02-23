
-- Create storage bucket for shared images
INSERT INTO storage.buckets (id, name, public) VALUES ('shared-images', 'shared-images', true);

-- Allow anyone to view shared images
CREATE POLICY "Shared images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'shared-images');

-- Allow anonymous uploads to shared images
CREATE POLICY "Anyone can upload shared images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shared-images');
