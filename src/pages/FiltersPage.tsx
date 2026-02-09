import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
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
}

const defaultFilters: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
};

const FiltersPage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const presets = [
    { name: t('filters.grayscale'), filters: { ...defaultFilters, grayscale: 100 } },
    { name: t('filters.sepia'), filters: { ...defaultFilters, sepia: 100 } },
    { name: t('filters.vintage'), filters: { ...defaultFilters, sepia: 50, saturation: 80, contrast: 110 } },
    { name: 'High Contrast', filters: { ...defaultFilters, contrast: 140, saturation: 120 } },
    { name: 'Soft', filters: { ...defaultFilters, contrast: 90, brightness: 105, blur: 1 } },
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
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%)`;
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('filters.title')}</h1>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Presets</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(preset.filters)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>

              <h3 className="font-semibold text-foreground mb-4">Adjustments</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">{t('filters.brightness')}: {filters.brightness}%</label>
                  <Slider
                    value={[filters.brightness]}
                    max={200}
                    min={0}
                    step={5}
                    onValueChange={([v]) => updateFilter('brightness', v)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t('filters.contrast')}: {filters.contrast}%</label>
                  <Slider
                    value={[filters.contrast]}
                    max={200}
                    min={0}
                    step={5}
                    onValueChange={([v]) => updateFilter('contrast', v)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t('filters.saturation')}: {filters.saturation}%</label>
                  <Slider
                    value={[filters.saturation]}
                    max={200}
                    min={0}
                    step={5}
                    onValueChange={([v]) => updateFilter('saturation', v)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t('filters.blur')}: {filters.blur}px</label>
                  <Slider
                    value={[filters.blur]}
                    max={10}
                    min={0}
                    step={0.5}
                    onValueChange={([v]) => updateFilter('blur', v)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t('filters.grayscale')}: {filters.grayscale}%</label>
                  <Slider
                    value={[filters.grayscale]}
                    max={100}
                    min={0}
                    step={5}
                    onValueChange={([v]) => updateFilter('grayscale', v)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t('filters.sepia')}: {filters.sepia}%</label>
                  <Slider
                    value={[filters.sepia]}
                    max={100}
                    min={0}
                    step={5}
                    onValueChange={([v]) => updateFilter('sepia', v)}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
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
            <Card className="p-6 lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Preview</h3>
                  <div className="relative overflow-hidden rounded-lg bg-muted">
                    {selectedImage && (
                      <img
                        src={selectedImage.url}
                        alt="Preview"
                        className="w-full h-auto max-h-64 object-contain"
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
                        className="w-full h-auto max-h-64 object-contain"
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