import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';
import { downloadAsZip } from '@/lib/zipDownload';

interface SplitResult {
  row: number;
  col: number;
  blob: Blob;
  url: string;
}

const GRID_OPTIONS = [
  { value: '2x2', cols: 2, rows: 2, label: '2×2 (4 parts)' },
  { value: '3x3', cols: 3, rows: 3, label: '3×3 (9 parts)' },
  { value: '2x3', cols: 2, rows: 3, label: '2×3 (6 parts)' },
  { value: '3x2', cols: 3, rows: 2, label: '3×2 (6 parts)' },
  { value: '4x4', cols: 4, rows: 4, label: '4×4 (16 parts)' },
  { value: '1x3', cols: 1, rows: 3, label: '1×3 (3 slides)' },
  { value: '1x5', cols: 1, rows: 5, label: '1×5 (5 slides)' },
];

const SplitterPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [grid, setGrid] = useState('3x3');
  const [results, setResults] = useState<SplitResult[]>([]);
  const [processing, setProcessing] = useState(false);

  const selectedGrid = GRID_OPTIONS.find(g => g.value === grid)!;

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setResults([]);
  };

  const splitImage = async () => {
    if (images.length === 0) return;
    setProcessing(true);

    const img = new Image();
    img.src = images[0].preview;
    await new Promise(r => { img.onload = r; });

    const { cols, rows } = selectedGrid;
    const cellW = Math.floor(img.width / cols);
    const cellH = Math.floor(img.height / rows);
    const splits: SplitResult[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const canvas = document.createElement('canvas');
        canvas.width = cellW;
        canvas.height = cellH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
        const blob = await new Promise<Blob>(resolve =>
          canvas.toBlob(b => resolve(b!), 'image/png')
        );
        splits.push({ row, col, blob, url: URL.createObjectURL(blob) });
      }
    }

    setResults(splits);
    setProcessing(false);
    toast.success(t('common.success'));
  };

  const handleDownloadAll = async () => {
    const baseName = images[0].file.name.replace(/\.[^.]+$/, '');
    const files = results.map((r, i) => ({
      name: `${baseName}_${r.row + 1}x${r.col + 1}.png`,
      blob: r.blob,
    }));
    await downloadAsZip(files, `${baseName}-${grid}.zip`);
  };

  return (
    <div className="min-h-full page-gradient">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.splitter.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.splitter.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            {/* Controls */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <img src={images[0].preview} alt="Source" className="w-14 h-14 object-cover rounded-lg border border-border/50" />
                <div>
                  <p className="text-sm font-semibold text-foreground truncate max-w-40">{images[0].file.name}</p>
                  <p className="text-xs text-muted-foreground">{images[0].width}×{images[0].height}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">{t('splitter.grid')}:</label>
                <Select value={grid} onValueChange={(v) => { setGrid(v); setResults([]); }}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRID_OPTIONS.map(g => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={splitImage} disabled={processing}>
                <Grid3X3 className="h-4 w-4 mr-2" />
                {processing ? t('common.processing') : t('splitter.split')}
              </Button>

              {results.length > 0 && (
                <Button onClick={handleDownloadAll}>
                  <Download className="h-4 w-4 mr-2" /> {t('common.downloadAll')}
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={() => { setImages([]); setResults([]); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Grid preview */}
            {results.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${selectedGrid.cols}, 1fr)` }}
                >
                  {results.map((r, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={r.url}
                        alt={`Part ${i + 1}`}
                        className="w-full rounded-lg border border-border/30"
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 rounded-lg transition-colors flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground bg-card/80 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {r.row + 1},{r.col + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Original with grid overlay */}
            {results.length === 0 && (
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
                <div className="relative inline-block w-full">
                  <img src={images[0].preview} alt="Preview" className="w-full rounded-xl" />
                  {/* Grid overlay */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${selectedGrid.cols}, 1fr)`,
                      gridTemplateRows: `repeat(${selectedGrid.rows}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: selectedGrid.cols * selectedGrid.rows }).map((_, i) => (
                      <div key={i} className="border border-primary/40 border-dashed" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitterPage;
