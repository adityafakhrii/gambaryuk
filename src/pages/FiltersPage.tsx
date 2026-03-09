import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackImageProcessed } from '@/hooks/useImageStats';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Download, Palette, RefreshCw } from 'lucide-react';
import { loadImage, downloadImage, formatFileSize } from '@/lib/imageProcessing';

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
  hueRotate: number;
}

const defaultFilters: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
};

interface FilterPreset {
  name: string;
  emoji: string;
  filters: FilterSettings;
}

const FiltersPage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const presets: FilterPreset[] = [
    // Essentials
    { name: 'Normal', emoji: '📷', filters: { ...defaultFilters } },
    { name: t('filters.grayscale'), emoji: '⚫', filters: { ...defaultFilters, grayscale: 100 } },
    { name: t('filters.sepia'), emoji: '🟤', filters: { ...defaultFilters, sepia: 100 } },
    
    // Warm tones
    { name: 'Warm', emoji: '🌅', filters: { ...defaultFilters, saturation: 110, sepia: 20, brightness: 105 } },
    { name: 'Golden Hour', emoji: '🌇', filters: { ...defaultFilters, saturation: 120, sepia: 30, contrast: 110 } },
    { name: 'Sunset', emoji: '🌆', filters: { ...defaultFilters, saturation: 130, sepia: 40, hueRotate: -10 } },
    
    // Cool tones
    { name: 'Cool', emoji: '❄️', filters: { ...defaultFilters, saturation: 90, hueRotate: 20, brightness: 105 } },
    { name: 'Ocean', emoji: '🌊', filters: { ...defaultFilters, saturation: 110, hueRotate: 30, contrast: 105 } },
    { name: 'Arctic', emoji: '🏔️', filters: { ...defaultFilters, saturation: 80, hueRotate: 40, brightness: 110 } },
    
    // Vintage & Retro
    { name: t('filters.vintage'), emoji: '📻', filters: { ...defaultFilters, sepia: 50, saturation: 80, contrast: 110 } },
    { name: 'Retro', emoji: '📼', filters: { ...defaultFilters, sepia: 30, contrast: 120, saturation: 90 } },
    { name: 'Film', emoji: '🎞️', filters: { ...defaultFilters, contrast: 115, saturation: 95, brightness: 95 } },
    { name: 'Noir', emoji: '🎬', filters: { ...defaultFilters, grayscale: 100, contrast: 130 } },
    
    // Enhancement
    { name: 'Vivid', emoji: '🎨', filters: { ...defaultFilters, saturation: 140, contrast: 115 } },
    { name: 'HDR', emoji: '✨', filters: { ...defaultFilters, contrast: 130, saturation: 120, brightness: 105 } },
    { name: 'Pop', emoji: '💥', filters: { ...defaultFilters, saturation: 150, contrast: 120 } },
    
    // Soft & Dreamy
    { name: 'Soft', emoji: '☁️', filters: { ...defaultFilters, contrast: 90, brightness: 105, blur: 0.5 } },
    { name: 'Dreamy', emoji: '💫', filters: { ...defaultFilters, contrast: 85, brightness: 110, saturation: 90, blur: 1 } },
    { name: 'Fade', emoji: '🌫️', filters: { ...defaultFilters, contrast: 80, brightness: 110, saturation: 85 } },
    
    // Dramatic
    { name: 'Dramatic', emoji: '🎭', filters: { ...defaultFilters, contrast: 150, saturation: 110, brightness: 95 } },
    { name: 'Dark', emoji: '🌑', filters: { ...defaultFilters, brightness: 80, contrast: 120 } },
    { name: 'Moody', emoji: '🌙', filters: { ...defaultFilters, brightness: 90, contrast: 115, saturation: 85 } },
    
    // Special
    { name: 'Invert', emoji: '🔄', filters: { ...defaultFilters, invert: 100 } },
    { name: 'X-Ray', emoji: '💀', filters: { ...defaultFilters, invert: 100, grayscale: 100, contrast: 120 } },
  ];

  const handleFilesSelected = useCallback((files: { file: File; preview: string }[]) => {
    const newImages = files.map((f) => ({
      file: f.file,
      url: f.preview,
    }));
    setUploadedImages(newImages);
    if (newImages.length > 0) {
      setSelectedImage(newImages[0]);
      setProcessedImage(null);
      setFilters(defaultFilters);
    }
  }, []);

  const getFilterString = () => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) hue-rotate(${filters.hueRotate}deg)`;
  };

  const applyFilters = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    try {
      const img = await loadImage(selectedImage.url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d')!;
      ctx.filter = getFilterString();
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          setProcessedImage({
            url: URL.createObjectURL(blob),
            blob,
          });
          trackImageProcessed();
        }
        setIsProcessing(false);
      }, 'image/png');
    } catch (error) {
      console.error('Filter failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage && selectedImage) {
      const filename = selectedImage.file.name.replace(/\.[^/.]+$/, '') + '_filtered.png';
      downloadImage(processedImage.blob, filename);
    }
  };

  const updateFilter = (key: keyof FilterSettings, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-full">
      <main className="container relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('filters.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Pilih preset atau atur filter secara manual
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Presets */}
            <Card className="p-4 hover-card-enhanced lg:col-span-1">
              <h3 className="font-semibold text-foreground mb-3">Preset Filter</h3>
              <div className="grid grid-cols-2 gap-1.5 max-h-96 overflow-y-auto pr-1">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(preset.filters)}
                    className="justify-start text-xs h-8 px-2"
                  >
                    <span className="mr-1">{preset.emoji}</span>
                    <span className="truncate">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Adjustments */}
            <Card className="p-4 hover-card-enhanced lg:col-span-1">
              <h3 className="font-semibold text-foreground mb-3">Pengaturan Manual</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground">{t('filters.brightness')}: {filters.brightness}%</label>
                  <Slider
                    value={[filters.brightness]}
                    max={200}
                    min={0}
                    step={5}
                    onValueChange={([v]) => updateFilter('brightness', v)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t('filters.contrast')}: {filters.contrast}%</label>
                  <Slider
                    value={[filters.contrast]}
                    max={200}
                    min={0}
                    step={5}
                    onValueChange={([v]) => updateFilter('contrast', v)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t('filters.saturation')}: {filters.saturation}%</label>
                  <Slider
                    value={[filters.saturation]}
                    max={200}
                    min={0}
                    step={5}
                    onValueChange={([v]) => updateFilter('saturation', v)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Hue Rotate: {filters.hueRotate}°</label>
                  <Slider
                    value={[filters.hueRotate]}
                    max={180}
                    min={-180}
                    step={10}
                    onValueChange={([v]) => updateFilter('hueRotate', v)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t('filters.blur')}: {filters.blur}px</label>
                  <Slider
                    value={[filters.blur]}
                    max={10}
                    min={0}
                    step={0.5}
                    onValueChange={([v]) => updateFilter('blur', v)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  className="w-full btn-accent"
                  onClick={applyFilters}
                  disabled={isProcessing}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {isProcessing ? t('common.processing') : t('common.apply')}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setFilters(defaultFilters)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('filters.reset')}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setUploadedImages([]);
                    setSelectedImage(null);
                    setProcessedImage(null);
                    setFilters(defaultFilters);
                  }}
                >
                  {t('common.clear')}
                </Button>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-4 hover-card-enhanced lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Preview</h3>
                  <div className="relative overflow-hidden rounded-lg bg-muted">
                    {selectedImage && (
                      <img
                        src={selectedImage.url}
                        alt="Preview"
                        className="w-full h-auto max-h-72 object-contain"
                        style={{ filter: getFilterString() }}
                      />
                    )}
                  </div>
                </div>

                {processedImage && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('common.result')}</h3>
                    <div className="relative overflow-hidden rounded-lg bg-muted">
                      <img
                        src={processedImage.url}
                        alt="Filtered"
                        className="w-full h-auto max-h-72 object-contain"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-muted-foreground">
                        {t('common.size')}: {formatFileSize(processedImage.blob.size)}
                      </p>
                      <Button onClick={handleDownload} className="btn-accent">
                        <Download className="w-4 h-4 mr-2" />
                        {t('common.download')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default FiltersPage;
