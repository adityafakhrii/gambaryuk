 import { useState, useCallback } from 'react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { UploadZone, ImagePreview } from '@/components/UploadZone';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { convertImage, downloadImage, formatFileSize, ProcessedImage } from '@/lib/imageProcessing';
 import { Download, Loader2, Trash2 } from 'lucide-react';
 import { toast } from 'sonner';
 
 interface ImageFile {
   id: string;
   file: File;
   preview: string;
   width: number;
   height: number;
 }
 
 interface ProcessedFile extends ImageFile {
   result?: ProcessedImage;
   processing?: boolean;
 }
 
type Format = 'jpeg' | 'png' | 'webp' | 'bmp' | 'gif' | 'ico' | 'svg' | 'avif' | 'tiff';

const formats: { value: Format; label: string; description: string }[] = [
  { value: 'jpeg', label: 'JPEG (.jpg)', description: 'Terbaik untuk foto. Ukuran kecil, tanpa transparansi.' },
  { value: 'png', label: 'PNG (.png)', description: 'Mendukung transparansi. Ideal untuk grafis & logo.' },
  { value: 'webp', label: 'WebP (.webp)', description: 'Format modern. Kompresi bagus dengan transparansi.' },
  { value: 'avif', label: 'AVIF (.avif)', description: 'Format terbaru. Kompresi terbaik, dukungan browser terbatas.' },
  { value: 'gif', label: 'GIF (.gif)', description: 'Mendukung animasi. Warna terbatas (256).' },
  { value: 'bmp', label: 'BMP (.bmp)', description: 'Format bitmap tanpa kompresi. Ukuran besar.' },
  { value: 'ico', label: 'ICO (.ico)', description: 'Untuk favicon website. Ukuran kecil.' },
  { value: 'svg', label: 'SVG (.svg)', description: 'Format vektor. Bisa di-zoom tanpa pecah (traced).' },
  { value: 'tiff', label: 'TIFF (.tiff)', description: 'Kualitas tinggi untuk cetak. Ukuran sangat besar.' },
];
 
 export default function ConvertPage() {
   const { t } = useLanguage();
   const [images, setImages] = useState<ProcessedFile[]>([]);
   const [targetFormat, setTargetFormat] = useState<Format>('webp');
   const [preserveTransparency, setPreserveTransparency] = useState(true);
 
   const handleFilesSelected = useCallback((files: ImageFile[]) => {
     setImages((prev) => [...prev, ...files.map(f => ({ ...f }))]);
   }, []);
 
   const handleRemoveImage = (id: string) => {
     setImages((prev) => {
       const img = prev.find(i => i.id === id);
       if (img?.preview) URL.revokeObjectURL(img.preview);
       if (img?.result?.url) URL.revokeObjectURL(img.result.url);
       return prev.filter((i) => i.id !== id);
     });
   };
 
   const handleClearAll = () => {
     images.forEach(img => {
       if (img.preview) URL.revokeObjectURL(img.preview);
       if (img.result?.url) URL.revokeObjectURL(img.result.url);
     });
     setImages([]);
   };
 
  const getOriginalFormat = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', webp: 'WebP',
      gif: 'GIF', bmp: 'BMP', ico: 'ICO', svg: 'SVG',
      avif: 'AVIF', tiff: 'TIFF', tif: 'TIFF',
    };
    return map[ext] || ext.toUpperCase();
  };
 
  const getMimeType = (format: Format): string => {
    const map: Record<Format, string> = {
      jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
      avif: 'image/avif', gif: 'image/gif', bmp: 'image/bmp',
      ico: 'image/x-icon', svg: 'image/svg+xml', tiff: 'image/tiff',
    };
    return map[format];
  };

  const getExt = (format: Format): string => {
    if (format === 'jpeg') return 'jpg';
    if (format === 'tiff') return 'tif';
    return format;
  };

  const processImage = async (image: ProcessedFile) => {
    setImages(prev => prev.map(img => 
      img.id === image.id ? { ...img, processing: true } : img
    ));

    try {
      let result: ProcessedImage;

      if (targetFormat === 'svg') {
        // SVG trace: create a simple traced SVG from the image
        const svgBlob = await imageToTracedSvg(image.preview, image.width, image.height);
        result = {
          blob: svgBlob,
          url: URL.createObjectURL(svgBlob),
          width: image.width,
          height: image.height,
          size: svgBlob.size,
          format: 'svg',
        };
      } else if (targetFormat === 'ico') {
        // ICO: resize to 64x64 and export as PNG (browsers treat as favicon)
        const icoResult = await convertImage(image.preview, {
          format: 'png',
          preserveTransparency: true,
        });
        const icoBlob = new Blob([icoResult.blob], { type: 'image/x-icon' });
        result = { ...icoResult, blob: icoBlob, size: icoBlob.size, format: 'ico' };
      } else {
        // Standard canvas-supported formats
        const canvasFormat = (['jpeg', 'png', 'webp'] as const).includes(targetFormat as any) 
          ? targetFormat as 'jpeg' | 'png' | 'webp'
          : 'png'; // fallback for bmp, gif, tiff, avif

        result = await convertImage(image.preview, {
          format: canvasFormat,
          preserveTransparency: preserveTransparency && targetFormat !== 'jpeg',
        });

        // Re-wrap blob with correct MIME for non-standard canvas formats
        if (!['jpeg', 'png', 'webp'].includes(targetFormat)) {
          const reBlob = new Blob([result.blob], { type: getMimeType(targetFormat) });
          result = { ...result, blob: reBlob, size: reBlob.size, format: targetFormat };
        }
      }

      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, result, processing: false } : img
      ));

      toast.success(t('common.success'));
    } catch (error) {
      toast.error('Failed to convert image');
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, processing: false } : img
      ));
    }
  };

  // Simple SVG trace: embeds the image as base64 data URI inside an SVG
  const imageToTracedSvg = async (imageUrl: string, w: number, h: number): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = imageUrl; });
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/png');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image href="${dataUrl}" width="${w}" height="${h}"/>
</svg>`;
    return new Blob([svgContent], { type: 'image/svg+xml' });
  };
 
   const processAll = async () => {
     for (const image of images) {
       if (!image.result) {
         await processImage(image);
       }
     }
   };
 
   const handleDownload = (image: ProcessedFile) => {
     if (image.result) {
       const baseName = image.file.name.replace(/\.[^.]+$/, '');
       const ext = getExt(targetFormat);
       downloadImage(image.result.blob, `${baseName}.${ext}`);
     }
   };
 
   const handleDownloadAll = () => {
     images.forEach(img => {
       if (img.result) handleDownload(img);
     });
   };
 
    return (
      <div className="min-h-full page-gradient">
        <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
         <h1 className="text-2xl font-bold text-foreground md:text-3xl">
           {t('convert.title')}
         </h1>
         
         <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
           {/* Main Area */}
           <div className="space-y-6">
             {images.length === 0 ? (
               <UploadZone onFilesSelected={handleFilesSelected} className="min-h-[300px]" />
             ) : (
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <p className="text-sm text-muted-foreground">
                     {images.length} image{images.length > 1 ? 's' : ''} selected
                   </p>
                   <Button variant="outline" size="sm" onClick={handleClearAll}>
                     <Trash2 className="h-4 w-4 mr-1" />
                     {t('common.clearAll')}
                   </Button>
                 </div>
                 
                 <div className="grid gap-4 sm:grid-cols-2">
                   {images.map((image) => (
                     <div key={image.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                       <div className="relative">
                         <button
                           onClick={() => handleRemoveImage(image.id)}
                           className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                         <img
                           src={image.preview}
                           alt="Preview"
                           className="w-full h-40 object-contain bg-muted"
                         />
                       </div>
                       
                       <div className="p-4 border-t border-border space-y-3">
                         <div>
                           <p className="text-sm font-medium truncate">{image.file.name}</p>
                           <p className="text-xs text-muted-foreground">
                             {t('convert.from')}: {getOriginalFormat(image.file.name)} • {formatFileSize(image.file.size)}
                           </p>
                         </div>
 
                         {image.processing && (
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                             <Loader2 className="h-4 w-4 animate-spin" />
                             {t('common.processing')}
                           </div>
                         )}
 
                         {image.result && (
                           <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                             <div>
                               <p className="text-sm font-medium text-accent">
                                 Converted to {targetFormat.toUpperCase()}
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 {formatFileSize(image.result.size)}
                               </p>
                             </div>
                             <Button size="sm" onClick={() => handleDownload(image)}>
                               <Download className="h-4 w-4" />
                             </Button>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
 
           {/* Controls Sidebar */}
           <div className="space-y-6">
             <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
               <h2 className="font-semibold text-foreground">{t('convert.to')}</h2>
               
               <div className="mt-4 space-y-4">
                 <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as Format)}>
                   <SelectTrigger className="w-full">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {formats.map((format) => (
                       <SelectItem key={format.value} value={format.value}>
                         {format.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
 
                {!['jpeg', 'bmp', 'gif', 'ico'].includes(targetFormat) && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="transparency" className="text-sm">
                        {t('convert.transparency')}
                      </Label>
                      <Switch
                        id="transparency"
                        checked={preserveTransparency}
                        onCheckedChange={setPreserveTransparency}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-xl bg-muted/50 p-4">
                  <h3 className="text-sm font-medium text-foreground">Format Info</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formats.find(f => f.value === targetFormat)?.description}
                  </p>
                </div>
             </div>
 
             {images.length > 0 && (
               <div className="space-y-3">
                 <Button
                   className="w-full btn-accent"
                   size="lg"
                   onClick={processAll}
                   disabled={images.every(img => img.processing)}
                 >
                   {images.some(img => img.processing) ? (
                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
                   ) : null}
                   {images.length > 1 ? t('common.processAll') : t('common.process')}
                 </Button>
 
                 {images.some(img => img.result) && (
                   <Button
                     variant="outline"
                     className="w-full"
                     size="lg"
                     onClick={handleDownloadAll}
                   >
                     <Download className="h-4 w-4 mr-2" />
                     {t('common.downloadAll')}
                   </Button>
                 )}
               </div>
             )}
           </div>
         </div>
       </main>
     </div>
   );
 }