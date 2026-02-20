import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackImageProcessed } from '@/hooks/useImageStats';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Download, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';
import { loadImage, downloadImage, formatFileSize } from '@/lib/imageProcessing';

const RotatePage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((files: { file: File; preview: string }[]) => {
    const newImages = files.map((f) => ({
      file: f.file,
      url: f.preview,
    }));
    setUploadedImages(newImages);
    if (newImages.length > 0) {
      setSelectedImage(newImages[0]);
      setProcessedImage(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
  }, []);

  const applyTransform = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    try {
      const img = await loadImage(selectedImage.url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      
      canvas.width = img.naturalWidth * cos + img.naturalHeight * sin;
      canvas.height = img.naturalWidth * sin + img.naturalHeight * cos;
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(radians);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

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
      console.error('Transform failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage && selectedImage) {
      const filename = selectedImage.file.name.replace(/\.[^/.]+$/, '') + '_rotated.png';
      downloadImage(processedImage.blob, filename);
    }
  };

  const resetTransform = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setProcessedImage(null);
  };

  return (
    <div className="min-h-full page-gradient">
      <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('rotate.title')}</h1>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6 hover-card-enhanced">
              <h3 className="font-semibold text-foreground mb-4">Rotasi</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  -90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r + 180) % 360)}
                >
                  180°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  +90°
                </Button>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-foreground">{t('rotate.custom')}: {rotation}°</label>
                <Slider
                  value={[rotation]}
                  max={360}
                  step={1}
                  onValueChange={([v]) => setRotation(v)}
                  className="mt-2"
                />
              </div>

              <h3 className="font-semibold text-foreground mb-4">Flip</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <Button
                  variant={flipH ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlipH(!flipH)}
                >
                  <FlipHorizontal className="w-4 h-4 mr-1" />
                  {t('rotate.flipH')}
                </Button>
                <Button
                  variant={flipV ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlipV(!flipV)}
                >
                  <FlipVertical className="w-4 h-4 mr-1" />
                  {t('rotate.flipV')}
                </Button>
              </div>

              <Button
                className="w-full btn-accent"
                onClick={applyTransform}
                disabled={isProcessing}
              >
                {isProcessing ? t('common.processing') : t('common.apply')}
              </Button>

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={resetTransform}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setUploadedImages([]);
                  setSelectedImage(null);
                  setProcessedImage(null);
                  resetTransform();
                }}
              >
                {t('common.clear')}
              </Button>
            </Card>

            {/* Preview */}
            <Card className="p-6 hover-card-enhanced lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('common.original')}</h3>
                  <div className="relative overflow-hidden rounded-lg bg-muted flex items-center justify-center p-4">
                    {selectedImage && (
                      <img
                        src={selectedImage.url}
                        alt="Original"
                        className="max-w-full max-h-48 object-contain transition-transform duration-300"
                        style={{
                          transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                        }}
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Rotation: {rotation}° | Flip H: {flipH ? 'Yes' : 'No'} | Flip V: {flipV ? 'Yes' : 'No'}
                  </p>
                </div>

                {processedImage && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('common.result')}</h3>
                    <div className="relative overflow-hidden rounded-lg bg-muted">
                      <img
                        src={processedImage.url}
                        alt="Transformed"
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

export default RotatePage;