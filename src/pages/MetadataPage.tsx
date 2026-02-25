import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Info, Download, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MetadataEntry {
  key: string;
  value: string;
  category: string;
}

const MetadataPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [metadata, setMetadata] = useState<MetadataEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFilesSelected = async (files: ImageFile[]) => {
    setImages(files);
    if (files.length > 0) {
      setSelectedImage(files[0]);
      await extractMetadata(files[0]);
    }
  };

  const extractMetadata = async (image: ImageFile) => {
    setLoading(true);
    try {
      const exifr = await import('exifr');
      const allData = await exifr.default.parse(image.file, true);
      
      const entries: MetadataEntry[] = [];

      // Basic info
      entries.push({ key: 'File Name', value: image.file.name, category: 'Basic' });
      entries.push({ key: 'File Size', value: formatFileSize(image.file.size), category: 'Basic' });
      entries.push({ key: 'File Type', value: image.file.type, category: 'Basic' });
      entries.push({ key: 'Dimensions', value: `${image.width} × ${image.height}`, category: 'Basic' });

      if (allData) {
        const cameraKeys = ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO', 'Flash'];
        const dateKeys = ['DateTimeOriginal', 'CreateDate', 'ModifyDate'];
        const gpsKeys = ['latitude', 'longitude', 'GPSAltitude'];

        for (const [key, value] of Object.entries(allData)) {
          if (value === undefined || value === null || typeof value === 'object') continue;
          
          let category = 'Other';
          if (cameraKeys.includes(key)) category = 'Camera';
          else if (dateKeys.includes(key)) category = 'Date';
          else if (gpsKeys.includes(key)) category = 'GPS';

          entries.push({ key, value: String(value), category });
        }
      }

      setMetadata(entries);
    } catch {
      // No EXIF data found — just show basic info
      const entries: MetadataEntry[] = [
        { key: 'File Name', value: image.file.name, category: 'Basic' },
        { key: 'File Size', value: formatFileSize(image.file.size), category: 'Basic' },
        { key: 'File Type', value: image.file.type, category: 'Basic' },
        { key: 'Dimensions', value: `${image.width} × ${image.height}`, category: 'Basic' },
      ];
      setMetadata(entries);
    }
    setLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleCopyAll = () => {
    const text = metadata.map(m => `${m.key}: ${m.value}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t('common.success'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = metadata.map(m => `${m.key}: ${m.value}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedImage?.file.name || 'metadata'}-info.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = [...new Set(metadata.map(m => m.category))];

  return (
    <div className="min-h-full page-gradient">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.metadata.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.metadata.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            {/* Image preview */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
              <div className="flex items-start gap-4">
                <img
                  src={selectedImage?.preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-border/50"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{selectedImage?.file.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedImage?.width} × {selectedImage?.height}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={handleCopyAll} disabled={metadata.length === 0}>
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy All'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownloadTxt} disabled={metadata.length === 0}>
                      <Download className="h-4 w-4 mr-1" /> .txt
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setImages([]); setSelectedImage(null); setMetadata([]); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata table */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">{t('common.processing')}</div>
            ) : (
              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat} className="rounded-2xl border border-border/50 bg-card shadow-soft overflow-hidden">
                    <div className="px-4 py-2.5 bg-muted/50 border-b border-border/50">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        {cat}
                      </h3>
                    </div>
                    <div className="divide-y divide-border/30">
                      {metadata.filter(m => m.category === cat).map((entry, i) => (
                        <div key={i} className="px-4 py-2 flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground flex-shrink-0">{entry.key}</span>
                          <span className="text-sm font-medium text-foreground truncate text-right">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataPage;
