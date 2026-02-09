import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Download, Crop, RotateCcw } from 'lucide-react';
import { loadImage, downloadImage, formatFileSize } from '@/lib/imageProcessing';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CropPage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const aspectRatios = [
    { label: t('crop.free'), value: 'free' },
    { label: t('crop.square'), value: '1:1' },
    { label: t('crop.landscape'), value: '16:9' },
    { label: t('crop.portrait'), value: '9:16' },
    { label: '4:3', value: '4:3' },
    { label: '3:2', value: '3:2' },
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
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      setCropArea({ x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight });
    }
  }, []);

  const applyCrop = async () => {
    if (!selectedImage || !imageRef.current) return;
    
    setIsProcessing(true);
    try {
      const img = await loadImage(selectedImage.url);
      const canvas = document.createElement('canvas');
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );

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
      console.error('Crop failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage && selectedImage) {
      const filename = selectedImage.file.name.replace(/\.[^/.]+$/, '') + '_cropped.png';
      downloadImage(processedImage.blob, filename);
    }
  };

  const updateCropWithRatio = (ratio: string) => {
    setAspectRatio(ratio);
    if (!imageRef.current || ratio === 'free') return;
    
    const img = imageRef.current;
    const [w, h] = ratio.split(':').map(Number);
    const targetRatio = w / h;
    
    let newWidth = img.naturalWidth;
    let newHeight = img.naturalHeight;
    
    if (newWidth / newHeight > targetRatio) {
      newWidth = newHeight * targetRatio;
    } else {
      newHeight = newWidth / targetRatio;
    }
    
    setCropArea({
      x: (img.naturalWidth - newWidth) / 2,
      y: (img.naturalHeight - newHeight) / 2,
      width: newWidth,
      height: newHeight,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('crop.title')}</h1>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">{t('crop.ratio')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={aspectRatio === ratio.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateCropWithRatio(ratio.value)}
                  >
                    {ratio.label}
                  </Button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">X</label>
                  <Slider
                    value={[cropArea.x]}
                    max={imageRef.current?.naturalWidth || 1000}
                    step={1}
                    onValueChange={([v]) => setCropArea({ ...cropArea, x: v })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Y</label>
                  <Slider
                    value={[cropArea.y]}
                    max={imageRef.current?.naturalHeight || 1000}
                    step={1}
                    onValueChange={([v]) => setCropArea({ ...cropArea, y: v })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t('resize.width')}</label>
                  <Slider
                    value={[cropArea.width]}
                    max={imageRef.current?.naturalWidth || 1000}
                    min={10}
                    step={1}
                    onValueChange={([v]) => setCropArea({ ...cropArea, width: v })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t('resize.height')}</label>
                  <Slider
                    value={[cropArea.height]}
                    max={imageRef.current?.naturalHeight || 1000}
                    min={10}
                    step={1}
                    onValueChange={([v]) => setCropArea({ ...cropArea, height: v })}
                  />
                </div>
              </div>

              <Button
                className="w-full mt-6 btn-accent"
                onClick={applyCrop}
                disabled={isProcessing}
              >
                <Crop className="w-4 h-4 mr-2" />
                {isProcessing ? t('common.processing') : t('crop.apply')}
              </Button>

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setUploadedImages([]);
                  setSelectedImage(null);
                  setProcessedImage(null);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('common.clear')}
              </Button>
            </Card>

            {/* Preview */}
            <Card className="p-6 lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('common.original')}</h3>
                  <div className="relative overflow-hidden rounded-lg bg-muted">
                    {selectedImage && (
                      <img
                        ref={imageRef}
                        src={selectedImage.url}
                        alt="Original"
                        className="w-full h-auto max-h-64 object-contain"
                        onLoad={handleImageLoad}
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Crop: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px
                  </p>
                </div>

                {processedImage && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('common.result')}</h3>
                    <div className="relative overflow-hidden rounded-lg bg-muted">
                      <img
                        src={processedImage.url}
                        alt="Cropped"
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

export default CropPage;