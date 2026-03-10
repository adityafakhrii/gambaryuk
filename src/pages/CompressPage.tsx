import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackImageProcessed } from '@/hooks/useImageStats';
import { UploadZone, ImagePreview } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { compressImage, downloadImage, formatFileSize, ProcessedImage } from '@/lib/imageProcessing';
import { downloadAsZip } from '@/lib/zipDownload';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
}

interface ProcessedFile extends ImageFile {
  result?: ProcessedImage;
  processing?: boolean;
}

const compressionModes = [
  { key: 'balanced', quality: 0.75, label: 'compress.balanced' },
  { key: 'maximum', quality: 0.5, label: 'compress.maximum' },
  { key: 'highQuality', quality: 0.92, label: 'compress.highQuality' },
];

export default function CompressPage() {
  const { t } = useLanguage();
  const [images, setImages] = useState<ProcessedFile[]>([]);
  const [quality, setQuality] = useState(75);
  const [selectedMode, setSelectedMode] = useState<string>('balanced');

  const handleFilesSelected = useCallback((files: ImageFile[]) => {
    setImages((prev) => [...prev, ...files.map(f => ({ ...f }))]);
  }, []);

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      if (img?.result?.url) URL.revokeObjectURL(img.result.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleClearAll = () => {
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
      if (img.result?.url) URL.revokeObjectURL(img.result.url);
    });
    setImages([]);
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    const modeConfig = compressionModes.find(m => m.key === mode);
    if (modeConfig) {
      setQuality(Math.round(modeConfig.quality * 100));
    }
  };

  const processImage = async (image: ProcessedFile) => {
    setImages(prev => prev.map(img =>
      img.id === image.id ? { ...img, processing: true } : img
    ));

    try {
      const result = await compressImage(image.preview, {
        quality: quality / 100,
        format: 'jpeg',
      });

      setImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, result, processing: false } : img
      ));

      toast.success(t('common.success'));
      trackImageProcessed();
    } catch (error) {
      toast.error('Failed to compress image');
      setImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, processing: false } : img
      ));
    }
  };

  const processAll = async () => {
    for (const image of images) {
      if (!image.result) {
        await processImage(image);
      }
    }
  };

  const handleDownload = (image: ProcessedFile) => {
    if (image.result) {
      const baseName = image.file.name.replace(/\.[^.]+$/, '');
      downloadImage(image.result.blob, `${baseName}-compressed.jpg`);
    }
  };

  const handleDownloadAll = async () => {
    const processed = images.filter(img => img.result);
    if (processed.length <= 1) {
      processed.forEach(img => handleDownload(img));
      return;
    }
    await downloadAsZip(
      processed.map(img => ({
        name: img.file.name.replace(/\.[^.]+$/, '') + '-compressed.jpg',
        blob: img.result!.blob,
      })),
      'compressed-images.zip'
    );
  };

  const calculateReduction = (original: number, compressed: number) => {
    return Math.round(((original - compressed) / original) * 100);
  };

  return (
    <div className="min-h-full">
      <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {t('compress.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.compress.desc')}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Area */}
          <div className="space-y-6">
            {images.length === 0 ? (
              <UploadZone onFilesSelected={handleFilesSelected} className="min-h-[300px]" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {images.length} image{images.length > 1 ? 's' : ''} selected
                  </p>
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('common.clearAll')}
                  </Button>
                </div>

                <div className="space-y-6">
                  {images.map((image) => (
                    <div key={image.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                      <div className="grid md:grid-cols-2">
                        {/* Before */}
                        <div className="relative">
                          <div className="absolute top-3 left-3 z-10 rounded-full bg-background/80 px-3 py-1 text-xs font-medium">
                            {t('compress.before')}
                          </div>
                          <button
                            onClick={() => handleRemoveImage(image.id)}
                            className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <img
                            src={image.preview}
                            alt="Original"
                            className="w-full h-48 object-contain bg-muted"
                          />
                          <div className="p-3 border-t border-border">
                            <p className="text-sm font-medium truncate">{image.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {image.width}×{image.height} • {formatFileSize(image.file.size)}
                            </p>
                          </div>
                        </div>

                        {/* After */}
                        <div className="border-l border-border">
                          {image.processing ? (
                            <div className="flex h-full items-center justify-center bg-muted/50">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {t('common.processing')}
                                </p>
                              </div>
                            </div>
                          ) : image.result ? (
                            <>
                              <div className="relative">
                                <div className="absolute top-3 left-3 z-10 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
                                  {t('compress.after')}
                                </div>
                                <img
                                  src={image.result.url}
                                  alt="Compressed"
                                  className="w-full h-48 object-contain bg-muted"
                                />
                              </div>
                              <div className="p-3 border-t border-border">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-accent">
                                      -{calculateReduction(image.file.size, image.result.size)}% 🚀
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(image.result.size)}
                                    </p>
                                  </div>
                                  <Button size="sm" onClick={() => handleDownload(image)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center bg-muted/30">
                              <p className="text-sm text-muted-foreground">
                                Click process to compress
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-semibold text-foreground">{t('compress.mode')}</h2>
              <div className="mt-4 space-y-2">
                {compressionModes.map((mode) => (
                  <button
                    key={mode.key}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${selectedMode === mode.key
                        ? 'bg-primary/10 border-primary border'
                        : 'bg-muted/50 border border-transparent hover:bg-muted'
                      }`}
                    onClick={() => handleModeChange(mode.key)}
                  >
                    <span className="text-sm font-medium">{t(mode.label)}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t('compress.quality')}</Label>
                    <span className="text-sm font-medium text-foreground">{quality}%</span>
                  </div>
                  <Slider
                    value={[quality]}
                    onValueChange={(value) => {
                      setQuality(value[0]);
                      setSelectedMode('');
                    }}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="space-y-3">
                <Button
                  className="w-full btn-accent"
                  size="lg"
                  onClick={processAll}
                  disabled={images.every(img => img.processing)}
                >
                  {images.some(img => img.processing) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {images.length > 1 ? t('common.processAll') : t('common.process')}
                </Button>

                {images.some(img => img.result) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleDownloadAll}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('common.downloadAll')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}