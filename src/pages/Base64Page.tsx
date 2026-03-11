import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Download, ArrowLeftRight, Image as ImageIcon, Code } from 'lucide-react';
import { toast } from 'sonner';

const Base64Page = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [base64Output, setBase64Output] = useState('');
  const [base64Input, setBase64Input] = useState('');
  const [decodedPreview, setDecodedPreview] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFilesSelected = (files: ImageFile[]) => {
    setImages(files);
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setBase64Output(reader.result as string);
      };
      reader.readAsDataURL(files[0].file);
    }
  };

  const handleDecode = () => {
    let input = base64Input.trim();
    // Add data URI prefix if missing
    if (!input.startsWith('data:')) {
      input = `data:image/png;base64,${input}`;
    }
    try {
      setDecodedPreview(input);
      toast.success(t('common.success'));
    } catch {
      toast.error('Invalid Base64 string');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(base64Output);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDecoded = () => {
    const a = document.createElement('a');
    a.href = decodedPreview;
    a.download = 'decoded-image.png';
    a.click();
  };

  const copyAsHtml = () => {
    const html = `<img src="${base64Output}" alt="image" />`;
    navigator.clipboard.writeText(html);
    toast.success('HTML tag copied!');
  };

  const copyAsCss = () => {
    const css = `background-image: url('${base64Output}');`;
    navigator.clipboard.writeText(css);
    toast.success('CSS copied!');
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.base64.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.base64.desc')}</p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-xl border border-border/50 bg-card p-1 shadow-soft">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'encode' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode('encode')}
            >
              <ImageIcon className="h-4 w-4" /> {t('base64.encode')}
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'decode' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode('decode')}
            >
              <Code className="h-4 w-4" /> {t('base64.decode')}
            </button>
          </div>
        </div>

        {mode === 'encode' ? (
          <div className="space-y-4">
            {images.length === 0 ? (
              <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
            ) : (
              <>
                {/* Preview */}
                <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
                  <div className="flex items-center gap-4">
                    <img src={images[0].preview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-border/50" />
                    <div>
                      <p className="font-semibold text-foreground">{images[0].file.name}</p>
                      <p className="text-sm text-muted-foreground">{(base64Output.length / 1024).toFixed(1)} KB (Base64)</p>
                    </div>
                  </div>
                </div>

                {/* Output */}
                <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{t('base64.output')}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyAsHtml}>
                        {'<img>'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={copyAsCss}>
                        CSS
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={base64Output}
                    readOnly
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>

                <Button variant="ghost" onClick={() => { setImages([]); setBase64Output(''); }}>
                  {t('common.clearAll')}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
              <span className="text-sm font-semibold text-foreground block mb-2">{t('base64.pasteHere')}</span>
              <Textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="data:image/png;base64,iVBORw0KGgo..."
                rows={6}
                className="font-mono text-xs"
              />
              <Button className="mt-3" onClick={handleDecode} disabled={!base64Input.trim()}>
                <ArrowLeftRight className="h-4 w-4 mr-2" /> {t('base64.decode')}
              </Button>
            </div>

            {decodedPreview && (
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft text-center">
                <img src={decodedPreview} alt="Decoded" className="max-w-full max-h-96 mx-auto rounded-xl border border-border/50" />
                <Button className="mt-3" onClick={handleDownloadDecoded}>
                  <Download className="h-4 w-4 mr-2" /> {t('common.download')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Base64Page;
