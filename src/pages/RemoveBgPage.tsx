import { SEO } from '@/components/SEO';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2, Eraser, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { downloadImage, dataUriToBlob, removeCheckerboardBackground } from '@/lib/imageProcessing';
import { aiRateLimiter } from '@/lib/rateLimiter';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { OfflineGuard } from '@/components/OfflineGuard';

const RemoveBgPage = () => {
  const { t, language } = useLanguage();
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
        // Post-process: convert AI checkerboard to true transparency
        const transparentImage = await removeCheckerboardBackground(data.image);
        setResultUrl(transparentImage);
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
    const blob = dataUriToBlob(resultUrl);
    downloadImage(blob, `nobg-${images[0]?.file.name || 'image'}.png`);
  };

  const schemaData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": language === 'id' ? "Hapus Background Foto Online - GambarYuk" : "Remove Image Background Online - GambarYuk",
      "url": "https://gambaryuk.com/remove-bg",
      "description": language === 'id'
        ? "Hapus latar belakang foto secara otomatis dan gratis menggunakan teknologi AI berbasis web."
        : "Remove photo background automatically and for free using web-based AI technology.",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires HTML5 support",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IDR"
      }
    };
  }, [language]);

  return (
    <div className="min-h-full">
      <SEO 
        title={t('removeBg.title')} 
        description={t('feature.removeBg.desc')} 
        path="/remove-bg" 
        schema={schemaData}
      />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('removeBg.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.removeBg.desc')}</p>
        </div>

        <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-start gap-3 text-amber-600 dark:text-amber-400">
          <Sparkles className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-left text-xs md:text-sm leading-relaxed">
            <p className="font-semibold">{t('common.betaTitle')}</p>
            <p className="mt-0.5 opacity-90">{t('common.betaDesc')}</p>
          </div>
        </div>

        <OfflineGuard featureNameKey="removeBg.title">
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
        </OfflineGuard>

        {/* SEO & AEO Content Section */}
        <section className="mt-16 border-t border-border/50 pt-12 max-w-4xl mx-auto space-y-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'id' ? 'Cara Menghapus Background Foto Secara Online & Otomatis' : 'How to Remove Photo Background Online & Automatically'}
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                {language === 'id' 
                  ? 'Unggah gambar JPG, PNG, atau WebP yang ingin Anda hapus latar belakangnya.' 
                  : 'Upload the JPG, PNG, or WebP image you want to remove the background from.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Klik tombol "Hapus Background" untuk memproses gambar menggunakan kecerdasan buatan.' 
                  : 'Click the "Remove Background" button to process the image using artificial intelligence.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Gunakan slider Before/After untuk melihat perbandingan hasil gambar asli dengan gambar transparan.' 
                  : 'Use the Before/After slider to compare the original image with the transparent result.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Klik tombol "Unduh" untuk menyimpan gambar berformat PNG transparan hasil pemrosesan.' 
                  : 'Click the "Download" button to save the processed transparent PNG image.'}
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'id' ? 'Pertanyaan yang Sering Diajukan (FAQ)' : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/50 p-5">
                <h3 className="font-semibold text-foreground mb-2">
                  {language === 'id' ? 'Apakah hasil penghapusan background disimpan dalam format transparan?' : 'Is the background removal result saved in a transparent format?'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'id'
                    ? 'Ya! Gambar hasil pemrosesan akan otomatis dikonversi dan disimpan ke dalam format PNG dengan latar belakang transparan (alpha channel) yang siap digunakan untuk desain grafis.'
                    : 'Yes! The processed image is automatically converted and saved as a PNG with a transparent background (alpha channel) ready for graphic design use.'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/50 p-5">
                <h3 className="font-semibold text-foreground mb-2">
                  {language === 'id' ? 'Apakah resolusi foto saya akan berkurang?' : 'Will my photo resolution decrease?'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'id'
                    ? 'Tidak. Fitur Hapus Background GambarYuk mempertahankan resolusi piksel asli dari gambar yang Anda unggah tanpa melakukan pemotongan ukuran resolusi.'
                    : 'No. GambarYuk\'s Background Remover maintains the original pixel resolution of the image you upload without downscaling.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RemoveBgPage;
