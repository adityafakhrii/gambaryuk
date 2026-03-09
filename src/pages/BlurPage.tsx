import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, Trash2, EyeOff, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlurRegion {
  x: number; y: number; w: number; h: number;
}

const BlurPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [regions, setRegions] = useState<BlurRegion[]>([]);
  const [blurAmount, setBlurAmount] = useState(20);
  const [mode, setMode] = useState<'blur' | 'pixelate'>('blur');
  const [processedUrl, setProcessedUrl] = useState('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<BlurRegion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setRegions([]);
    setProcessedUrl('');
  };

  const getRelativePos = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    setDrawing(true);
    setStartPos(pos);
    setCurrentRect(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !startPos) return;
    const pos = getRelativePos(e);
    setCurrentRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (currentRect && currentRect.w > 0.01 && currentRect.h > 0.01) {
      setRegions(prev => [...prev, currentRect]);
    }
    setDrawing(false);
    setStartPos(null);
    setCurrentRect(null);
  };

  const applyBlur = useCallback(async () => {
    if (images.length === 0 || regions.length === 0) return;

    const img = new Image();
    img.src = images[0].preview;
    await new Promise(r => { img.onload = r; });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    for (const region of regions) {
      const rx = Math.round(region.x * img.width);
      const ry = Math.round(region.y * img.height);
      const rw = Math.round(region.w * img.width);
      const rh = Math.round(region.h * img.height);

      if (mode === 'pixelate') {
        const pixelSize = Math.max(4, Math.round(blurAmount / 2));
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = rw;
        tempCanvas.height = rh;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, rw, rh);

        const smallW = Math.max(1, Math.round(rw / pixelSize));
        const smallH = Math.max(1, Math.round(rh / pixelSize));
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = smallW;
        smallCanvas.height = smallH;
        const smallCtx = smallCanvas.getContext('2d')!;
        smallCtx.imageSmoothingEnabled = false;
        smallCtx.drawImage(tempCanvas, 0, 0, smallW, smallH);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(smallCanvas, 0, 0, smallW, smallH, rx, ry, rw, rh);
        ctx.imageSmoothingEnabled = true;
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
        // Redraw blurred region from a temp canvas for clean edges
      }
    }

    const blob = await new Promise<Blob>(resolve =>
      canvas.toBlob(b => resolve(b!), 'image/png')
    );
    setProcessedUrl(URL.createObjectURL(blob));
    setProcessedBlob(blob);
    toast.success(t('common.success'));
  }, [images, regions, blurAmount, mode, t]);

  const handleDownload = () => {
    if (!processedBlob) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `blurred-${images[0].file.name}`;
    a.click();
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.blur.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.blur.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            {/* Controls */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft flex flex-wrap items-center gap-4">
              <div className="inline-flex rounded-lg border border-border/50 p-0.5">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'blur' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setMode('blur')}
                >
                  {t('blur.gaussian')}
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'pixelate' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setMode('pixelate')}
                >
                  {t('blur.pixelate')}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-48">
                <span className="text-sm text-muted-foreground">{t('blur.intensity')}:</span>
                <Slider value={[blurAmount]} onValueChange={([v]) => setBlurAmount(v)} min={5} max={50} className="flex-1" />
                <span className="text-sm font-mono text-foreground w-8">{blurAmount}</span>
              </div>

              <Button size="sm" variant="outline" onClick={() => { setRegions(prev => prev.slice(0, -1)); setProcessedUrl(''); }}>
                <Undo2 className="h-4 w-4 mr-1" /> {t('blur.undo')}
              </Button>

              <Button onClick={applyBlur} disabled={regions.length === 0}>
                <EyeOff className="h-4 w-4 mr-2" /> {t('common.apply')} ({regions.length})
              </Button>

              {processedUrl && (
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> {t('common.download')}
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={() => { setImages([]); setRegions([]); setProcessedUrl(''); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">{t('blur.dragHint')}</p>

            {/* Canvas area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft">
                <h3 className="text-sm font-semibold text-foreground mb-2">{t('common.original')}</h3>
                <div
                  ref={containerRef}
                  className="relative cursor-crosshair select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img src={images[0].preview} alt="Original" className="w-full rounded-xl" draggable={false} />
                  {/* Drawn regions */}
                  {regions.map((r, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-destructive/70 bg-destructive/10 rounded"
                      style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}
                    />
                  ))}
                  {currentRect && (
                    <div
                      className="absolute border-2 border-primary border-dashed bg-primary/10 rounded"
                      style={{ left: `${currentRect.x * 100}%`, top: `${currentRect.y * 100}%`, width: `${currentRect.w * 100}%`, height: `${currentRect.h * 100}%` }}
                    />
                  )}
                </div>
              </div>

              {processedUrl && (
                <div className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft">
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t('common.result')}</h3>
                  <img src={processedUrl} alt="Blurred" className="w-full rounded-xl" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlurPage;
