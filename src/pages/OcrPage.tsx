import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScanText, Copy, Check, Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { aiRateLimiter } from '@/lib/rateLimiter';

const OcrPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setExtractedText('');
  };

  const handleExtract = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setExtractedText('');

    try {
      // Convert image to base64
      const file = images[0].file;
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { allowed, retryAfterMs } = aiRateLimiter.check();
      if (!allowed) {
        toast.error(`Rate limited. Try again in ${Math.ceil(retryAfterMs / 1000)}s`);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('ocr', {
        body: { image: base64 },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setExtractedText(data.text || t('ocr.noText'));
      toast.success(t('common.success'));
    } catch (err) {
      console.error('OCR error:', err);
      toast.error(t('ocr.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${images[0]?.file.name || 'ocr'}-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setImages([]);
    setExtractedText('');
  };

  return (
    <div className="min-h-full">
      <SEO title={t('ocr.title')} description={t('feature.ocr.desc')} path="/ocr" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.ocr.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.ocr.desc')}</p>
        </div>

        {images.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-4">
            {/* Preview + controls */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
              <div className="flex items-start gap-4">
                <img
                  src={images[0].preview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-xl border border-border/50"
                />
                <div className="flex-1 min-w-0 space-y-3">
                  <h3 className="font-semibold text-foreground truncate">{images[0].file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {images[0].width} × {images[0].height}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleExtract} disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ScanText className="h-4 w-4 mr-2" />
                      )}
                      {loading ? t('common.processing') : t('ocr.extract')}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleClear}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted text */}
            {extractedText && (
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{t('ocr.result')}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownloadTxt}>
                      <Download className="h-4 w-4 mr-1" /> .txt
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={extractedText}
                  readOnly
                  className="min-h-[200px] font-mono text-sm bg-muted/30"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OcrPage;
