import { SEO } from '@/components/SEO';
import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, FileText, RefreshCw, Hash, Calendar, Type, Image, Ruler } from 'lucide-react';
import JSZip from 'jszip';

interface Token {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const RenamePage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [pattern, setPattern] = useState('image_{index}');
  const [startIndex, setStartIndex] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const tokens: Token[] = [
    { key: '{name}', label: 'Nama Asli', description: 'Nama file asli', icon: <Type className="w-3 h-3" /> },
    { key: '{index}', label: 'Nomor Urut', description: 'Angka urutan', icon: <Hash className="w-3 h-3" /> },
    { key: '{date}', label: 'Tanggal', description: 'Format YYYYMMDD', icon: <Calendar className="w-3 h-3" /> },
    { key: '{time}', label: 'Waktu', description: 'Format HHMMSS', icon: <Calendar className="w-3 h-3" /> },
    { key: '{ext}', label: 'Ekstensi', description: 'Format file asli', icon: <Image className="w-3 h-3" /> },
    { key: '{width}', label: 'Lebar', description: 'Lebar gambar', icon: <Ruler className="w-3 h-3" /> },
    { key: '{height}', label: 'Tinggi', description: 'Tinggi gambar', icon: <Ruler className="w-3 h-3" /> },
  ];

  const handleFilesSelected = useCallback((files: { file: File; preview: string }[]) => {
    const newImages = files.map((f) => ({
      file: f.file,
      url: f.preview,
    }));
    setUploadedImages(newImages);
  }, []);

  const insertToken = (token: string) => {
    const input = document.getElementById('pattern-input') as HTMLInputElement;
    if (input) {
      const start = input.selectionStart || pattern.length;
      const end = input.selectionEnd || pattern.length;
      const newPattern = pattern.slice(0, start) + token + pattern.slice(end);
      setPattern(newPattern);
      
      // Set cursor position after token
      setTimeout(() => {
        input.focus();
        const newPos = start + token.length;
        input.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      setPattern(pattern + token);
    }
  };

  const generateNewName = useCallback((file: File, index: number) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const originalName = file.name.replace(/\.[^/.]+$/, '');
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    
    const newName = pattern
      .replace(/{name}/g, originalName)
      .replace(/{index}/g, String(startIndex + index).padStart(2, '0'))
      .replace(/{date}/g, date)
      .replace(/{time}/g, time)
      .replace(/{ext}/g, ext)
      .replace(/{width}/g, 'W') // Placeholder, would need image dimensions
      .replace(/{height}/g, 'H'); // Placeholder
    
    return `${newName}.${ext}`;
  }, [pattern, startIndex]);

  const previewNames = useMemo(() => {
    return uploadedImages.map((img, index) => ({
      original: img.file.name,
      new: generateNewName(img.file, index),
    }));
  }, [uploadedImages, generateNewName]);

  const quickPatterns = [
    { label: 'Urutan', pattern: 'image_{index}' },
    { label: 'Tanggal + Urutan', pattern: 'foto_{date}_{index}' },
    { label: 'Nama + Urutan', pattern: '{name}_{index}' },
    { label: 'Tanggal + Waktu', pattern: 'img_{date}_{time}' },
  ];

  const downloadAsZip = async () => {
    if (uploadedImages.length === 0) return;
    
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        const newName = generateNewName(img.file, i);
        const arrayBuffer = await img.file.arrayBuffer();
        zip.file(newName, arrayBuffer);
      }
      
      const blob = await zip.generateAsync({ type: 'blob' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'renamed_images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-full">
      <SEO title={t('rename.title')} description={t('feature.rename.desc')} path="/rename" />
      <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('rename.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Klik token di bawah untuk menyusun pola nama file
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6 hover-card-enhanced">
              <div className="space-y-4">
                {/* Quick Patterns */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{t('rename.quickPattern')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickPatterns.map((qp) => (
                      <Button
                        key={qp.pattern}
                        variant={pattern === qp.pattern ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPattern(qp.pattern)}
                        className="text-xs"
                      >
                        {qp.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Token Buttons */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{t('rename.tokenHint')}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tokens.map((token) => (
                      <Button
                        key={token.key}
                        variant="outline"
                        size="sm"
                        onClick={() => insertToken(token.key)}
                        className="text-xs h-7 px-2 gap-1"
                        title={token.description}
                      >
                        {token.icon}
                        {token.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pattern Input */}
                <div>
                  <label className="text-sm font-medium text-foreground">{t('rename.pattern')}</label>
                  <Input
                    id="pattern-input"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="mt-1 font-mono text-sm"
                    placeholder="image_{index}"
                  />
                </div>

                {/* Start Index */}
                <div>
                  <label className="text-sm font-medium text-foreground">{t('rename.startIndex')}</label>
                  <Input
                    type="number"
                    value={startIndex}
                    onChange={(e) => setStartIndex(parseInt(e.target.value) || 1)}
                    className="mt-1"
                    min={0}
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    className="w-full btn-accent"
                    onClick={downloadAsZip}
                    disabled={isDownloading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? t('common.processing') : t('rename.downloadZip')}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setUploadedImages([])}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('common.clear')}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Preview List */}
            <Card className="p-6 hover-card-enhanced lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-4">{t('rename.preview')}</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {previewNames.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground truncate">{item.original}</p>
                      <p className="text-sm font-medium text-foreground truncate">→ {item.new}</p>
                    </div>
                    {uploadedImages[index] && (
                      <img
                        src={uploadedImages[index].url}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {uploadedImages.length} file siap di-rename
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default RenamePage;
