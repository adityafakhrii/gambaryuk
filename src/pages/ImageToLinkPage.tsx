import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone } from '@/components/UploadZone';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link as LinkIcon, Copy, Check, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
}

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  copied: boolean;
}

const ImageToLinkPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesSelected = useCallback((files: ImageFile[]) => {
    setImages((prev) => [...prev, ...files]);
  }, []);

  const handleUpload = async () => {
    if (images.length === 0) return;
    setUploading(true);

    try {
      const results: UploadedImage[] = [];

      for (const img of images) {
        const ext = img.file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error } = await supabase.storage
          .from('shared-images')
          .upload(fileName, img.file, {
            cacheControl: '31536000',
            upsert: false,
          });

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('shared-images')
          .getPublicUrl(fileName);

        results.push({
          id: img.id,
          name: img.file.name,
          url: urlData.publicUrl,
          size: img.file.size,
          copied: false,
        });
      }

      setUploadedImages((prev) => [...prev, ...results]);
      setImages([]);

      toast({
        title: t('common.success'),
        description: t('imageToLink.uploaded').replace('{count}', results.length.toString()),
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: t('error.uploadFailed'),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setUploadedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, copied: true } : img))
    );
    setTimeout(() => {
      setUploadedImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, copied: false } : img))
      );
    }, 2000);
  };

  const copyAll = async () => {
    const allLinks = uploadedImages.map((img) => img.url).join('\n');
    await navigator.clipboard.writeText(allLinks);
    toast({
      title: t('imageToLink.allCopied'),
    });
  };

  const removeUploaded = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('feature.imageToLink.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('feature.imageToLink.desc')}</p>
      </div>

      {/* Upload Zone */}
      <UploadZone onFilesSelected={handleFilesSelected} multiple={true} maxFiles={20} />

      {/* Pending images */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {images.length} {t('imageToLink.readyToUpload')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setImages([])}>
                {t('common.clearAll')}
              </Button>
              <Button size="sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    {t('imageToLink.uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1.5" />
                    {t('imageToLink.generateLinks')}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="rounded-xl overflow-hidden border border-border bg-card">
                <img src={img.preview} alt={img.file.name} className="w-full h-28 object-cover" />
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">{img.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(img.file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded images with links */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              {t('imageToLink.generatedLinks')}
            </h2>
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              {t('imageToLink.copyAll')}
            </Button>
          </div>

          <div className="space-y-2">
            {uploadedImages.map((img) => (
              <div
                key={img.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{img.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{img.url}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(img.url, img.id)}
                  >
                    {img.copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a href={img.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeUploaded(img.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageToLinkPage;
