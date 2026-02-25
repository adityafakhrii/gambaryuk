import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const BG_PRESETS = [
  { value: 'gradient1', label: 'Ocean', colors: ['#667eea', '#764ba2'] },
  { value: 'gradient2', label: 'Sunset', colors: ['#f093fb', '#f5576c'] },
  { value: 'gradient3', label: 'Forest', colors: ['#11998e', '#38ef7d'] },
  { value: 'gradient4', label: 'Midnight', colors: ['#0f0c29', '#302b63'] },
  { value: 'gradient5', label: 'Peach', colors: ['#ffecd2', '#fcb69f'] },
  { value: 'gradient6', label: 'Slate', colors: ['#e2e8f0', '#cbd5e1'] },
];

const MOCKUP_STYLES = [
  { value: 'browser', label: 'Browser Window' },
  { value: 'none', label: 'No Mockup' },
];

const BeautifierPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [bgPreset, setBgPreset] = useState('gradient1');
  const [padding, setPadding] = useState(60);
  const [borderRadius, setBorderRadius] = useState(12);
  const [shadow, setShadow] = useState(30);
  const [mockup, setMockup] = useState('browser');
  const [resultUrl, setResultUrl] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setResultUrl('');
  };

  const generate = async () => {
    if (images.length === 0) return;

    const img = new Image();
    img.src = images[0].preview;
    await new Promise(r => { img.onload = r; });

    const scale = Math.min(1, 1920 / img.width);
    const imgW = Math.round(img.width * scale);
    const imgH = Math.round(img.height * scale);
    const pad = padding * 2;
    const canvasW = imgW + pad;
    const headerH = mockup === 'browser' ? 36 : 0;
    const canvasH = imgH + pad + headerH;

    const canvas = canvasRef.current!;
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const bg = BG_PRESETS.find(b => b.value === bgPreset)!;
    const gradient = ctx.createLinearGradient(0, 0, canvasW, canvasH);
    gradient.addColorStop(0, bg.colors[0]);
    gradient.addColorStop(1, bg.colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const x = padding;
    const y = padding;

    // Shadow
    if (shadow > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = shadow;
      ctx.shadowOffsetY = shadow / 3;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      roundRect(ctx, x, y, imgW, imgH + headerH, borderRadius);
      ctx.fill();
      ctx.restore();
    }

    // Browser mockup
    if (mockup === 'browser') {
      // Title bar
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      roundRectTop(ctx, x, y, imgW, headerH, borderRadius);
      ctx.fill();

      // Dots
      const dotY = y + headerH / 2;
      [['#ef4444', 0], ['#eab308', 1], ['#22c55e', 2]].forEach(([color, idx]) => {
        ctx.fillStyle = color as string;
        ctx.beginPath();
        ctx.arc(x + 16 + (idx as number) * 18, dotY, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // URL bar
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      roundRect(ctx, x + 80, dotY - 8, imgW - 110, 16, 4);
      ctx.fill();
    }

    // Clip for rounded image
    ctx.save();
    ctx.beginPath();
    if (mockup === 'browser') {
      roundRectBottom(ctx, x, y + headerH, imgW, imgH, borderRadius);
    } else {
      roundRect(ctx, x, y, imgW, imgH, borderRadius);
    }
    ctx.clip();
    ctx.drawImage(img, 0, 0, img.width, img.height, x, y + headerH, imgW, imgH);
    ctx.restore();

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, x, y, imgW, imgH + headerH, borderRadius);
    ctx.stroke();

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
    a.download = `beautified-${images[0].file.name}`;
    a.click();
  };

  return (
    <div className="min-h-full page-gradient">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.beautifier.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.beautifier.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">{t('beautifier.bg')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {BG_PRESETS.map(bg => (
                      <button
                        key={bg.value}
                        className={`h-10 rounded-lg border-2 transition-all ${bgPreset === bg.value ? 'border-primary scale-105' : 'border-border/50'}`}
                        style={{ background: `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]})` }}
                        onClick={() => setBgPreset(bg.value)}
                        title={bg.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('beautifier.mockup')}</label>
                  <Select value={mockup} onValueChange={setMockup}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MOCKUP_STYLES.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('beautifier.padding')}: {padding}px</label>
                  <Slider value={[padding]} onValueChange={([v]) => setPadding(v)} min={20} max={120} />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('beautifier.radius')}: {borderRadius}px</label>
                  <Slider value={[borderRadius]} onValueChange={([v]) => setBorderRadius(v)} min={0} max={32} />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('beautifier.shadow')}: {shadow}</label>
                  <Slider value={[shadow]} onValueChange={([v]) => setShadow(v)} min={0} max={60} />
                </div>

                <Button className="w-full" onClick={generate}>
                  <Sparkles className="h-4 w-4 mr-2" /> {t('beautifier.generate')}
                </Button>

                {resultUrl && (
                  <Button className="w-full" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" /> {t('common.download')}
                  </Button>
                )}

                <Button variant="ghost" className="w-full" onClick={() => { setImages([]); setResultUrl(''); }}>
                  <Trash2 className="h-4 w-4 mr-2" /> {t('common.clearAll')}
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft">
                {resultUrl ? (
                  <img src={resultUrl} alt="Beautified" className="w-full rounded-xl" />
                ) : (
                  <img src={images[0].preview} alt="Original" className="w-full rounded-xl" />
                )}
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

// Helper functions for rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectTop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectBottom(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y);
  ctx.closePath();
}

export default BeautifierPage;
