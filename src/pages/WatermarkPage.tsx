import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Download, Stamp, RefreshCw } from 'lucide-react';
import { loadImage, downloadImage, formatFileSize } from '@/lib/imageProcessing';

type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const WatermarkPage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
  const [watermarkText, setWatermarkText] = useState('© My Watermark');
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#ffffff');
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const positions: { value: WatermarkPosition; label: string }[] = [
    { value: 'top-left', label: '↖' },
    { value: 'top-center', label: '↑' },
    { value: 'top-right', label: '↗' },
    { value: 'center-left', label: '←' },
    { value: 'center', label: '●' },
    { value: 'center-right', label: '→' },
    { value: 'bottom-left', label: '↙' },
    { value: 'bottom-center', label: '↓' },
    { value: 'bottom-right', label: '↘' },
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

  const getPositionCoords = (pos: WatermarkPosition, canvasW: number, canvasH: number, textW: number, textH: number) => {
    const padding = 20;
    const positions: Record<WatermarkPosition, { x: number; y: number }> = {
      'top-left': { x: padding, y: textH + padding },
      'top-center': { x: (canvasW - textW) / 2, y: textH + padding },
      'top-right': { x: canvasW - textW - padding, y: textH + padding },
      'center-left': { x: padding, y: canvasH / 2 },
      'center': { x: (canvasW - textW) / 2, y: canvasH / 2 },
      'center-right': { x: canvasW - textW - padding, y: canvasH / 2 },
      'bottom-left': { x: padding, y: canvasH - padding },
      'bottom-center': { x: (canvasW - textW) / 2, y: canvasH - padding },
      'bottom-right': { x: canvasW - textW - padding, y: canvasH - padding },
    };
    return positions[pos];
  };

  const applyWatermark = async () => {
    if (!selectedImage || !watermarkText.trim()) return;
    
    setIsProcessing(true);
    try {
      const img = await loadImage(selectedImage.url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity / 100;
      
      const metrics = ctx.measureText(watermarkText);
      const textWidth = metrics.width;
      const textHeight = fontSize;
      
      const coords = getPositionCoords(position, canvas.width, canvas.height, textWidth, textHeight);
      ctx.fillText(watermarkText, coords.x, coords.y);

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
      console.error('Watermark failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage && selectedImage) {
      const filename = selectedImage.file.name.replace(/\.[^/.]+$/, '') + '_watermarked.png';
      downloadImage(processedImage.blob, filename);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('watermark.title')}</h1>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">{t('watermark.content')}</label>
                  <Input
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="mt-1"
                    placeholder="© My Watermark"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">{t('watermark.position')}</label>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {positions.map((pos) => (
                      <Button
                        key={pos.value}
                        variant={position === pos.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPosition(pos.value)}
                        className="h-10"
                      >
                        {pos.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">{t('watermark.opacity')}: {opacity}%</label>
                  <Slider
                    value={[opacity]}
                    max={100}
                    min={10}
                    step={5}
                    onValueChange={([v]) => setOpacity(v)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">{t('watermark.size')}: {fontSize}px</label>
                  <Slider
                    value={[fontSize]}
                    max={100}
                    min={12}
                    step={2}
                    onValueChange={([v]) => setFontSize(v)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">{t('watermark.color')}</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button
                  className="w-full btn-accent"
                  onClick={applyWatermark}
                  disabled={isProcessing}
                >
                  <Stamp className="w-4 h-4 mr-2" />
                  {isProcessing ? t('common.processing') : t('common.apply')}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setUploadedImages([]);
                    setSelectedImage(null);
                    setProcessedImage(null);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('common.clear')}
                </Button>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('common.original')}</h3>
                  <div className="relative overflow-hidden rounded-lg bg-muted">
                    {selectedImage && (
                      <img
                        src={selectedImage.url}
                        alt="Original"
                        className="w-full h-auto max-h-64 object-contain"
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
                        alt="Watermarked"
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

export default WatermarkPage;