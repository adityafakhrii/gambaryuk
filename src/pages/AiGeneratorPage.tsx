import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { downloadImage } from '@/lib/imageProcessing';
import { aiRateLimiter } from '@/lib/rateLimiter';

const styles = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'anime', label: 'Anime' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: '3d', label: '3D Render' },
  { value: 'pixel', label: 'Pixel Art' },
];

const AiGeneratorPage = () => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<{ prompt: string; url: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(t('aiGen.enterPrompt'));
      return;
    }
    setLoading(true);
    setResultUrl(null);

    try {
      const { allowed, retryAfterMs } = aiRateLimiter.check();
      if (!allowed) {
        toast.error(`Rate limited. Try again in ${Math.ceil(retryAfterMs / 1000)}s`);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: prompt.trim(), style },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.image) {
        setResultUrl(data.image);
        setHistory(prev => [{ prompt: prompt.trim(), url: data.image }, ...prev.slice(0, 9)]);
        toast.success(t('common.success'));
      } else {
        toast.error(t('aiGen.noResult'));
      }
    } catch (err) {
      console.error('Generate error:', err);
      toast.error(t('aiGen.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, name?: string) => {
    fetch(url)
      .then(r => r.blob())
      .then(blob => downloadImage(blob, `ai-generated-${name || Date.now()}.png`));
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('feature.aiGen.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.aiGen.desc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input panel */}
          <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft space-y-4">
            <div className="space-y-1.5">
              <Label>{t('aiGen.prompt')}</Label>
              <Textarea
                placeholder={t('aiGen.promptPlaceholder')}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('aiGen.style')}</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              {loading ? t('common.processing') : t('aiGen.generate')}
            </Button>
          </div>

          {/* Result panel */}
          <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-soft">
            {resultUrl ? (
              <div className="space-y-3">
                <img src={resultUrl} alt="Generated" className="w-full rounded-xl border border-border/50" />
                <Button size="sm" onClick={() => handleDownload(resultUrl)}>
                  <Download className="h-4 w-4 mr-1" /> {t('common.download')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px] rounded-xl border border-dashed border-border/50 text-muted-foreground text-sm">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span>{t('aiGen.generating')}</span>
                  </div>
                ) : (
                  t('aiGen.hint')
                )}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {history.length > 1 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('aiGen.history')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {history.slice(1).map((item, i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-soft group cursor-pointer" onClick={() => setResultUrl(item.url)}>
                  <img src={item.url} alt={item.prompt} className="w-full h-32 object-cover" />
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate">{item.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiGeneratorPage;
