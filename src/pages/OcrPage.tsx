import { SEO } from '@/components/SEO';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScanText, Copy, Check, Download, Trash2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';

const OcrPage = () => {
  const { t, language } = useLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    setExtractedText('');
  };

  const handleExtract = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setProgress(0);
    setExtractedText('');

    try {
      const file = images[0].file;

      // Perform local client-side OCR using tesseract.js
      const result = await Tesseract.recognize(
        file,
        'eng+ind',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      setExtractedText(text || t('ocr.noText'));
      toast.success(t('common.success'));
    } catch (err) {
      console.error('OCR error:', err);
      toast.error(t('ocr.error'));
    } finally {
      setLoading(false);
      setProgress(0);
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

  const schemaData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": language === 'id' ? "Ekstrak Teks dari Gambar (OCR) Online - GambarYuk" : "Extract Text from Image (OCR) Online - GambarYuk",
      "url": "https://gambaryuk.com/ocr",
      "description": language === 'id'
        ? "Ekstrak dan salin teks dari gambar JPG, PNG, WebP secara online menggunakan teknologi AI OCR gratis."
        : "Extract and copy text from JPG, PNG, WebP images online using free AI OCR technology.",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires HTML5 support",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IDR"
      }
    };
  }, [language]);

  return (
    <div className="min-h-full">
      <SEO 
        title={t('feature.ocr.title')} 
        description={t('feature.ocr.desc')} 
        path="/ocr" 
        schema={schemaData}
      />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.ocr.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.ocr.desc')}</p>
        </div>

        {/* Fitur OCR berjalan 100% lokal di browser pengguna */}

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
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {progress > 0 ? `${t('common.processing')} (${progress}%)` : t('common.processing')}
                        </>
                      ) : (
                        <>
                          <ScanText className="h-4 w-4 mr-2" />
                          {t('ocr.extract')}
                        </>
                      )}
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

        {/* SEO & AEO Content Section */}
        <section className="mt-16 border-t border-border/50 pt-12 max-w-4xl mx-auto space-y-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'id' ? 'Cara Mengambil Teks dari Gambar (OCR) Secara Online' : 'How to Extract Text from Images (OCR) Online'}
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                {language === 'id' 
                  ? 'Unggah gambar JPG, PNG, atau WebP yang berisi teks yang ingin Anda ambil.' 
                  : 'Upload the JPG, PNG, or WebP image containing the text you want to extract.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Klik tombol "Ekstrak Teks" untuk memulai proses pembacaan karakter (OCR).' 
                  : 'Click the "Extract Text" button to start the character recognition (OCR) process.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Tunggu beberapa saat hingga teks hasil ekstraksi muncul di kotak teks hasil.' 
                  : 'Wait a few moments for the extracted text to appear in the result text box.'}
              </li>
              <li>
                {language === 'id' 
                  ? 'Gunakan tombol "Salin" untuk menyalin teks ke papan klip atau "Unduh .txt" untuk menyimpannya sebagai file teks.' 
                  : 'Use the "Copy" button to copy the text to your clipboard or "Download .txt" to save it as a text file.'}
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'id' ? 'Pertanyaan yang Sering Diajukan (FAQ)' : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/50 p-5">
                <h3 className="font-semibold text-foreground mb-2">
                  {language === 'id' ? 'Bagaimana cara kerja fitur Ekstrak Teks (OCR)?' : 'How does the Extract Text (OCR) feature work?'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'id'
                    ? 'Fitur ini menggunakan teknologi OCR (Optical Character Recognition) berbasis kecerdasan buatan (AI) yang mendeteksi pola bentuk huruf pada gambar dan mengonversinya menjadi teks digital yang bisa diedit.'
                    : 'This feature uses artificial intelligence (AI) based OCR (Optical Character Recognition) technology to detect letter shape patterns in images and convert them into editable digital text.'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/50 p-5">
                <h3 className="font-semibold text-foreground mb-2">
                  {language === 'id' ? 'Format gambar apa saja yang didukung untuk OCR?' : 'What image formats are supported for OCR?'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'id'
                    ? 'GambarYuk mendukung format gambar populer seperti JPEG/JPG, PNG, dan WebP dengan kualitas tulisan yang cukup jelas agar hasil ekstraksi akurat.'
                    : 'GambarYuk supports popular image formats such as JPEG/JPG, PNG, and WebP, as long as the text quality is clear enough for accurate extraction.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OcrPage;

