-- Remove the public DELETE policy (only cleanup edge function with service role should delete)
DROP POLICY IF EXISTS "Anyone can delete shared images" ON public.shared_image_files;

-- Replace INSERT policy with a PERMISSIVE one (RESTRICTIVE + public role doesn't work well)
DROP POLICY IF EXISTS "Anyone can insert shared images" ON public.shared_image_files;
CREATE POLICY "Anyone can insert shared images"
  ON public.shared_image_files
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Replace SELECT policy with a PERMISSIVE one  
DROP POLICY IF EXISTS "Anyone can view shared images" ON public.shared_image_files;
CREATE POLICY "Anyone can view shared images"
  ON public.shared_image_files
  FOR SELECT
  TO public
  USING (true);

-- Restrict storage uploads to image file extensions only
DROP POLICY IF EXISTS "Anyone can upload shared images" ON storage.objects;
CREATE POLICY "Anyone can upload shared images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (
    bucket_id = 'shared-images'
    AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'))
  );
