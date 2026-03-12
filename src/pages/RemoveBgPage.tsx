import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2, Eraser } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { downloadImage } from '@/lib/imageProcessing';
import { aiRateLimiter } from '@/lib/rateLimiter';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

const RemoveBgPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setResultUrl(null);
  };

  const handleRemoveBg = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setResultUrl(null);

    try {
      const file = images[0].file;
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { allowed, retryAfterMs } = aiRateLimiter.check();
      if (!allowed) {
        toast.error(`Rate limited. Try again in ${Math.ceil(retryAfterMs / 1000)}s`);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('remove-bg', {
        body: { image: base64 },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.image) {
        setResultUrl(data.image);
        toast.success(t('removeBg.success'));
      } else {
        toast.error(t('removeBg.noResult'));
      }
    } catch (err) {
      console.error('Remove BG error:', err);
      toast.error(t('removeBg.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    fetch(resultUrl)
      .then(r => r.blob())
      .then(blob => downloadImage(blob, `nobg-${images[0]?.file.name || 'image'}.png`));
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('removeBg.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('removeBg.processing')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            {/* Controls */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={handleRemoveBg} disabled={loading} className="flex-1 md:flex-none">
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eraser className="h-4 w-4 mr-2" />
                  )}
                  {loading ? t('removeBg.processingLabel') : t('removeBg.processBtn')}
                </Button>
                {resultUrl && (
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> {t('common.download')}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => { setImages([]); setResultUrl(null); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {images[0] && (
                <p className="text-xs text-muted-foreground mt-2">
                  Resolusi asli: {images[0].width} × {images[0].height} — ukuran dipertahankan
                </p>
              )}
            </div>

            {/* Before / After */}
            {resultUrl ? (
              <BeforeAfterSlider
                beforeSrc={images[0].preview}
                afterSrc={resultUrl}
                beforeLabel="Asli"
                afterLabel="Tanpa Latar"
                className="aspect-auto"
              />
            ) : (
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
                <div className="relative overflow-hidden rounded-xl border border-border/50 flex items-center justify-center bg-muted/30">
                  <img src={images[0].preview} alt="Original" className="max-w-full max-h-[60vh] object-contain" />
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm font-medium text-foreground">{t('removeBg.processingLabel')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveBgPage;
