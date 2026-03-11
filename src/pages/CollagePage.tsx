import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackImageProcessed } from '@/hooks/useImageStats';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Download, LayoutGrid, RefreshCw, Plus } from 'lucide-react';
import { loadImage, downloadImage, formatFileSize } from '@/lib/imageProcessing';

type Template = '2x1' | '1x2' | '2x2' | '3x3' | '2x3' | '3x2' | '1x3' | '3x1' | '1x4' | '4x1' | '2x4' | '4x2';

interface TemplateConfig {
  value: Template;
  label: string;
  cols: number;
  rows: number;
  minImages: number;
}

const CollagePage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [template, setTemplate] = useState<Template>('2x2');
  const [gap, setGap] = useState(10);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const allTemplates: TemplateConfig[] = [
    { value: '2x1', label: `2 ${t('collage.photos')} (${t('collage.horizontal')})`, cols: 2, rows: 1, minImages: 2 },
    { value: '1x2', label: `2 ${t('collage.photos')} (${t('collage.vertical')})`, cols: 1, rows: 2, minImages: 2 },
    { value: '1x3', label: `3 ${t('collage.photos')} (${t('collage.vertical')})`, cols: 1, rows: 3, minImages: 3 },
    { value: '3x1', label: `3 ${t('collage.photos')} (${t('collage.horizontal')})`, cols: 3, rows: 1, minImages: 3 },
    { value: '2x2', label: `4 ${t('collage.photos')} (grid 2×2)`, cols: 2, rows: 2, minImages: 4 },
    { value: '1x4', label: `4 ${t('collage.photos')} (${t('collage.vertical')})`, cols: 1, rows: 4, minImages: 4 },
    { value: '4x1', label: `4 ${t('collage.photos')} (${t('collage.horizontal')})`, cols: 4, rows: 1, minImages: 4 },
    { value: '2x3', label: `6 ${t('collage.photos')} (grid 2×3)`, cols: 2, rows: 3, minImages: 6 },
    { value: '3x2', label: `6 ${t('collage.photos')} (grid 3×2)`, cols: 3, rows: 2, minImages: 6 },
    { value: '2x4', label: `8 ${t('collage.photos')} (grid 2×4)`, cols: 2, rows: 4, minImages: 8 },
    { value: '4x2', label: `8 ${t('collage.photos')} (grid 4×2)`, cols: 4, rows: 2, minImages: 8 },
    { value: '3x3', label: `9 ${t('collage.photos')} (grid 3×3)`, cols: 3, rows: 3, minImages: 9 },
  ];

  // Filter templates based on uploaded image count
  const availableTemplates = useMemo(() => {
    const count = uploadedImages.length;
    
    // Show only templates that can be filled with uploaded images
    return allTemplates.filter(t => t.minImages <= count);
  }, [uploadedImages.length]);

  // Auto-select best template when images change
  const autoSelectTemplate = useCallback((imageCount: number) => {
    const bestTemplate = allTemplates
      .filter(t => t.minImages <= imageCount)
      .reduce((best, current) => {
        // Prefer template that uses most images but doesn't exceed count
        if (current.minImages <= imageCount && current.minImages > best.minImages) {
          return current;
        }
        return best;
      }, allTemplates[0]);
    
    setTemplate(bestTemplate.value);
  }, []);

  const handleFilesSelected = useCallback((files: { file: File; preview: string }[]) => {
    const newImages = files.map((f) => ({
      file: f.file,
      url: f.preview,
    }));
    setUploadedImages(newImages);
    setProcessedImage(null);
    
    // Auto-select best template
    if (newImages.length >= 2) {
      autoSelectTemplate(newImages.length);
    }
  }, [autoSelectTemplate]);

  const getTemplateConfig = () => allTemplates.find((t) => t.value === template) || allTemplates[0];

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
          trackImageProcessed();
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
    <div className="min-h-full">
      <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('collage.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('collage.uploadDesc')}
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6 hover-card-enhanced">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-foreground">{t('collage.template')}</label>
                    <span className="text-xs text-muted-foreground">
                      {uploadedImages.length} {t('collage.photos')}
                    </span>
                  </div>
                  
                  {availableTemplates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t('collage.minImages')}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                      {availableTemplates.map((tpl) => (
                        <Button
                          key={tpl.value}
                          variant={template === tpl.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTemplate(tpl.value)}
                          className="justify-between text-xs h-8"
                        >
                          <span>{tpl.label}</span>
                          <span className="opacity-60">{tpl.minImages} {t('collage.photos')}</span>
                        </Button>
                      ))}
                    </div>
                  )}
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
                  
                  {/* Quick color options */}
                  <div className="flex gap-1 mt-2">
                    {['#ffffff', '#000000', '#f3f4f6', '#1f2937', '#fef3c7', '#dbeafe'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        className="w-6 h-6 rounded border border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
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

                <p className="text-xs text-muted-foreground text-center">
                  {t('collage.usingPhotos').replace('{count}', String(Math.min(uploadedImages.length, requiredImages))).replace('{total}', String(uploadedImages.length))}
                </p>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 hover-card-enhanced lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-4">{t('collage.uploadedPhotos')}</h3>
              
              {/* Uploaded Images Grid */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url}
                      alt={`Image ${index + 1}`}
                      className={`w-full h-20 object-cover rounded-lg transition-opacity ${
                        index < requiredImages ? 'opacity-100' : 'opacity-40'
                      }`}
                    />
                    <span className={`absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded ${
                      index < requiredImages 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                    {index >= requiredImages && (
                      <span className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg text-xs text-muted-foreground">
                        {t('collage.unused')}
                      </span>
                    )}
                  </div>
                ))}
                
                {/* Add more button */}
                <UploadZone 
                  onFilesSelected={(files) => {
                    const newImages = files.map(f => ({ file: f.file, url: f.preview }));
                    setUploadedImages([...uploadedImages, ...newImages]);
                  }}
                  multiple
                  className="w-full h-20 border-dashed border-2 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50"
                >
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </UploadZone>
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
