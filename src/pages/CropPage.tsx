import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackImageProcessed } from '@/hooks/useImageStats';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Crop, RotateCcw, Move } from 'lucide-react';
import { loadImage, downloadImage, formatFileSize } from '@/lib/imageProcessing';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SocialMediaPreset {
  label: string;
  platform: string;
  value: string;
  ratio: number | null;
  size?: { width: number; height: number };
}

const CropPage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ file: File; url: string } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [processedImage, setProcessedImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const socialMediaPresets: SocialMediaPreset[] = [
    { label: 'Bebas', platform: '', value: 'free', ratio: null },
    { label: 'Kotak (1:1)', platform: '', value: '1:1', ratio: 1 },
    { label: 'Instagram Post', platform: 'Instagram', value: 'ig-post', ratio: 1, size: { width: 1080, height: 1080 } },
    { label: 'Instagram Story', platform: 'Instagram', value: 'ig-story', ratio: 9/16, size: { width: 1080, height: 1920 } },
    { label: 'Instagram Landscape', platform: 'Instagram', value: 'ig-landscape', ratio: 1.91, size: { width: 1080, height: 566 } },
    { label: 'Instagram Portrait', platform: 'Instagram', value: 'ig-portrait', ratio: 4/5, size: { width: 1080, height: 1350 } },
    { label: 'TikTok Video', platform: 'TikTok', value: 'tiktok', ratio: 9/16, size: { width: 1080, height: 1920 } },
    { label: 'YouTube Thumbnail', platform: 'YouTube', value: 'yt-thumb', ratio: 16/9, size: { width: 1280, height: 720 } },
    { label: 'YouTube Banner', platform: 'YouTube', value: 'yt-banner', ratio: 16/9, size: { width: 2560, height: 1440 } },
    { label: 'Facebook Post', platform: 'Facebook', value: 'fb-post', ratio: 1.91, size: { width: 1200, height: 630 } },
    { label: 'Facebook Cover', platform: 'Facebook', value: 'fb-cover', ratio: 2.7, size: { width: 820, height: 312 } },
    { label: 'Facebook Profile', platform: 'Facebook', value: 'fb-profile', ratio: 1, size: { width: 170, height: 170 } },
    { label: 'Twitter Post', platform: 'Twitter/X', value: 'twitter-post', ratio: 16/9, size: { width: 1200, height: 675 } },
    { label: 'Twitter Header', platform: 'Twitter/X', value: 'twitter-header', ratio: 3, size: { width: 1500, height: 500 } },
    { label: 'LinkedIn Post', platform: 'LinkedIn', value: 'linkedin-post', ratio: 1.91, size: { width: 1200, height: 627 } },
    { label: 'LinkedIn Cover', platform: 'LinkedIn', value: 'linkedin-cover', ratio: 4, size: { width: 1584, height: 396 } },
    { label: 'WhatsApp Status', platform: 'WhatsApp', value: 'wa-status', ratio: 9/16, size: { width: 1080, height: 1920 } },
    { label: 'Pinterest Pin', platform: 'Pinterest', value: 'pinterest', ratio: 2/3, size: { width: 1000, height: 1500 } },
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
      setImageDimensions({
        width: img.clientWidth,
        height: img.clientHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
      setCropArea({ x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight });
    }
  }, []);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current) {
        setImageDimensions(prev => ({
          ...prev,
          width: imageRef.current!.clientWidth,
          height: imageRef.current!.clientHeight,
        }));
      }
    };
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate scale factor between displayed image and natural image
  const getScale = () => {
    if (!imageDimensions.naturalWidth || !imageDimensions.width) return 1;
    return imageDimensions.width / imageDimensions.naturalWidth;
  };

  // Convert crop area to display coordinates
  const getCropOverlayStyle = () => {
    const scale = getScale();
    return {
      left: cropArea.x * scale,
      top: cropArea.y * scale,
      width: cropArea.width * scale,
      height: cropArea.height * scale,
    };
  };

  // Mouse/Touch event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const scale = getScale();
    const deltaX = (clientX - dragStart.x) / scale;
    const deltaY = (clientY - dragStart.y) / scale;
    
    setCropArea(prev => {
      const maxX = imageDimensions.naturalWidth - prev.width;
      const maxY = imageDimensions.naturalHeight - prev.height;
      
      return {
        ...prev,
        x: Math.max(0, Math.min(maxX, prev.x - deltaX)),
        y: Math.max(0, Math.min(maxY, prev.y - deltaY)),
      };
    });
    
    setDragStart({ x: clientX, y: clientY });
  }, [isDragging, dragStart, imageDimensions.naturalWidth, imageDimensions.naturalHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
          trackImageProcessed();
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

  const updateCropWithPreset = (presetValue: string) => {
    setAspectRatio(presetValue);
    if (!imageRef.current) return;
    
    const preset = socialMediaPresets.find(p => p.value === presetValue);
    if (!preset || preset.ratio === null) {
      setCropArea({
        x: 0,
        y: 0,
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
      return;
    }
    
    const img = imageRef.current;
    const targetRatio = preset.ratio;
    
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

  const getCurrentPreset = () => socialMediaPresets.find(p => p.value === aspectRatio);

  return (
    <div className="min-h-full">
      <main className="container relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('crop.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Pilih ukuran sesuai platform sosial media
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6 hover-card-enhanced">
              <h3 className="font-semibold text-foreground mb-4">Ukuran Social Media</h3>
              
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {['', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter/X', 'LinkedIn', 'WhatsApp', 'Pinterest'].map(platform => {
                  const platformPresets = socialMediaPresets.filter(p => p.platform === platform);
                  if (platformPresets.length === 0) return null;
                  
                  return (
                    <div key={platform || 'general'}>
                      {platform && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          {platform}
                        </p>
                      )}
                      <div className="grid grid-cols-1 gap-1.5">
                        {platformPresets.map((preset) => (
                          <Button
                            key={preset.value}
                            variant={aspectRatio === preset.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateCropWithPreset(preset.value)}
                            className="justify-between text-xs h-8"
                          >
                            <span>{preset.label}</span>
                            {preset.size && (
                              <span className="text-[10px] opacity-70">
                                {preset.size.width}×{preset.size.height}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Move className="w-4 h-4" />
                  <span>Geser gambar untuk memposisikan area crop</span>
                </div>
                
                <p className="text-sm text-foreground">
                  Posisi: X {Math.round(cropArea.x)}px, Y {Math.round(cropArea.y)}px
                </p>
                <p className="text-sm text-muted-foreground">
                  Ukuran: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px
                </p>
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
            <Card className="p-6 hover-card-enhanced lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-foreground">{t('common.original')}</h3>
                    {getCurrentPreset()?.size && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {getCurrentPreset()?.label}: {getCurrentPreset()?.size?.width}×{getCurrentPreset()?.size?.height}
                      </span>
                    )}
                  </div>
                  
                  {/* Interactive crop preview */}
                  <div 
                    ref={containerRef}
                    className="relative overflow-hidden rounded-lg bg-muted select-none"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                  >
                    {selectedImage && (
                      <>
                        <img
                          ref={imageRef}
                          src={selectedImage.url}
                          alt="Original"
                          className="w-full h-auto max-h-[400px] object-contain pointer-events-none"
                          onLoad={handleImageLoad}
                          draggable={false}
                        />
                        
                        {/* Dark overlay outside crop area */}
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(to right, 
                              rgba(0,0,0,0.6) ${getCropOverlayStyle().left}px, 
                              transparent ${getCropOverlayStyle().left}px, 
                              transparent ${getCropOverlayStyle().left + getCropOverlayStyle().width}px, 
                              rgba(0,0,0,0.6) ${getCropOverlayStyle().left + getCropOverlayStyle().width}px)`,
                          }}
                        />
                        
                        {/* Crop frame - draggable */}
                        <div
                          className="absolute border-2 border-primary shadow-lg transition-shadow"
                          style={{
                            left: getCropOverlayStyle().left,
                            top: getCropOverlayStyle().top,
                            width: getCropOverlayStyle().width,
                            height: getCropOverlayStyle().height,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                            cursor: isDragging ? 'grabbing' : 'grab',
                          }}
                          onMouseDown={handleMouseDown}
                          onTouchStart={handleMouseDown}
                        >
                          {/* Corner handles for visual feedback */}
                          <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-sm" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-sm" />
                          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-sm" />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-sm" />
                          
                          {/* Center move indicator */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-background/80 rounded-full p-2">
                              <Move className="w-5 h-5 text-foreground" />
                            </div>
                          </div>
                          
                          {/* Grid lines */}
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    Output: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px
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
