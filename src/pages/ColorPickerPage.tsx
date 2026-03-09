import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Copy, Check, Trash2, Pipette } from 'lucide-react';
import { toast } from 'sonner';

interface PickedColor {
  hex: string;
  rgb: string;
  hsl: string;
}

const ColorPickerPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [pickedColors, setPickedColors] = useState<PickedColor[]>([]);
  const [hoverColor, setHoverColor] = useState<PickedColor | null>(null);
  const [dominantColors, setDominantColors] = useState<PickedColor[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const rgbToHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const makeColor = (r: number, g: number, b: number): PickedColor => ({
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: rgbToHsl(r, g, b),
  });

  const extractDominantColors = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorMap: Record<string, { r: number; g: number; b: number; count: number }> = {};

    for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `${r}-${g}-${b}`;
      if (!colorMap[key]) colorMap[key] = { r, g, b, count: 0 };
      colorMap[key].count++;
    }

    const sorted = Object.values(colorMap).sort((a, b) => b.count - a.count).slice(0, 8);
    setDominantColors(sorted.map(c => makeColor(c.r, c.g, c.b)));
  }, []);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    if (files.length > 0) {
      setSelectedImage(files[0]);
      setPickedColors([]);
      setHoverColor(null);

      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        extractDominantColors(canvas);
      };
      img.src = files[0].preview;
    }
  };

  const getColorAtPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext('2d')!;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return makeColor(r, g, b);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setHoverColor(getColorAtPos(e));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColorAtPos(e);
    setPickedColors(prev => [color, ...prev].slice(0, 20));
    toast.success(`Picked ${color.hex}`);
  };

  const copyColor = (value: string, idx: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIdx(idx);
    toast.success('Copied!');
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const ColorSwatch = ({ color, idx, label }: { color: PickedColor; idx: number; label?: string }) => (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2.5 shadow-soft">
      <div
        className="w-10 h-10 rounded-lg border border-border/50 flex-shrink-0"
        style={{ backgroundColor: color.hex }}
      />
      <div className="flex-1 min-w-0 space-y-0.5">
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
        <div className="text-sm font-mono font-semibold text-foreground">{color.hex}</div>
        <div className="text-xs text-muted-foreground font-mono">{color.rgb}</div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 flex-shrink-0"
        onClick={() => copyColor(color.hex, idx)}
      >
        {copiedIdx === idx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.colorPicker.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.colorPicker.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft">
                <div className="flex items-center gap-2 mb-2">
                  <Pipette className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{t('colorPicker.clickToPick')}</span>
                  {hoverColor && (
                    <div className="ml-auto flex items-center gap-2">
                      <div className="w-6 h-6 rounded border border-border/50" style={{ backgroundColor: hoverColor.hex }} />
                      <span className="text-xs font-mono text-foreground">{hoverColor.hex}</span>
                    </div>
                  )}
                </div>
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-xl cursor-crosshair border border-border/30"
                  onMouseMove={handleCanvasMove}
                  onClick={handleCanvasClick}
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="ghost" onClick={() => { setImages([]); setSelectedImage(null); setPickedColors([]); setDominantColors([]); }}>
                    <Trash2 className="h-4 w-4 mr-1" /> {t('common.clearAll')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Colors panel */}
            <div className="space-y-4">
              {/* Dominant palette */}
              {dominantColors.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft">
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t('colorPicker.dominant')}</h3>
                  <div className="grid grid-cols-4 gap-1.5">
                    {dominantColors.map((c, i) => (
                      <button
                        key={i}
                        className="aspect-square rounded-lg border border-border/50 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c.hex }}
                        onClick={() => copyColor(c.hex, 100 + i)}
                        title={c.hex}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Picked colors */}
              {pickedColors.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft">
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t('colorPicker.picked')}</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {pickedColors.map((c, i) => (
                      <ColorSwatch key={i} color={c} idx={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPickerPage;
