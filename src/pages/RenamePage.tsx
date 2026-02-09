import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, FileText, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';

const RenamePage = () => {
  const { t } = useLanguage();
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string }[]>([]);
  const [pattern, setPattern] = useState('image_{index}');
  const [startIndex, setStartIndex] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFilesSelected = useCallback((files: { file: File; preview: string }[]) => {
    const newImages = files.map((f) => ({
      file: f.file,
      url: f.preview,
    }));
    setUploadedImages(newImages);
  }, []);

  const generateNewName = useCallback((file: File, index: number) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const originalName = file.name.replace(/\.[^/.]+$/, '');
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    let newName = pattern
      .replace('{name}', originalName)
      .replace('{index}', String(startIndex + index))
      .replace('{date}', date);
    
    return `${newName}.${ext}`;
  }, [pattern, startIndex]);

  const previewNames = useMemo(() => {
    return uploadedImages.map((img, index) => ({
      original: img.file.name,
      new: generateNewName(img.file, index),
    }));
  }, [uploadedImages, generateNewName]);

  const downloadAsZip = async () => {
    if (uploadedImages.length === 0) return;
    
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        const newName = generateNewName(img.file, i);
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await img.file.arrayBuffer();
        zip.file(newName, arrayBuffer);
      }
      
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Download
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('rename.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('rename.tokens')}
          </p>
        </div>

        {uploadedImages.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">{t('rename.pattern')}</label>
                  <Input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="mt-1"
                    placeholder="image_{index}"
                  />
                </div>

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

                <div className="pt-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>Tokens:</strong><br />
                    {'{name}'} = Original filename<br />
                    {'{index}'} = Sequential number<br />
                    {'{date}'} = Today's date (YYYYMMDD)
                  </p>
                </div>
              </div>
            </Card>

            {/* Preview List */}
            <Card className="p-6 lg:col-span-2">
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
                {uploadedImages.length} files ready to rename
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default RenamePage;