import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { downloadImage } from '@/lib/imageProcessing';
import { aiRateLimiter } from '@/lib/rateLimiter';

const UpscalePage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [scale, setScale] = useState('2');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setResultUrl(null);
  };

  const handleUpscale = async () => {
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

      const { data, error } = await supabase.functions.invoke('upscale', {
        body: { image: base64, scale: parseInt(scale) },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.image) {
        setResultUrl(data.image);
        toast.success(t('common.success'));
      } else {
        toast.error(t('upscale.noResult'));
      }
    } catch (err) {
      console.error('Upscale error:', err);
      toast.error(t('upscale.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    // Convert base64 to blob
    fetch(resultUrl)
      .then(r => r.blob())
      .then(blob => downloadImage(blob, `upscaled-${images[0]?.file.name || 'image'}.png`));
  };

  return (
    <div className="min-h-full">
      <SEO title={t('upscale.title')} description={t('feature.upscale.desc')} path="/upscale" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.upscale.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.upscale.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            {/* Controls */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">{t('upscale.scale')}</Label>
                  <Select value={scale} onValueChange={setScale}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2× {t('upscale.enhance')}</SelectItem>
                      <SelectItem value="4">4× {t('upscale.enhance')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleUpscale} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {loading ? t('common.processing') : t('upscale.process')}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setImages([]); setResultUrl(null); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Before / After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t('common.original')}</h3>
                <img src={images[0].preview} alt="Original" className="w-full rounded-xl border border-border/50" />
                <p className="text-xs text-muted-foreground mt-2">{images[0].width} × {images[0].height}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t('common.result')}</h3>
                {resultUrl ? (
                  <>
                    <img src={resultUrl} alt="Upscaled" className="w-full rounded-xl border border-border/50" />
                    <Button size="sm" className="mt-3" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" /> {t('common.download')}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-border/50 text-muted-foreground text-sm">
                    {loading ? t('common.processing') : t('upscale.hint')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpscalePage;
