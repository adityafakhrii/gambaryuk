import { SEO } from '@/components/SEO';
import { useState, useCallback, useMemo } from 'react';
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
  { key: 'balanced', quality: 0.75, label: 'compress.balanced', percentage: '75%', desc: 'compress.balanced.desc' },
  { key: 'maximum', quality: 0.5, label: 'compress.maximum', percentage: '50%', desc: 'compress.maximum.desc' },
  { key: 'highQuality', quality: 0.92, label: 'compress.highQuality', percentage: '92%', desc: 'compress.highQuality.desc' },
  { key: 'custom', quality: null, label: 'compress.custom', percentage: null, desc: 'compress.custom.desc' },
];

export default function CompressPage() {
  const { t, language } = useLanguage();
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
      if (modeConfig.quality !== null) {
        const newQuality = Math.round(modeConfig.quality * 100);
        setQuality(newQuality);
        if (images.length > 0) {
          processAllWithQuality(newQuality);
        }
      }
    }
  };

  const processImage = async (image: ProcessedFile, targetQuality?: number) => {
    const activeQuality = targetQuality ?? quality;
    setImages(prev => prev.map(img =>
      img.id === image.id ? { ...img, processing: true } : img
    ));

    try {
      // Force WebP for better compression while preserving transparency if original was PNG,
      // otherwise fallback to JPEG which naturally supports quality slider well.
      const format = image.file.type === 'image/png' ? 'webp' : 'jpeg';
      const result = await compressImage(image.preview, {
        quality: activeQuality / 100,
        format,
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

  const processAllWithQuality = async (q: number) => {
    for (const image of images) {
      await processImage(image, q);
    }
  };

  const processAll = async () => {
    for (const image of images) {
      await processImage(image, quality);
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

  const schemaData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": language === 'id' ? "Kompres Gambar Online - GambarYuk" : "Compress Image Online - GambarYuk",
      "url": "https://gambaryuk.com/compress",
      "description": language === 'id' 
        ? "Kurangi ukuran file foto JPG, PNG, WebP secara gratis langsung di browser dengan kualitas gambar tetap terjaga." 
        : "Reduce JPG, PNG, and WebP file size for free inside browser while maintaining excellent image quality.",
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
        title={t('compress.title')} 
        description={t('feature.compress.desc')} 
        path="/compress" 
        schema={schemaData} 
      />
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {images.length} image{images.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleClearAll}>
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      {t('common.clearAll')}
                    </Button>

                    {images.some(img => img.result) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadAll}
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        {t('common.downloadAll')}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      className="btn-accent"
                      onClick={processAll}
                      disabled={images.every(img => img.processing)}
                    >
                      {images.some(img => img.processing) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : null}
                      {images.length > 1 ? t('common.processAll') : t('common.process')}
                    </Button>
                  </div>
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
                                      -{calculateReduction(image.file.size, image.result.size)}%
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
              <div className="mt-4 space-y-3">
                {compressionModes.map((mode) => (
                  <button
                    key={mode.key}
                    className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 border ${selectedMode === mode.key
                      ? 'bg-primary border-primary shadow-md text-primary-foreground'
                      : 'bg-muted/30 border-transparent hover:bg-muted/60 hover:border-border/50 text-foreground'
                      }`}
                    onClick={() => handleModeChange(mode.key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${selectedMode === mode.key ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {t(mode.label)}
                      </span>
                      {mode.percentage && (
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${selectedMode === mode.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/15 text-primary'}`}>
                          {mode.percentage}
                        </span>
                      )}
                    </div>
                    {mode.desc && (
                      <p className={`text-xs mt-1.5 leading-relaxed ${selectedMode === mode.key ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}>
                        {t(mode.desc)}
                      </p>
                    )}
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
                      setSelectedMode('custom');
                    }}
                    onValueCommit={(value) => {
                      if (images.length > 0) {
                        processAllWithQuality(value[0]);
                      }
                    }}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('compress.smallerFile')}</span>
                    <span>{t('compress.betterQuality')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO & AEO Content Section */}
        <section className="mt-16 border-t border-border/50 pt-12 max-w-4xl mx-auto space-y-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'id' ? 'Cara Kompres Ukuran Gambar Secara Online Gratis' : 'How to Compress Image Size Online for Free'}
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                {language === 'id' 
                  ? 'Pilih atau seret beberapa file foto (JPG, PNG, WebP) ke area unggah.' 
                  : 'Select or drag multiple image files (JPG, PNG, WebP) into the upload area.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Pilih mode kompresi: Seimbang (Rekomendasi), Kompresi Maksimal, Kualitas Tinggi, atau Kustom.' 
                  : 'Choose a compression mode: Balanced (Recommended), Maximum Compression, High Quality, or Custom.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Jika memilih Kustom, sesuaikan persentase kualitas secara manual menggunakan slider slider.' 
                  : 'If you choose Custom, manually adjust the quality percentage using the slider.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Klik "Proses Semua" untuk mengompresi gambar Anda secara lokal dalam beberapa milidetik.' 
                  : 'Click "Process All" to compress your images locally in a few milliseconds.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Lihat persentase pengurangan ukuran file dan unduh hasilnya secara langsung.' 
                  : 'See the file size reduction percentage and download your results instantly.'}
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">FAQ - Kompres Gambar</h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/50 p-5">
                <h3 className="font-semibold text-foreground mb-2">
                  {language === 'id' ? 'Apakah gambar saya akan buram setelah dikompres?' : 'Will my images look blurry after compression?'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'id'
                    ? 'Tidak! Mode Seimbang dirancang untuk meminimalkan ukuran file secara optimal tanpa mengurangi detail penting yang terlihat secara visual oleh mata manusia.'
                    : 'No! The Balanced mode is designed to optimize file size reduction without losing critical visual details visible to the human eye.'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/50 p-5">
                <h3 className="font-semibold text-foreground mb-2">
                  {language === 'id' ? 'Kenapa kompresi di GambarYuk sangat cepat?' : 'Why is the compression so fast on GambarYuk?'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'id'
                    ? 'Karena seluruh pemrosesan kompresi dilakukan secara internal di komputer/perangkat Anda sendiri melalui browser, tanpa proses upload dan download dari server luar.'
                    : 'Because the entire compression process is executed internally on your computer/device via the browser, avoiding the need to upload and download files to external servers.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}