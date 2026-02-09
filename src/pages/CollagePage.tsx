import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Download, LayoutGrid, RefreshCw } from 'lucide-react';
import { loadImage, downloadImage, formatFileSize } from '@/lib/imageProcessing';

type Template = '2x1' | '1x2' | '2x2' | '3x3' | '2x3' | '3x2';

const CollagePage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [template, setTemplate] = useState<Template>('2x2');
  const [gap, setGap] = useState(10);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const templates: { value: Template; label: string; cols: number; rows: number }[] = [
    { value: '2x1', label: '2×1', cols: 2, rows: 1 },
    { value: '1x2', label: '1×2', cols: 1, rows: 2 },
    { value: '2x2', label: '2×2', cols: 2, rows: 2 },
    { value: '2x3', label: '2×3', cols: 2, rows: 3 },
    { value: '3x2', label: '3×2', cols: 3, rows: 2 },
    { value: '3x3', label: '3×3', cols: 3, rows: 3 },
  ];

  const handleFilesSelected = useCallback((files: { file: File; preview: string }[]) => {
    const newImages = files.map((f) => ({
      file: f.file,
      url: f.preview,
    }));
    setUploadedImages(newImages);
    setProcessedImage(null);
  }, []);

  const getTemplateConfig = () => templates.find((t) => t.value === template) || templates[2];

  const generateCollage = async () => {
    if (uploadedImages.length < 2) return;
    
    setIsProcessing(true);
    try {
      const config = getTemplateConfig();
      const cellWidth = 400;
      const cellHeight = 400;
      
      const canvasWidth = config.cols * cellWidth + (config.cols + 1) * gap;
      const canvasHeight = config.rows * cellHeight + (config.rows + 1) * gap;
      
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      const maxCells = config.cols * config.rows;
      const imagesToUse = uploadedImages.slice(0, maxCells);
      
      for (let i = 0; i < imagesToUse.length; i++) {
        const img = await loadImage(imagesToUse[i].url);
        
        const row = Math.floor(i / config.cols);
        const col = i % config.cols;
        
        const x = gap + col * (cellWidth + gap);
        const y = gap + row * (cellHeight + gap);
        
        // Calculate aspect ratio fit
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const cellRatio = cellWidth / cellHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgRatio > cellRatio) {
          drawHeight = cellHeight;
          drawWidth = cellHeight * imgRatio;
          drawX = x - (drawWidth - cellWidth) / 2;
          drawY = y;
        } else {
          drawWidth = cellWidth;
          drawHeight = cellWidth / imgRatio;
          drawX = x;
          drawY = y - (drawHeight - cellHeight) / 2;
        }
        
        // Clip to cell
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellWidth, cellHeight);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      }

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
      console.error('Collage failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      downloadImage(processedImage.blob, 'collage.png');
    }
  };

  const config = getTemplateConfig();
  const requiredImages = config.cols * config.rows;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('collage.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('collage.minImages')}
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">{t('collage.template')}</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {templates.map((t) => (
                      <Button
                        key={t.value}
                        variant={template === t.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTemplate(t.value)}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">{t('collage.gap')}: {gap}px</label>
                  <Slider
                    value={[gap]}
                    max={50}
                    min={0}
                    step={2}
                    onValueChange={([v]) => setGap(v)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">{t('collage.bgColor')}</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    className="w-full btn-accent"
                    onClick={generateCollage}
                    disabled={isProcessing || uploadedImages.length < 2}
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    {isProcessing ? t('common.processing') : t('collage.generate')}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setUploadedImages([]);
                      setProcessedImage(null);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('common.clear')}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Uploaded: {uploadedImages.length} / {requiredImages} images needed
                </p>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-4">Preview</h3>
              
              {/* Uploaded Images Grid */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <span className="absolute top-1 left-1 bg-foreground/70 text-background text-xs px-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>

              {processedImage && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t('common.result')}</h3>
                  <div className="relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={processedImage.url}
                      alt="Collage"
                      className="w-full h-auto"
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
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default CollagePage;