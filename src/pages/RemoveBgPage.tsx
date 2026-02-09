import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Eraser, RefreshCw, Loader2 } from 'lucide-react';
import { downloadImage, formatFileSize } from '@/lib/imageProcessing';

const RemoveBgPage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
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
    }
  }, []);

  const removeBackground = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    try {
      // Note: This is a placeholder implementation
      // For real background removal, you would need a library like @imgly/background-removal
      // or an external API like remove.bg
      
      // Simulating processing with a simple transparency effect as placeholder
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
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple background removal: make near-white pixels transparent
      // This is a basic implementation - real apps would use AI/ML
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Check if pixel is close to white
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // Make transparent
        }
      }
      
      ctx.putImageData(imageData, 0, 0);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('removeBg.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('removeBg.processing')}
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Original */}
            <Card className="p-6">
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
              
              <div className="mt-4 space-y-2">
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

            {/* Result */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">{t('common.result')}</h3>
              <div 
                className="relative overflow-hidden rounded-lg aspect-square flex items-center justify-center"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
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
                    {isProcessing ? t('common.processing') : 'Result will appear here'}
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
        
        <div className="mt-8 p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Fitur ini menggunakan algoritma sederhana. Untuk hasil terbaik, gunakan gambar dengan latar belakang polos.
          </p>
        </div>
      </main>
    </div>
  );
};

export default RemoveBgPage;