import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadZone, ImageFile } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, QrCode, Link as LinkIcon, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

const QrCodePage = () => {
  const { t } = useLanguage();
  const [text, setText] = useState('https://');
  const [qrDataUrl, setQrDataUrl] = useState('');
  
  const [qrMode, setQrMode] = useState<'text' | 'image'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageFile, setUploadedImageFile] = useState<ImageFile | null>(null);

  const generateQrFromText = async (targetText: string = text) => {
    if (!targetText.trim()) return;
    try {
      const dataUrl = await QRCode.toDataURL(targetText, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(dataUrl);

      if(targetText === text) {
         toast.success(t('common.success'));
      }
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const generateQrFromImage = async () => {
    if (!uploadedImageFile) {
        toast.error(t('qrCode.selectImageFirst'));
        return;
    }

    setIsUploading(true);
    try {
        const ext = uploadedImageFile.file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error } = await supabase.storage
          .from('shared-images')
          .upload(fileName, uploadedImageFile.file, {
            cacheControl: '31536000',
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('shared-images')
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        
        // Track in DB with expiry (30 days default for QR images)
        await supabase.from('shared_image_files').insert({
          file_name: fileName,
          bucket_path: fileName,
          original_name: uploadedImageFile.file.name,
          file_size: uploadedImageFile.file.size,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        // Generate QR code using the new public URL
        setText(publicUrl); // Update the text input so it's visible what the QR points to
        await generateQrFromText(publicUrl);
        toast.success(t('qrCode.uploadSuccess'));

    } catch (err) {
        console.error('Upload Error:', err);
        toast.error(t('qrCode.uploadError'));
    } finally {
        setIsUploading(false);
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
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
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
              
              <Tabs value={qrMode} onValueChange={(v) => setQrMode(v as 'text' | 'image')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="image" className="flex items-center gap-2"><ImageIcon className="w-4 h-4"/> {t('qrCode.uploadImage')}</TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2"><LinkIcon className="w-4 h-4"/> {t('qrCode.linkOrText')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-0">
                  <label className="text-sm font-medium text-foreground block mb-1">{t('qrCode.content')}</label>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Button className="w-full mt-4" onClick={() => generateQrFromText()} disabled={!text.trim()}>
                    <QrCode className="h-4 w-4 mr-2" /> {t('qrCode.generate')}
                  </Button>
                </TabsContent>
                
                <TabsContent value="image" className="mt-0 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('qrCode.uploadImageTitle')}</label>
                    <UploadZone
                        onFilesSelected={(files) => setUploadedImageFile(files[0] || null)}
                        multiple={false}
                        className="py-6 min-h-[140px]"
                    >
                        {uploadedImageFile ? (
                           <div className="flex flex-col items-center justify-center space-y-3 w-full h-full relative group">
                              <img src={uploadedImageFile.preview} className="max-h-[120px] rounded-lg object-contain" alt="preview" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedImageFile(null);
                                  setQrDataUrl('');
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive/90 hover:text-destructive-foreground text-foreground rounded-md backdrop-blur opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                title={t('qrCode.removeImage')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <p className="text-sm text-foreground mb-1 bg-background/80 px-2 py-1 rounded backdrop-blur max-w-[90%] truncate">
                                  {uploadedImageFile.file.name}
                              </p>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center space-y-2">
                             <p className="text-sm text-foreground mb-1">{t('qrCode.uploadHint')}</p>
                             <p className="text-xs text-muted-foreground">{t('qrCode.uploadDesc')}</p>
                           </div>
                        )}
                        
                    </UploadZone>
                  </div>
                  <Button className="w-full" onClick={generateQrFromImage} disabled={!uploadedImageFile || isUploading}>
                    {isUploading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('qrCode.uploading')}</>
                    ) : (
                        <><QrCode className="h-4 w-4 mr-2" /> {t('qrCode.uploadSubmit')}</>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodePage;
