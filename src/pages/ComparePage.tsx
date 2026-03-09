import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowLeftRight } from 'lucide-react';

const ComparePage = () => {
  const { t } = useLanguage();
  const [imageA, setImageA] = useState<ImageFile | null>(null);
  const [imageB, setImageB] = useState<ImageFile | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [step, setStep] = useState<'a' | 'b' | 'compare'>('a');
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleSelectA = (files: ImageFile[]) => {
    if (files.length > 0) {
      setImageA(files[0]);
      setStep('b');
    }
  };

  const handleSelectB = (files: ImageFile[]) => {
    if (files.length > 0) {
      setImageB(files[0]);
      setStep('compare');
    }
  };

  const updateSlider = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSliderPos(x * 100);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updateSlider(e);
    const onMove = (ev: MouseEvent) => {
      if (dragging.current) updateSlider(ev);
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const reset = () => {
    setImageA(null);
    setImageB(null);
    setStep('a');
    setSliderPos(50);
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.compare.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.compare.desc')}</p>
        </div>

        {step === 'a' && (
          <div>
            <p className="text-sm font-medium text-foreground text-center mb-3">{t('compare.uploadFirst')}</p>
            <UploadZone onFilesSelected={handleSelectA} multiple={false} />
          </div>
        )}

        {step === 'b' && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src={imageA!.preview} alt="A" className="w-16 h-16 object-cover rounded-lg border border-border/50" />
              <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground text-xs">?</div>
            </div>
            <p className="text-sm font-medium text-foreground text-center mb-3">{t('compare.uploadSecond')}</p>
            <UploadZone onFilesSelected={handleSelectB} multiple={false} />
          </div>
        )}

        {step === 'compare' && imageA && imageB && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={reset}>
                <Trash2 className="h-4 w-4 mr-1" /> {t('common.clearAll')}
              </Button>
            </div>

            {/* Comparison slider */}
            <div
              ref={containerRef}
              className="relative rounded-2xl overflow-hidden border border-border/50 shadow-soft cursor-col-resize select-none"
              onMouseDown={handleMouseDown}
            >
              {/* Image B (full background) */}
              <img src={imageB.preview} alt="After" className="w-full block" draggable={false} />

              {/* Image A (clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={imageA.preview}
                  alt="Before"
                  className="block"
                  style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%', maxWidth: 'none' }}
                  draggable={false}
                />
              </div>

              {/* Slider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-card shadow-md z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-card border-2 border-primary shadow-lg flex items-center justify-center">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-3 left-3 bg-card/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold text-foreground z-20">
                {t('compare.before')}
              </div>
              <div className="absolute top-3 right-3 bg-card/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold text-foreground z-20">
                {t('compare.after')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
