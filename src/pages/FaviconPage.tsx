import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { downloadAsZip } from '@/lib/zipDownload';

interface GeneratedIcon {
  size: number;
  label: string;
  blob: Blob;
  url: string;
}

const ICON_SIZES = [
  { size: 16, label: 'Favicon 16×16' },
  { size: 32, label: 'Favicon 32×32' },
  { size: 48, label: 'Favicon 48×48' },
  { size: 64, label: 'Favicon 64×64' },
  { size: 128, label: 'Icon 128×128' },
  { size: 180, label: 'Apple Touch Icon' },
  { size: 192, label: 'Android Icon 192×192' },
  { size: 512, label: 'PWA Icon 512×512' },
];

const FaviconPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setIcons([]);
  };

  const generateIcons = async () => {
    if (images.length === 0) return;
    setProcessing(true);

    const img = new Image();
    img.src = images[0].preview;
    await new Promise((resolve) => { img.onload = resolve; });

    const results: GeneratedIcon[] = [];

    for (const { size, label } of ICON_SIZES) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // Draw image centered/cover
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );

      results.push({ size, label, blob, url: URL.createObjectURL(blob) });
    }

    setIcons(results);
    setProcessing(false);
    toast.success(t('common.success'));
  };

  const handleDownloadAll = async () => {
    const files = icons.map(icon => ({
      name: `icon-${icon.size}x${icon.size}.png`,
      blob: icon.blob,
    }));
    await downloadAsZip(files, 'favicon-pack.zip');
  };

  const handleDownloadSingle = (icon: GeneratedIcon) => {
    const a = document.createElement('a');
    a.href = icon.url;
    a.download = `icon-${icon.size}x${icon.size}.png`;
    a.click();
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.favicon.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.favicon.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            {/* Source preview */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft flex items-center gap-4">
              <img src={images[0].preview} alt="Source" className="w-20 h-20 object-cover rounded-xl border border-border/50" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{images[0].file.name}</p>
                <p className="text-sm text-muted-foreground">{images[0].width} × {images[0].height}</p>
              </div>
              <div className="flex gap-2">
                {icons.length === 0 && (
                  <Button onClick={generateIcons} disabled={processing}>
                    <Package className="h-4 w-4 mr-2" />
                    {processing ? t('common.processing') : t('favicon.generate')}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => { setImages([]); setIcons([]); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Generated icons */}
            {icons.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-foreground">{t('favicon.results')}</h3>
                  <Button onClick={handleDownloadAll}>
                    <Download className="h-4 w-4 mr-2" /> {t('favicon.downloadAll')}
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {icons.map((icon) => (
                    <div
                      key={icon.size}
                      className="rounded-2xl border border-border/50 bg-card p-3 shadow-soft flex flex-col items-center gap-2 hover-card-enhanced cursor-pointer"
                      onClick={() => handleDownloadSingle(icon)}
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-muted/30 rounded-xl">
                        <img
                          src={icon.url}
                          alt={icon.label}
                          className="border border-border/30 rounded"
                          style={{ width: Math.min(icon.size, 48), height: Math.min(icon.size, 48) }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-foreground">{icon.size}×{icon.size}</p>
                        <p className="text-xs text-muted-foreground">{icon.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaviconPage;
