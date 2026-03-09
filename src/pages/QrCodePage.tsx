import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const QrCodePage = () => {
  const { t } = useLanguage();
  const [text, setText] = useState('https://');
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [logoFile, setLogoFile] = useState<ImageFile | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQr = async () => {
    if (!text.trim()) return;
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });

      if (logoFile) {
        // Draw QR then overlay logo
        const canvas = canvasRef.current!;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 0, 0, size, size);

          const logo = new Image();
          logo.onload = () => {
            const logoSize = size * 0.2;
            const x = (size - logoSize) / 2;
            // White background behind logo
            ctx.fillStyle = bgColor;
            ctx.fillRect(x - 4, x - 4, logoSize + 8, logoSize + 8);
            ctx.drawImage(logo, x, x, logoSize, logoSize);
            setQrDataUrl(canvas.toDataURL('image/png'));
          };
          logo.src = logoFile.preview;
        };
        qrImg.src = dataUrl;
      } else {
        setQrDataUrl(dataUrl);
      }

      toast.success(t('common.success'));
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const handleDownload = (format: 'png' | 'svg') => {
    if (format === 'png') {
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = 'qrcode.png';
      a.click();
    } else {
      QRCode.toString(text, {
        type: 'svg',
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      }).then(svg => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.svg';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.qrCode.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.qrCode.desc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{t('qrCode.content')}</label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{t('qrCode.size')}: {size}px</label>
                <Slider value={[size]} onValueChange={([v]) => setSize(v)} min={128} max={1024} step={32} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('qrCode.fgColor')}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('qrCode.bgColor')}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{t('qrCode.errorLevel')}</label>
                <Select value={errorLevel} onValueChange={(v) => setErrorLevel(v as 'L' | 'M' | 'Q' | 'H')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{t('qrCode.logo')}</label>
                <UploadZone
                  onFilesSelected={(files) => setLogoFile(files[0] || null)}
                  multiple={false}
                  className="min-h-0 py-4"
                >
                  <p className="text-xs text-muted-foreground">
                    {logoFile ? logoFile.file.name : t('qrCode.logoHint')}
                  </p>
                </UploadZone>
              </div>

              <Button className="w-full" onClick={generateQr} disabled={!text.trim()}>
                <QrCode className="h-4 w-4 mr-2" /> {t('qrCode.generate')}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center">
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft w-full flex flex-col items-center">
              {qrDataUrl ? (
                <>
                  <img src={qrDataUrl} alt="QR Code" className="max-w-full rounded-xl" style={{ maxHeight: 400 }} />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleDownload('png')}>
                      <Download className="h-4 w-4 mr-2" /> PNG
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload('svg')}>
                      <Download className="h-4 w-4 mr-2" /> SVG
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <QrCode className="h-16 w-16 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">{t('qrCode.preview')}</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodePage;
