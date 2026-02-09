 import { useState, useCallback } from 'react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { Header } from '@/components/layout/Header';
 import { UploadZone, ImagePreview } from '@/components/UploadZone';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { resizeImage, downloadImage, formatFileSize, ProcessedImage } from '@/lib/imageProcessing';
 import { Download, Lock, Unlock, Loader2, X, Trash2 } from 'lucide-react';
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
 
 const presets = [
   { name: 'resize.instagram.post', width: 1080, height: 1080 },
   { name: 'resize.instagram.story', width: 1080, height: 1920 },
   { name: 'resize.youtube', width: 1280, height: 720 },
   { name: 'resize.banner', width: 1920, height: 600 },
 ];
 
 export default function ResizePage() {
   const { t } = useLanguage();
   const [images, setImages] = useState<ProcessedFile[]>([]);
   const [width, setWidth] = useState<number>(1080);
   const [height, setHeight] = useState<number>(1080);
   const [lockAspectRatio, setLockAspectRatio] = useState(true);
   const [aspectRatio, setAspectRatio] = useState<number | null>(null);
 
   const handleFilesSelected = useCallback((files: ImageFile[]) => {
     setImages((prev) => [...prev, ...files.map(f => ({ ...f }))]);
     if (files.length > 0 && !aspectRatio) {
       setAspectRatio(files[0].width / files[0].height);
     }
   }, [aspectRatio]);
 
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
 
   const handleWidthChange = (value: number) => {
     setWidth(value);
     if (lockAspectRatio && aspectRatio) {
       setHeight(Math.round(value / aspectRatio));
     }
   };
 
   const handleHeightChange = (value: number) => {
     setHeight(value);
     if (lockAspectRatio && aspectRatio) {
       setWidth(Math.round(value * aspectRatio));
     }
   };
 
   const handlePreset = (presetWidth: number, presetHeight: number) => {
     setWidth(presetWidth);
     setHeight(presetHeight);
     setAspectRatio(presetWidth / presetHeight);
   };
 
   const processImage = async (image: ProcessedFile) => {
     setImages(prev => prev.map(img => 
       img.id === image.id ? { ...img, processing: true } : img
     ));
 
     try {
       const result = await resizeImage(image.preview, {
         width,
         height,
         maintainAspectRatio: lockAspectRatio,
       });
 
       setImages(prev => prev.map(img => 
         img.id === image.id ? { ...img, result, processing: false } : img
       ));
 
       toast.success(t('common.success'));
     } catch (error) {
       toast.error('Failed to resize image');
       setImages(prev => prev.map(img => 
         img.id === image.id ? { ...img, processing: false } : img
       ));
     }
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
       const ext = image.file.name.split('.').pop() || 'jpg';
       const baseName = image.file.name.replace(/\.[^.]+$/, '');
       downloadImage(image.result.blob, `${baseName}-resized.${ext}`);
     }
   };
 
   const handleDownloadAll = () => {
     images.forEach(img => {
       if (img.result) handleDownload(img);
     });
   };
 
    return (
      <div className="min-h-screen page-gradient">
        <Header />
        
        <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
         <h1 className="text-2xl font-bold text-foreground md:text-3xl">
           {t('resize.title')}
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
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" onClick={handleClearAll}>
                       <Trash2 className="h-4 w-4 mr-1" />
                       {t('common.clearAll')}
                     </Button>
                     <UploadZone
                       onFilesSelected={handleFilesSelected}
                       className="!p-2 !min-h-0 !border-solid"
                     >
                       <span className="text-xs">+ Add more</span>
                     </UploadZone>
                   </div>
                 </div>
                 
                 <div className="grid gap-4 sm:grid-cols-2">
                   {images.map((image) => (
                     <div key={image.id} className="space-y-3">
                       <ImagePreview
                         image={image}
                         onRemove={() => handleRemoveImage(image.id)}
                       />
                       
                       {image.processing && (
                         <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                           <Loader2 className="h-4 w-4 animate-spin" />
                           {t('common.processing')}
                         </div>
                       )}
                       
                       {image.result && (
                         <div className="rounded-xl border border-border bg-card p-3">
                           <div className="flex items-center justify-between">
                             <div className="text-sm">
                               <p className="font-medium text-foreground">{t('common.result')}</p>
                               <p className="text-muted-foreground">
                                 {image.result.width}×{image.result.height} • {formatFileSize(image.result.size)}
                               </p>
                             </div>
                             <Button size="sm" onClick={() => handleDownload(image)}>
                               <Download className="h-4 w-4 mr-1" />
                               {t('common.download')}
                             </Button>
                           </div>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
 
           {/* Controls Sidebar */}
           <div className="space-y-6">
             <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
               <h2 className="font-semibold text-foreground">{t('resize.presets')}</h2>
               <div className="mt-4 grid grid-cols-2 gap-2">
                 {presets.map((preset) => (
                   <Button
                     key={preset.name}
                     variant="outline"
                     size="sm"
                     className={`text-xs ${width === preset.width && height === preset.height ? 'border-primary bg-primary/5' : ''}`}
                     onClick={() => handlePreset(preset.width, preset.height)}
                   >
                     {t(preset.name)}
                   </Button>
                 ))}
               </div>
 
               <div className="mt-6 space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="width">{t('resize.width')} (px)</Label>
                   <Input
                     id="width"
                     type="number"
                     value={width}
                     onChange={(e) => handleWidthChange(Number(e.target.value))}
                     min={1}
                     max={10000}
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="height">{t('resize.height')} (px)</Label>
                   <Input
                     id="height"
                     type="number"
                     value={height}
                     onChange={(e) => handleHeightChange(Number(e.target.value))}
                     min={1}
                     max={10000}
                   />
                 </div>
 
                 <div className="flex items-center justify-between">
                   <Label htmlFor="aspectRatio" className="text-sm">
                     {t('resize.aspectRatio')}
                   </Label>
                   <div className="flex items-center gap-2">
                     {lockAspectRatio ? (
                       <Lock className="h-4 w-4 text-primary" />
                     ) : (
                       <Unlock className="h-4 w-4 text-muted-foreground" />
                     )}
                     <Switch
                       id="aspectRatio"
                       checked={lockAspectRatio}
                       onCheckedChange={setLockAspectRatio}
                     />
                   </div>
                 </div>
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