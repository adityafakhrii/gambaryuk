import { SEO } from '@/components/SEO';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Pencil, Square, Circle, ArrowRight, Type, Undo2, Download, Trash2, Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadImage } from '@/lib/imageProcessing';

type Tool = 'pen' | 'line' | 'rect' | 'circle' | 'arrow' | 'text';

interface DrawAction {
  tool: Tool;
  color: string;
  lineWidth: number;
  points?: { x: number; y: number }[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  text?: string;
  fontSize?: number;
}

const AnnotatePage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ff0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  const [textInput, setTextInput] = useState('');
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setActions([]);
  };

  // Load image onto canvas
  useEffect(() => {
    if (images.length === 0) return;
    const img = new Image();
    img.onload = () => {
      setImgElement(img);
      redrawCanvas(img, []);
    };
    img.src = images[0].preview;
  }, [images]);

  useEffect(() => {
    if (imgElement) redrawCanvas(imgElement, actions);
  }, [actions, imgElement]);

  const redrawCanvas = (img: HTMLImageElement, drawActions: DrawAction[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    for (const action of drawActions) {
      ctx.strokeStyle = action.color;
      ctx.fillStyle = action.color;
      ctx.lineWidth = action.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.tool === 'pen' && action.points && action.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        for (let i = 1; i < action.points.length; i++) {
          ctx.lineTo(action.points[i].x, action.points[i].y);
        }
        ctx.stroke();
      } else if (action.tool === 'line' && action.start && action.end) {
        ctx.beginPath();
        ctx.moveTo(action.start.x, action.start.y);
        ctx.lineTo(action.end.x, action.end.y);
        ctx.stroke();
      } else if (action.tool === 'rect' && action.start && action.end) {
        ctx.strokeRect(
          action.start.x, action.start.y,
          action.end.x - action.start.x, action.end.y - action.start.y
        );
      } else if (action.tool === 'circle' && action.start && action.end) {
        const rx = (action.end.x - action.start.x) / 2;
        const ry = (action.end.y - action.start.y) / 2;
        const cx = action.start.x + rx;
        const cy = action.start.y + ry;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (action.tool === 'arrow' && action.start && action.end) {
        const dx = action.end.x - action.start.x;
        const dy = action.end.y - action.start.y;
        const angle = Math.atan2(dy, dx);
        const headLen = 15 + action.lineWidth * 2;
        ctx.beginPath();
        ctx.moveTo(action.start.x, action.start.y);
        ctx.lineTo(action.end.x, action.end.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(action.end.x, action.end.y);
        ctx.lineTo(action.end.x - headLen * Math.cos(angle - Math.PI / 6), action.end.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(action.end.x - headLen * Math.cos(angle + Math.PI / 6), action.end.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (action.tool === 'text' && action.start && action.text) {
        ctx.font = `bold ${action.fontSize || 24}px sans-serif`;
        ctx.fillText(action.text, action.start.x, action.start.y);
      }
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    if (tool === 'text') {
      if (!textInput.trim()) {
        toast.error(t('annotate.enterText'));
        return;
      }
      const action: DrawAction = { tool: 'text', color, lineWidth, start: pos, text: textInput, fontSize };
      setActions(prev => [...prev, action]);
      return;
    }
    setIsDrawing(true);
    if (tool === 'pen') {
      setCurrentAction({ tool, color, lineWidth, points: [pos] });
    } else {
      setCurrentAction({ tool, color, lineWidth, start: pos, end: pos });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction) return;
    const pos = getCanvasCoords(e);
    if (tool === 'pen') {
      setCurrentAction(prev => prev ? { ...prev, points: [...(prev.points || []), pos] } : null);
    } else {
      setCurrentAction(prev => prev ? { ...prev, end: pos } : null);
    }
    // Live preview
    if (imgElement) redrawCanvas(imgElement, [...actions, { ...currentAction, ...(tool === 'pen' ? { points: [...(currentAction.points || []), pos] } : { end: pos }) }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAction) return;
    setIsDrawing(false);
    setActions(prev => [...prev, currentAction]);
    setCurrentAction(null);
  };

  const handleUndo = () => setActions(prev => prev.slice(0, -1));

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (blob) downloadImage(blob, `annotated-${images[0]?.file.name || 'image'}.png`);
    }, 'image/png');
  };

  const toolButtons: { id: Tool; icon: typeof Pencil; label: string }[] = [
    { id: 'pen', icon: Pencil, label: t('annotate.pen') },
    { id: 'line', icon: Minus, label: t('annotate.line') },
    { id: 'rect', icon: Square, label: t('annotate.rect') },
    { id: 'circle', icon: Circle, label: t('annotate.circle') },
    { id: 'arrow', icon: ArrowRight, label: t('annotate.arrow') },
    { id: 'text', icon: Type, label: t('annotate.text') },
  ];

  return (
    <div className="min-h-full">
      <SEO title={t('annotate.title')} description={t('feature.annotate.desc')} path="/annotate" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.annotate.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.annotate.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                {toolButtons.map(tb => (
                  <Button
                    key={tb.id}
                    variant={tool === tb.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTool(tb.id)}
                  >
                    <tb.icon className="h-4 w-4 mr-1" />
                    {tb.label}
                  </Button>
                ))}
                <div className="h-6 w-px bg-border mx-1" />
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0" />
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">{t('annotate.size')}</Label>
                  <Slider value={[lineWidth]} onValueChange={v => setLineWidth(v[0])} min={1} max={20} step={1} className="w-20" />
                </div>
                {tool === 'text' && (
                  <>
                    <Input
                      placeholder={t('annotate.textPlaceholder')}
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      className="w-40 h-8 text-sm"
                    />
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Px</Label>
                      <Slider value={[fontSize]} onValueChange={v => setFontSize(v[0])} min={12} max={72} step={2} className="w-16" />
                      <span className="text-xs text-muted-foreground">{fontSize}</span>
                    </div>
                  </>
                )}
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleUndo} disabled={actions.length === 0}>
                    <Undo2 className="h-4 w-4 mr-1" /> {t('annotate.undo')}
                  </Button>
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> {t('common.download')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setImages([]); setActions([]); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft overflow-auto">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="max-w-full h-auto cursor-crosshair mx-auto block rounded-lg"
                style={{ maxHeight: '70vh' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotatePage;
