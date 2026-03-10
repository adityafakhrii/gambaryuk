import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone } from '@/components/UploadZone';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link as LinkIcon, Copy, Check, ExternalLink, Trash2, Loader2, Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JSZip from 'jszip';

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

type ExpiryOption = '24h' | '7d' | '30d' | '90d' | 'forever';

const getExpiryDate = (option: ExpiryOption): string | null => {
  const now = new Date();
  switch (option) {
    case '24h': return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case '7d': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d': return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90d': return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    case 'forever': return null;
  }
};

const ImageToLinkPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [expiry, setExpiry] = useState<ExpiryOption>('7d');
  const [downloadingZip, setDownloadingZip] = useState(false);

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

        // Track in DB with expiry
        await supabase.from('shared_image_files').insert({
          file_name: fileName,
          bucket_path: fileName,
          original_name: img.file.name,
          file_size: img.file.size,
          expires_at: getExpiryDate(expiry),
        });

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
    toast({ title: t('imageToLink.allCopied') });
  };

  const downloadAllAsZip = async () => {
    if (uploadedImages.length === 0) return;
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      for (const img of uploadedImages) {
        const response = await fetch(img.url);
        const blob = await response.blob();
        zip.file(img.name, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to create ZIP', variant: 'destructive' });
    } finally {
      setDownloadingZip(false);
    }
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('feature.imageToLink.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('feature.imageToLink.desc')}</p>
      </div>

      {/* Upload Zone */}
      <UploadZone onFilesSelected={handleFilesSelected} multiple={true} maxFiles={20} />

      {/* Pending images */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              {images.length} {t('imageToLink.readyToUpload')}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Expiry selector */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select value={expiry} onValueChange={(v) => setExpiry(v as ExpiryOption)}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">{t('imageToLink.expiry.24h')}</SelectItem>
                    <SelectItem value="7d">{t('imageToLink.expiry.7d')}</SelectItem>
                    <SelectItem value="30d">{t('imageToLink.expiry.30d')}</SelectItem>
                    <SelectItem value="90d">{t('imageToLink.expiry.90d')}</SelectItem>
                    <SelectItem value="forever">{t('imageToLink.expiry.forever')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              {t('imageToLink.generatedLinks')}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyAll}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                {t('imageToLink.copyAll')}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadAllAsZip} disabled={downloadingZip}>
                {downloadingZip ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                )}
                {t('imageToLink.downloadAllZip')}
              </Button>
            </div>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
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
