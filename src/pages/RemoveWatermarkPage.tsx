import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Sparkles, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadImage } from '@/lib/imageProcessing';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { aiRateLimiter } from '@/lib/rateLimiter';
import JSZip from 'jszip';

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
    
    // Initialize processed states for images that haven't been successfully processed yet
    const pendingImages = images.filter(img => {
      const existing = processedImages.find(p => p.id === img.id);
      return !existing || existing.status === 'error'; // Reprocess errors
    });

    if (pendingImages.length === 0) {
      toast.info('Semua gambar sudah diproses.');
      setIsProcessing(false);
      return;
    }

    setProcessedImages(prev => {
      const newMap = new Map(prev.map(p => [p.id, p]));
      pendingImages.forEach(img => {
        newMap.set(img.id, {
          id: img.id,
          original: img,
          processedUrl: '',
          status: 'processing'
        });
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
        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.image) {
          setProcessedImages(prev => prev.map(p => 
            p.id === img.id ? { ...p, processedUrl: data.image, status: 'done' } : p
          ));
        } else {
          throw new Error("Tidak ada hasil dari AI");
        }
      } catch (error) {
        console.error('Processing failed for', img.file.name, error);
        setProcessedImages(prev => prev.map(p => 
          p.id === img.id ? { ...p, status: 'error', errorMsg: error instanceof Error ? error.message : "Error tidak diketahui" } : p
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
        const r = await fetch(img.processedUrl);
        const blob = await r.blob();
        downloadImage(blob, filename);
      } catch (err) {
        toast.error("Gagal mendownload gambar.");
      }
      return;
    }

    toast.info("Sedang menyiapkan file ZIP...");
    try {
      const zip = new JSZip();
      
      const promises = doneImages.map(async (img) => {
        const originalName = img.original.file.name;
        const filename = originalName.replace(/\.[^/.]+$/, '') + '_nowatermark.png';
        const r = await fetch(img.processedUrl);
        const blob = await r.blob();
        zip.file(filename, blob);
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      downloadImage(content, 'gambaryuk_nowatermark.zip');
    } catch (err) {
      toast.error("Gagal membuat file ZIP.");
    }
  };

  return (
    <div className="min-h-full">
      <main className="container relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('removeWatermark.title') || 'Hapus Watermark'}</h1>
          <p className="text-muted-foreground mt-2">
            Hapus otomatis Watermark NotebookLM menggunakan teknologi AI tanpa memotong gambar.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Controls */}
          <Card className="p-6 hover-card-enhanced lg:col-span-1 h-fit sticky top-6">
            <h3 className="font-semibold text-foreground mb-4">Pengaturan AI</h3>
            
            <p className="text-sm text-muted-foreground mb-6">
              AI akan mendeteksi watermark (terutama dari NotebookLM) pada setiap gambar, lalu menghilangkannya dan merekonstruksi area yang dihapus. 
              <strong>Gambar tidak akan dipotong atau diubah ukurannya sedikitpun.</strong>
            </p>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                onClick={processImages}
                disabled={isProcessing || images.length === 0 || images.every(img => processedImages.find(p => p.id === img.id)?.status === 'done')}
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isProcessing ? t('common.processing') : 'Hapus dengan AI'}
              </Button>

              {processedImages.some(p => p.status === 'done') && (
                <Button
                  className="w-full"
                  onClick={downloadAll}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {processedImages.filter(p => p.status === 'done').length > 1 ? t('common.downloadAll') : t('common.download')}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setImages([]);
                  setProcessedImages([]);
                }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((img) => {
                  const processed = processedImages.find(p => p.id === img.id);
                  return (
                    <Card key={img.id} className="p-4 relative hover-card-enhanced">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full"
                        onClick={() => removeImage(img.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      
                      <div className="aspect-square relative bg-muted/30 rounded-md overflow-hidden flex items-center justify-center border border-border/50">
                        {processed?.status === 'done' ? (
                           <div className="relative w-full h-full"
                             style={{
                                backgroundImage: 'linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)',
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                             }}>
                              <img 
                                src={processed.processedUrl} 
                                alt="Processed" 
                                className="w-full h-full object-contain"
                              />
                           </div>
                        ) : (
                          <img 
                            src={img.preview} 
                            alt="Original" 
                            className={`max-w-full max-h-full object-contain ${processed?.status === 'processing' ? 'opacity-30' : 'opacity-100'}`}
                          />
                        )}
                        
                        {processed?.status === 'processing' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm gap-2">
                            <Sparkles className="h-6 w-6 animate-pulse text-indigo-500" />
                            <span className="text-xs font-medium bg-background/80 px-2 py-1 rounded text-foreground">
                              AI sedang merekonstruksi...
                            </span>
                          </div>
                        )}
                        
                        {processed?.status === 'done' && (
                          <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}

                        {processed?.status === 'error' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-sm gap-2 p-4 text-center border border-destructive/50 rounded-md">
                            <div className="bg-destructive text-destructive-foreground rounded-full p-2">
                              <AlertCircle className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-semibold text-destructive mt-1">Gagal Diproses</span>
                            <span className="text-[10px] text-destructive/80 leading-tight">
                              {processed.errorMsg || 'Terjadi kesalahan pada AI'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                        <span className="truncate max-w-[150px] font-medium" title={img.file.name}>{img.file.name}</span>
                        {processed?.status === 'done' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={async () => {
                              try {
                                const response = await fetch(processed.processedUrl);
                                const blob = await response.blob();
                                const filename = img.file.name.replace(/\.[^/.]+$/, '') + '_nowatermark.png';
                                downloadImage(blob, filename);
                              } catch(e) {
                                toast.error("Gagal mendownload.");
                              }
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {t('common.download')}
                          </Button>
                        )}
                      </div>
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
