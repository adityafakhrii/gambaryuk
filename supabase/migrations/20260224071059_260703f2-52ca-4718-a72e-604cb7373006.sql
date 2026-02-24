
-- Table to track uploaded images with expiry
CREATE TABLE public.shared_image_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  bucket_path TEXT NOT NULL,
  original_name TEXT,
  file_size BIGINT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_image_files ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous uploads)
CREATE POLICY "Anyone can insert shared images"
ON public.shared_image_files
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read (public links)
CREATE POLICY "Anyone can view shared images"
ON public.shared_image_files
FOR SELECT
USING (true);

-- Allow anyone to delete (for cleanup)
CREATE POLICY "Anyone can delete shared images"
ON public.shared_image_files
FOR DELETE
USING (true);
