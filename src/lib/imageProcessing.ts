 // Image processing utilities using Canvas API
 
 export interface ProcessedImage {
   blob: Blob;
   url: string;
   width: number;
   height: number;
   size: number;
   format: string;
 }
 
 export interface ResizeOptions {
   width: number;
   height: number;
   maintainAspectRatio?: boolean;
 }
 
 export interface CompressOptions {
   quality: number; // 0-1
   format?: 'jpeg' | 'png' | 'webp';
 }
 
 export interface ConvertOptions {
   format: 'jpeg' | 'png' | 'webp';
   quality?: number;
   preserveTransparency?: boolean;
 }
 
 // Load image from file or URL
 export function loadImage(src: string): Promise<HTMLImageElement> {
   return new Promise((resolve, reject) => {
     const img = new Image();
     img.crossOrigin = 'anonymous';
     img.onload = () => resolve(img);
     img.onerror = reject;
     img.src = src;
   });
 }
 
 // Resize image
 export async function resizeImage(
   imageUrl: string,
   options: ResizeOptions
 ): Promise<ProcessedImage> {
   const img = await loadImage(imageUrl);
   
   let { width, height } = options;
   
   if (options.maintainAspectRatio) {
     const aspectRatio = img.naturalWidth / img.naturalHeight;
     if (width && !height) {
       height = Math.round(width / aspectRatio);
     } else if (height && !width) {
       width = Math.round(height * aspectRatio);
     } else if (width && height) {
       // Fit within bounds while maintaining aspect ratio
       const targetRatio = width / height;
       if (aspectRatio > targetRatio) {
         height = Math.round(width / aspectRatio);
       } else {
         width = Math.round(height * aspectRatio);
       }
     }
   }
   
   const canvas = document.createElement('canvas');
   canvas.width = width;
   canvas.height = height;
   
   const ctx = canvas.getContext('2d')!;
   ctx.imageSmoothingEnabled = true;
   ctx.imageSmoothingQuality = 'high';
   ctx.drawImage(img, 0, 0, width, height);
   
   return new Promise((resolve, reject) => {
     canvas.toBlob(
       (blob) => {
         if (!blob) {
           reject(new Error('Failed to create blob'));
           return;
         }
         resolve({
           blob,
           url: URL.createObjectURL(blob),
           width,
           height,
           size: blob.size,
           format: 'jpeg',
         });
       },
       'image/jpeg',
       0.92
     );
   });
 }
 
 // Compress image
 export async function compressImage(
   imageUrl: string,
   options: CompressOptions
 ): Promise<ProcessedImage> {
   const img = await loadImage(imageUrl);
   
   const canvas = document.createElement('canvas');
   canvas.width = img.naturalWidth;
   canvas.height = img.naturalHeight;
   
   const ctx = canvas.getContext('2d')!;
   ctx.drawImage(img, 0, 0);
   
   const format = options.format || 'jpeg';
   const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
   
   return new Promise((resolve, reject) => {
     canvas.toBlob(
       (blob) => {
         if (!blob) {
           reject(new Error('Failed to create blob'));
           return;
         }
         resolve({
           blob,
           url: URL.createObjectURL(blob),
           width: img.naturalWidth,
           height: img.naturalHeight,
           size: blob.size,
           format,
         });
       },
       mimeType,
       options.quality
     );
   });
 }
 
 // Convert image format
 export async function convertImage(
   imageUrl: string,
   options: ConvertOptions
 ): Promise<ProcessedImage> {
   const img = await loadImage(imageUrl);
   
   const canvas = document.createElement('canvas');
   canvas.width = img.naturalWidth;
   canvas.height = img.naturalHeight;
   
   const ctx = canvas.getContext('2d')!;
   
   // Fill with white background for JPEG (no transparency)
   if (options.format === 'jpeg' || !options.preserveTransparency) {
     ctx.fillStyle = '#ffffff';
     ctx.fillRect(0, 0, canvas.width, canvas.height);
   }
   
   ctx.drawImage(img, 0, 0);
   
   const mimeType = options.format === 'jpeg' ? 'image/jpeg' : options.format === 'png' ? 'image/png' : 'image/webp';
   const quality = options.quality ?? (options.format === 'png' ? undefined : 0.92);
   
   return new Promise((resolve, reject) => {
     canvas.toBlob(
       (blob) => {
         if (!blob) {
           reject(new Error('Failed to create blob'));
           return;
         }
         resolve({
           blob,
           url: URL.createObjectURL(blob),
           width: img.naturalWidth,
           height: img.naturalHeight,
           size: blob.size,
           format: options.format,
         });
       },
       mimeType,
       quality
     );
   });
 }
 
 // Download processed image
 export function downloadImage(blob: Blob, filename: string) {
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = filename;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   URL.revokeObjectURL(url);
 }
 
 // Format file size for display
 export function formatFileSize(bytes: number): string {
   if (bytes < 1024) return `${bytes} B`;
   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
   return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
 }
 
 // Get file extension from format
 export function getExtension(format: string): string {
   switch (format) {
     case 'jpeg':
       return 'jpg';
     case 'png':
       return 'png';
     case 'webp':
       return 'webp';
     default:
       return 'jpg';
   }
 }