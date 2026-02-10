import { useCallback, useState, ReactNode } from 'react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { Upload, Image, X } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface ImageFile {
   id: string;
   file: File;
   preview: string;
   width: number;
   height: number;
 }
 
 interface UploadZoneProps {
   onFilesSelected: (files: ImageFile[]) => void;
   multiple?: boolean;
   maxFiles?: number;
   className?: string;
  children?: ReactNode;
 }
 
 export function UploadZone({
   onFilesSelected,
   multiple = true,
   maxFiles = 10,
   className,
  children,
 }: UploadZoneProps) {
   const { t } = useLanguage();
   const [isDragging, setIsDragging] = useState(false);
 
   const processFiles = useCallback(async (files: FileList | File[]) => {
     const validFiles = Array.from(files)
       .filter((file) => file.type.startsWith('image/'))
       .slice(0, maxFiles);
 
     const processedFiles: ImageFile[] = await Promise.all(
       validFiles.map(async (file) => {
         const preview = URL.createObjectURL(file);
         const dimensions = await getImageDimensions(preview);
         return {
           id: `${file.name}-${Date.now()}-${Math.random()}`,
           file,
           preview,
           width: dimensions.width,
           height: dimensions.height,
         };
       })
     );
 
     onFilesSelected(processedFiles);
   }, [maxFiles, onFilesSelected]);
 
   const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
     return new Promise((resolve) => {
       const img = new window.Image();
       img.onload = () => {
         resolve({ width: img.naturalWidth, height: img.naturalHeight });
       };
       img.src = src;
     });
   };
 
   const handleDragOver = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(true);
   }, []);
 
   const handleDragLeave = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
   }, []);
 
   const handleDrop = useCallback(
     (e: React.DragEvent) => {
       e.preventDefault();
       setIsDragging(false);
       if (e.dataTransfer.files.length > 0) {
         processFiles(e.dataTransfer.files);
       }
     },
     [processFiles]
   );
 
   const handleFileInput = useCallback(
     (e: React.ChangeEvent<HTMLInputElement>) => {
       if (e.target.files && e.target.files.length > 0) {
         processFiles(e.target.files);
       }
     },
     [processFiles]
   );
 
   return (
     <div
       className={cn(
         'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200',
         isDragging
           ? 'border-primary bg-primary/5 scale-[1.02]'
           : 'border-border hover:border-primary/50 hover:bg-muted/50',
         className
       )}
       onDragOver={handleDragOver}
       onDragLeave={handleDragLeave}
       onDrop={handleDrop}
     >
       <input
         type="file"
         accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/svg+xml,image/x-icon,image/avif"
         multiple={multiple}
         onChange={handleFileInput}
         className="absolute inset-0 cursor-pointer opacity-0"
       />
       
      {children ? (
        children
      ) : (
        <>
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-all',
            isDragging ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
          )}>
            <Upload className="h-8 w-8" />
          </div>
          
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {t('upload.title')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('upload.subtitle')}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {t('upload.formats')}
          </p>
          {multiple && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t('upload.batch')}
            </p>
          )}
        </>
       )}
     </div>
   );
 }
 
 interface ImagePreviewProps {
   image: ImageFile;
   onRemove?: () => void;
   showInfo?: boolean;
   className?: string;
 }
 
 export function ImagePreview({ image, onRemove, showInfo = true, className }: ImagePreviewProps) {
   const { t } = useLanguage();
   
   const formatFileSize = (bytes: number) => {
     if (bytes < 1024) return `${bytes} B`;
     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
   };
 
   return (
     <div className={cn('relative rounded-xl overflow-hidden bg-muted', className)}>
       {onRemove && (
         <button
           onClick={onRemove}
           className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
         >
           <X className="h-4 w-4" />
         </button>
       )}
       
       <img
         src={image.preview}
         alt="Preview"
         className="w-full h-48 object-contain bg-muted"
       />
       
       {showInfo && (
         <div className="p-3 border-t border-border bg-card">
           <p className="text-sm font-medium text-foreground truncate">
             {image.file.name}
           </p>
           <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
             <span>{t('common.dimensions')}: {image.width}×{image.height}</span>
             <span>{t('common.size')}: {formatFileSize(image.file.size)}</span>
           </div>
         </div>
       )}
     </div>
   );
 }