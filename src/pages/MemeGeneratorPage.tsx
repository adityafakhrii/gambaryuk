import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const MemeGeneratorPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [topY, setTopY] = useState(10);
  const [bottomY, setBottomY] = useState(90);
  const [textX, setTextX] = useState(50);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgObjRef = useRef<HTMLImageElement | null>(null);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setPreviewUrl('');
    setResultBlob(null);
    // Preload image object
    const img = new Image();
    img.onload = () => { imgObjRef.current = img; };
    img.src = files[0]?.preview || '';
  };

  const drawMeme = useCallback(() => {
    const img = imgObjRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || images.length === 0) return;

    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const scale = img.width / 600;
    const actualSize = Math.round(fontSize * scale);
    const maxWidth = img.width * 0.9;
    const xPos = (textX / 100) * img.width;

    const drawText = (text: string, x: number, y: number) => {
      ctx.font = `bold ${actualSize}px Impact, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = actualSize / 12;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'white';
      ctx.lineJoin = 'round';

      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      lines.forEach((line, i) => {
        const lineY = y + i * (actualSize * 1.1);
        ctx.strokeText(line, x, lineY);
        ctx.fillText(line, x, lineY);
      });
      return lines.length;
    };

    if (topText) {
      drawText(topText.toUpperCase(), xPos, (topY / 100) * img.height);
    }
    if (bottomText) {
      // Calculate lines to offset upward
      ctx.font = `bold ${actualSize}px Impact, sans-serif`;
      const words = bottomText.split(' ');
      let lines = 1, cur = '';
      for (const word of words) {
        const test = cur ? `${cur} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && cur) { lines++; cur = word; } else { cur = test; }
      }
      const yPos = (bottomY / 100) * img.height - (lines - 1) * actualSize * 1.1;
      drawText(bottomText.toUpperCase(), xPos, yPos);
    }

    setPreviewUrl(canvas.toDataURL('image/png'));
  }, [images, topText, bottomText, fontSize, topY, bottomY, textX]);

  // Real-time preview update
  useEffect(() => {
    if (imgObjRef.current && images.length > 0) {
      drawMeme();
    }
  }, [drawMeme]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawMeme();
    canvas.toBlob(blob => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'meme.png';
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(t('common.success'));
    }, 'image/png');
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.meme.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.meme.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('meme.topText')}</label>
                  <Input value={topText} onChange={(e) => setTopText(e.target.value)} placeholder={t('meme.topPlaceholder')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('meme.bottomText')}</label>
                  <Input value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder={t('meme.bottomPlaceholder')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('meme.fontSize')}: {fontSize}px</label>
                  <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={24} max={96} />
                </div>

                <div className="border-t border-border/50 pt-3 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Posisi Teks</p>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Posisi Horizontal: {textX}%</label>
                    <Slider value={[textX]} onValueChange={([v]) => setTextX(v)} min={10} max={90} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Posisi Teks Atas: {topY}%</label>
                    <Slider value={[topY]} onValueChange={([v]) => setTopY(v)} min={5} max={50} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Posisi Teks Bawah: {bottomY}%</label>
                    <Slider value={[bottomY]} onValueChange={([v]) => setBottomY(v)} min={50} max={98} />
                  </div>
                </div>

                {previewUrl && (
                  <Button className="w-full" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" /> {t('common.download')}
                  </Button>
                )}

                <Button variant="ghost" className="w-full" onClick={() => { setImages([]); setPreviewUrl(''); setTopText(''); setBottomText(''); }}>
                  <Trash2 className="h-4 w-4 mr-2" /> {t('common.clearAll')}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft">
                <img src={previewUrl || images[0].preview} alt="Meme" className="w-full rounded-xl" />
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default MemeGeneratorPage;
