import { SEO } from '@/components/SEO';
import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Wand2, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadImage, dataUriToBlob } from '@/lib/imageProcessing';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { aiRateLimiter } from '@/lib/rateLimiter';
import JSZip from 'jszip';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

interface ProcessedImage {
  id: string;
  original: ImageFile;
  processedUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMsg?: string;
}

const RemoveWatermarkPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((files: ImageFile[]) => {
    setImages(prev => {
      const newFiles = files.filter(f => !prev.some(p => p.id === f.id));
      return [...prev, ...newFiles];
    });
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setProcessedImages(prev => prev.filter(img => img.id !== id));
  };

  const processImages = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    const pendingImages = images.filter(img => {
      const existing = processedImages.find(p => p.id === img.id);
      return !existing || existing.status === 'error';
    });

    if (pendingImages.length === 0) {
      toast.info('Semua gambar sudah diproses.');
      setIsProcessing(false);
      return;
    }

    setProcessedImages(prev => {
      const newMap = new Map(prev.map(p => [p.id, p]));
      pendingImages.forEach(img => {
        newMap.set(img.id, { id: img.id, original: img, processedUrl: '', status: 'processing' });
      });
      return Array.from(newMap.values());
    });

    for (let i = 0; i < pendingImages.length; i++) {
      const img = pendingImages[i];
      try {
        const { allowed, retryAfterMs } = aiRateLimiter.check();
        if (!allowed) {
          const errMsg = `Rate limited. Coba lagi dalam ${Math.ceil(retryAfterMs / 1000)}s`;
          toast.error(errMsg);
          setProcessedImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'error', errorMsg: errMsg } : p));
          continue;
        }

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(img.file);
        });

        const { data, error } = await supabase.functions.invoke('remove-watermark', {
          body: { image: base64 },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        if (data?.image) {
          setProcessedImages(prev => prev.map(p =>
            p.id === img.id ? { ...p, processedUrl: data.image, status: 'done' } : p
          ));
        } else {
          throw new Error('Tidak ada hasil dari AI');
        }
      } catch (error) {
        console.error('Processing failed for', img.file.name, error);
        setProcessedImages(prev => prev.map(p =>
          p.id === img.id ? { ...p, status: 'error', errorMsg: error instanceof Error ? error.message : 'Error tidak diketahui' } : p
        ));
      }
    }

    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const doneImages = processedImages.filter(p => p.status === 'done' && p.processedUrl);
    if (doneImages.length === 0) return;

    if (doneImages.length === 1) {
      const img = doneImages[0];
      const filename = img.original.file.name.replace(/\.[^/.]+$/, '') + '_nowatermark.png';
      try {
        const blob = dataUriToBlob(img.processedUrl);
        downloadImage(blob, filename);
      } catch {
        toast.error('Gagal mendownload gambar.');
      }
      return;
    }

    toast.info('Sedang menyiapkan file ZIP...');
    try {
      const zip = new JSZip();
      await Promise.all(doneImages.map(async (img) => {
        const filename = img.original.file.name.replace(/\.[^/.]+$/, '') + '_nowatermark.png';
        const blob = dataUriToBlob(img.processedUrl);
        zip.file(filename, blob);
      }));
      const content = await zip.generateAsync({ type: 'blob' });
      downloadImage(content, 'gambaryuk_nowatermark.zip');
    } catch {
      toast.error('Gagal membuat file ZIP.');
    }
  };

  return (
    <div className="min-h-full">
      <SEO title={t('removeWatermark.title')} description={t('feature.removeWatermark.desc')} path="/remove-watermark" />
      <main className="container relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('removeWatermark.title') || 'Hapus Watermark'}</h1>
          <p className="text-muted-foreground mt-2">
            Hapus otomatis Watermark NotebookLM menggunakan teknologi AI tanpa mengubah ukuran atau resolusi gambar.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Controls */}
          <Card className="p-6 hover-card-enhanced lg:col-span-1 h-fit sticky top-6">
            <h3 className="font-semibold text-foreground mb-4">Pengaturan AI</h3>

            <p className="text-sm text-muted-foreground mb-6">
              AI akan mendeteksi watermark (terutama dari NotebookLM) pada setiap gambar, lalu menghilangkannya dan merekonstruksi area yang dihapus.
              <strong> Resolusi dan ukuran gambar akan dipertahankan 100% sesuai aslinya.</strong>
            </p>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={processImages}
                disabled={isProcessing || images.length === 0 || images.every(img => processedImages.find(p => p.id === img.id)?.status === 'done')}
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                {isProcessing ? t('common.processing') : 'Hapus dengan AI'}
              </Button>

              {processedImages.some(p => p.status === 'done') && (
                <Button className="w-full" onClick={downloadAll}>
                  <Download className="w-4 h-4 mr-2" />
                  {processedImages.filter(p => p.status === 'done').length > 1 ? t('common.downloadAll') : t('common.download')}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => { setImages([]); setProcessedImages([]); }}
                disabled={images.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('common.clearAll')}
              </Button>
            </div>
          </Card>

          {/* Preview Area */}
          <div className="lg:col-span-2 space-y-4">
            <UploadZone onFilesSelected={handleFilesSelected} multiple={true} />

            {images.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {images.map((img) => {
                  const processed = processedImages.find(p => p.id === img.id);
                  return (
                    <Card key={img.id} className="p-4 relative hover-card-enhanced">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate max-w-[200px]" title={img.file.name}>
                            {img.file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {img.width} × {img.height}
                          </span>
                          {processed?.status === 'done' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Selesai
                            </span>
                          )}
                          {processed?.status === 'error' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                              <AlertCircle className="h-3 w-3" /> Gagal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {processed?.status === 'done' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                try {
                                  const blob = dataUriToBlob(processed.processedUrl);
                                  downloadImage(blob, img.file.name.replace(/\.[^/.]+$/, '') + '_nowatermark.png');
                                } catch { toast.error('Gagal mendownload.'); }
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" /> Unduh
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeImage(img.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Before/After comparison or original preview */}
                      {processed?.status === 'done' ? (
                        <BeforeAfterSlider
                          beforeSrc={img.preview}
                          afterSrc={processed.processedUrl}
                          beforeLabel="Asli"
                          afterLabel="Tanpa Watermark"
                        />
                      ) : (
                        <div className="relative bg-muted/30 rounded-xl overflow-hidden border border-border/50 flex items-center justify-center">
                          <img
                            src={img.preview}
                            alt="Original"
                            className={`max-w-full max-h-[40vh] object-contain ${processed?.status === 'processing' ? 'opacity-30' : ''}`}
                          />
                          {processed?.status === 'processing' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm gap-2">
                              <Wand2 className="h-6 w-6 animate-pulse text-primary" />
                              <span className="text-xs font-medium bg-background/80 px-2 py-1 rounded text-foreground">
                                AI sedang merekonstruksi...
                              </span>
                            </div>
                          )}
                          {processed?.status === 'error' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-sm gap-2 p-4 text-center">
                              <AlertCircle className="h-6 w-6 text-destructive" />
                              <span className="text-xs font-semibold text-destructive">{processed.errorMsg || 'Terjadi kesalahan'}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RemoveWatermarkPage;
