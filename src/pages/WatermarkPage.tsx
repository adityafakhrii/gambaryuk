import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Stamp, RefreshCw, Type, Image, Calendar } from 'lucide-react';
import { loadImage, downloadImage, formatFileSize } from '@/lib/imageProcessing';

type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type WatermarkType = 'text' | 'image';

const WatermarkPage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
  
  // Watermark settings
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [watermarkText, setWatermarkText] = useState('© My Watermark');
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);
  
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#ffffff');
  const [imageScale, setImageScale] = useState(20); // percentage of main image width
  
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const watermarkInputRef = useRef<HTMLInputElement>(null);

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

  const quickTexts = [
    { label: 'Tanggal Hari Ini', value: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Copyright', value: '© ' + new Date().getFullYear() },
    { label: 'Timestamp', value: new Date().toLocaleString('id-ID') },
    { label: 'Confidential', value: 'CONFIDENTIAL' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Sample', value: 'SAMPLE' },
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

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setWatermarkImage(url);
      setWatermarkImageFile(file);
    }
  };

  const getPositionCoords = (pos: WatermarkPosition, canvasW: number, canvasH: number, objW: number, objH: number) => {
    const padding = 20;
    const positions: Record<WatermarkPosition, { x: number; y: number }> = {
      'top-left': { x: padding, y: padding },
      'top-center': { x: (canvasW - objW) / 2, y: padding },
      'top-right': { x: canvasW - objW - padding, y: padding },
      'center-left': { x: padding, y: (canvasH - objH) / 2 },
      'center': { x: (canvasW - objW) / 2, y: (canvasH - objH) / 2 },
      'center-right': { x: canvasW - objW - padding, y: (canvasH - objH) / 2 },
      'bottom-left': { x: padding, y: canvasH - objH - padding },
      'bottom-center': { x: (canvasW - objW) / 2, y: canvasH - objH - padding },
      'bottom-right': { x: canvasW - objW - padding, y: canvasH - objH - padding },
    };
    return positions[pos];
  };

  const applyWatermark = async () => {
    if (!selectedImage) return;
    if (watermarkType === 'text' && !watermarkText.trim()) return;
    if (watermarkType === 'image' && !watermarkImage) return;
    
    setIsProcessing(true);
    try {
      const img = await loadImage(selectedImage.url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      ctx.globalAlpha = opacity / 100;

      if (watermarkType === 'text') {
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = color;
        
        // Add shadow for better visibility
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        const metrics = ctx.measureText(watermarkText);
        const textWidth = metrics.width;
        const textHeight = fontSize;
        
        const coords = getPositionCoords(position, canvas.width, canvas.height, textWidth, textHeight);
        ctx.fillText(watermarkText, coords.x, coords.y + textHeight);
      } else if (watermarkType === 'image' && watermarkImage) {
        const wmImg = await loadImage(watermarkImage);
        
        // Calculate watermark size based on scale percentage
        const maxWidth = canvas.width * (imageScale / 100);
        const ratio = wmImg.naturalWidth / wmImg.naturalHeight;
        const wmWidth = maxWidth;
        const wmHeight = maxWidth / ratio;
        
        const coords = getPositionCoords(position, canvas.width, canvas.height, wmWidth, wmHeight);
        ctx.drawImage(wmImg, coords.x, coords.y, wmWidth, wmHeight);
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
    <div className="min-h-full page-gradient">
      <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('watermark.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Tambahkan teks, logo, atau tanggal sebagai watermark
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6 hover-card-enhanced">
              <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as WatermarkType)}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="text" className="gap-1">
                    <Type className="w-4 h-4" />
                    Teks
                  </TabsTrigger>
                  <TabsTrigger value="image" className="gap-1">
                    <Image className="w-4 h-4" />
                    Logo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  {/* Quick text options */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Teks Cepat</label>
                    <div className="flex flex-wrap gap-1.5">
                      {quickTexts.map((qt) => (
                        <Button
                          key={qt.label}
                          variant="outline"
                          size="sm"
                          onClick={() => setWatermarkText(qt.value)}
                          className="text-xs h-7"
                        >
                          {qt.label}
                        </Button>
                      ))}
                    </div>
                  </div>

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
                    
                    {/* Quick colors */}
                    <div className="flex gap-1 mt-2">
                      {['#ffffff', '#000000', '#ff0000', '#ffff00', '#00ff00', '#0000ff'].map(c => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className="w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Upload Logo/Gambar</label>
                    <input
                      ref={watermarkInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleWatermarkImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => watermarkInputRef.current?.click()}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      {watermarkImage ? 'Ganti Logo' : 'Pilih Logo'}
                    </Button>
                    
                    {watermarkImage && (
                      <div className="mt-2 p-2 bg-muted rounded-lg">
                        <img 
                          src={watermarkImage} 
                          alt="Watermark preview" 
                          className="max-h-20 mx-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Ukuran Logo: {imageScale}%</label>
                    <Slider
                      value={[imageScale]}
                      max={50}
                      min={5}
                      step={5}
                      onValueChange={([v]) => setImageScale(v)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Persentase dari lebar gambar utama
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Common settings */}
              <div className="space-y-4 mt-4 pt-4 border-t border-border">
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
              </div>

              <div className="space-y-2 mt-4">
                <Button
                  className="w-full btn-accent"
                  onClick={applyWatermark}
                  disabled={isProcessing || (watermarkType === 'text' && !watermarkText.trim()) || (watermarkType === 'image' && !watermarkImage)}
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
            <Card className="p-6 hover-card-enhanced lg:col-span-2">
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
