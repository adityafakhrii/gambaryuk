import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackImageProcessed } from '@/hooks/useImageStats';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Download, Eraser, RefreshCw, Loader2 } from 'lucide-react';
import { downloadImage, formatFileSize } from '@/lib/imageProcessing';

const RemoveBgPage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tolerance, setTolerance] = useState(30);
  const [edgeSoftness, setEdgeSoftness] = useState(2);
  const [bgType, setBgType] = useState<'transparent' | 'white' | 'black' | 'custom'>('transparent');
  const [customBgColor, setCustomBgColor] = useState('#00ff00');

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

  const removeBackground = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = selectedImage.url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Detect background color from corners (more accurate)
      const samplePoints = [
        0, // top-left
        (canvas.width - 1) * 4, // top-right
        (canvas.height - 1) * canvas.width * 4, // bottom-left
        ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 // bottom-right
      ];
      
      let bgR = 0, bgG = 0, bgB = 0;
      samplePoints.forEach(i => {
        bgR += data[i];
        bgG += data[i + 1];
        bgB += data[i + 2];
      });
      bgR = Math.round(bgR / 4);
      bgG = Math.round(bgG / 4);
      bgB = Math.round(bgB / 4);
      
      // Create alpha mask based on color distance
      const alphaMask = new Float32Array(data.length / 4);
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate color distance from background
        const distance = Math.sqrt(
          Math.pow(r - bgR, 2) + 
          Math.pow(g - bgG, 2) + 
          Math.pow(b - bgB, 2)
        );
        
        const maxDistance = tolerance * 4.42; // Scale tolerance to RGB space
        
        if (distance < maxDistance) {
          // Smooth transition based on distance
          alphaMask[i / 4] = Math.min(1, distance / maxDistance);
        } else {
          alphaMask[i / 4] = 1;
        }
      }
      
      // Apply edge softness with simple blur on alpha mask
      if (edgeSoftness > 0) {
        const width = canvas.width;
        const height = canvas.height;
        const blurRadius = edgeSoftness;
        
        const tempMask = new Float32Array(alphaMask);
        
        for (let y = blurRadius; y < height - blurRadius; y++) {
          for (let x = blurRadius; x < width - blurRadius; x++) {
            let sum = 0;
            let count = 0;
            
            for (let dy = -blurRadius; dy <= blurRadius; dy++) {
              for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                const idx = (y + dy) * width + (x + dx);
                sum += tempMask[idx];
                count++;
              }
            }
            
            alphaMask[y * width + x] = sum / count;
          }
        }
      }
      
      // Apply alpha mask to image
      for (let i = 0; i < data.length; i += 4) {
        const alpha = Math.round(alphaMask[i / 4] * 255);
        data[i + 3] = alpha;
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Apply background if not transparent
      if (bgType !== 'transparent') {
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const finalCtx = finalCanvas.getContext('2d')!;
        
        if (bgType === 'white') {
          finalCtx.fillStyle = '#ffffff';
        } else if (bgType === 'black') {
          finalCtx.fillStyle = '#000000';
        } else {
          finalCtx.fillStyle = customBgColor;
        }
        
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        finalCtx.drawImage(canvas, 0, 0);
        
        finalCanvas.toBlob((blob) => {
          if (blob) {
            setProcessedImage({
              url: URL.createObjectURL(blob),
              blob,
            });
            trackImageProcessed();
          }
          setIsProcessing(false);
        }, 'image/png');
      } else {
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
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage && selectedImage) {
      const filename = selectedImage.file.name.replace(/\.[^/.]+$/, '') + '_nobg.png';
      downloadImage(processedImage.blob, filename);
    }
  };

  const bgOptions = [
    { value: 'transparent' as const, label: 'Transparan', color: '' },
    { value: 'white' as const, label: 'Putih', color: '#ffffff' },
    { value: 'black' as const, label: 'Hitam', color: '#000000' },
    { value: 'custom' as const, label: 'Custom', color: customBgColor },
  ];

  return (
    <div className="min-h-full">
      <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('removeBg.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('removeBg.processing')}
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6 hover-card-enhanced">
              <h3 className="font-semibold text-foreground mb-4">Pengaturan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Toleransi Warna: {tolerance}
                  </label>
                  <Slider
                    value={[tolerance]}
                    max={100}
                    min={5}
                    step={5}
                    onValueChange={([v]) => setTolerance(v)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Semakin tinggi = lebih banyak warna dihapus
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Kehalusan Tepi: {edgeSoftness}px
                  </label>
                  <Slider
                    value={[edgeSoftness]}
                    max={10}
                    min={0}
                    step={1}
                    onValueChange={([v]) => setEdgeSoftness(v)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Background Baru</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {bgOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={bgType === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBgType(option.value)}
                        className="relative"
                      >
                        {option.value !== 'transparent' && option.value !== 'custom' && (
                          <span 
                            className="w-3 h-3 rounded-full mr-2 border" 
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                        {option.value === 'transparent' && (
                          <span className="w-3 h-3 mr-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />
                        )}
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  
                  {bgType === 'custom' && (
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-full h-10 mt-2 rounded cursor-pointer"
                    />
                  )}
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button
                  className="w-full btn-accent"
                  onClick={removeBackground}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : (
                    <>
                      <Eraser className="w-4 h-4 mr-2" />
                      {t('removeBg.title')}
                    </>
                  )}
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

            {/* Original */}
            <Card className="p-6 hover-card-enhanced">
              <h3 className="font-semibold text-foreground mb-4">{t('common.original')}</h3>
              <div className="relative overflow-hidden rounded-lg bg-muted aspect-square flex items-center justify-center">
                {selectedImage && (
                  <img
                    src={selectedImage.url}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
            </Card>

            {/* Result */}
            <Card className="p-6 hover-card-enhanced">
              <h3 className="font-semibold text-foreground mb-4">{t('common.result')}</h3>
              <div 
                className="relative overflow-hidden rounded-lg aspect-square flex items-center justify-center"
                style={{
                  backgroundImage: 'linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  backgroundColor: 'hsl(var(--background))',
                }}
              >
                {processedImage ? (
                  <img
                    src={processedImage.url}
                    alt="Result"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <p className="text-muted-foreground text-center p-8">
                    {isProcessing ? t('common.processing') : 'Hasil akan muncul di sini'}
                  </p>
                )}
              </div>
              
              {processedImage && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {t('common.size')}: {formatFileSize(processedImage.blob.size)}
                  </p>
                  <Button onClick={handleDownload} className="btn-accent">
                    <Download className="w-4 h-4 mr-2" />
                    {t('common.download')}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
        
        <div className="mt-8 p-4 rounded-lg bg-card/80 backdrop-blur border border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Tips: Gunakan gambar dengan latar belakang yang kontras dengan objek untuk hasil terbaik. Sesuaikan toleransi warna jika terlalu banyak atau terlalu sedikit yang terhapus.
          </p>
        </div>
      </main>
    </div>
  );
};

export default RemoveBgPage;
