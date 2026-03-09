import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Download, Trash2, Type } from 'lucide-react';
import { toast } from 'sonner';

const MemeGeneratorPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [resultUrl, setResultUrl] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setResultUrl('');
  };

  const drawMemeText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, size: number) => {
    ctx.font = `bold ${size}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = size / 12;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.lineJoin = 'round';

    // Word wrap
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
      const lineY = y + i * (size * 1.1);
      ctx.strokeText(line, x, lineY);
      ctx.fillText(line, x, lineY);
    });

    return lines.length;
  };

  const generateMeme = async () => {
    if (images.length === 0) return;

    const img = new Image();
    img.src = images[0].preview;
    await new Promise(r => { img.onload = r; });

    const canvas = canvasRef.current!;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const scale = img.width / 600;
    const actualSize = Math.round(fontSize * scale);
    const padding = actualSize * 0.8;
    const maxWidth = img.width * 0.9;

    if (topText) {
      drawMemeText(ctx, topText.toUpperCase(), img.width / 2, padding, maxWidth, actualSize);
    }
    if (bottomText) {
      // Calculate bottom text position
      ctx.font = `bold ${actualSize}px Impact, sans-serif`;
      const words = bottomText.split(' ');
      let lines = 1;
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines++;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      const bottomY = img.height - padding - (lines - 1) * actualSize * 1.1;
      drawMemeText(ctx, bottomText.toUpperCase(), img.width / 2, bottomY, maxWidth, actualSize);
    }

    const blob = await new Promise<Blob>(resolve =>
      canvas.toBlob(b => resolve(b!), 'image/png')
    );
    setResultUrl(URL.createObjectURL(blob));
    setResultBlob(blob);
    toast.success(t('common.success'));
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'meme.png';
    a.click();
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
            {/* Controls */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('meme.topText')}</label>
                  <Input
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder={t('meme.topPlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('meme.bottomText')}</label>
                  <Input
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder={t('meme.bottomPlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('meme.fontSize')}: {fontSize}px</label>
                  <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={24} max={96} />
                </div>

                <Button className="w-full" onClick={generateMeme}>
                  <Type className="h-4 w-4 mr-2" /> {t('meme.generate')}
                </Button>

                {resultUrl && (
                  <Button className="w-full" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" /> {t('common.download')}
                  </Button>
                )}

                <Button variant="ghost" className="w-full" onClick={() => { setImages([]); setResultUrl(''); setTopText(''); setBottomText(''); }}>
                  <Trash2 className="h-4 w-4 mr-2" /> {t('common.clearAll')}
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft">
                <img
                  src={resultUrl || images[0].preview}
                  alt="Meme"
                  className="w-full rounded-xl"
                />
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
