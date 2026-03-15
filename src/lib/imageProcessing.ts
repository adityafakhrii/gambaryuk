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
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
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

// Detect image format from a blob URL or object URL
export function detectFormat(url: string): 'jpeg' | 'png' | 'webp' {
  const lower = url.toLowerCase();
  if (lower.includes('.png') || lower.includes('image/png')) return 'png';
  if (lower.includes('.webp') || lower.includes('image/webp')) return 'webp';
  return 'jpeg';
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

// Resize image — preserves input format by default
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

  const format = options.format || detectFormat(imageUrl);
  const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  const quality = options.quality ?? (format === 'png' ? undefined : 0.92);

  // Fill white background for JPEG (no transparency support)
  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

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
          format,
        });
      },
      mimeType,
      quality
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

// Convert a base64 data URI to a Blob, preserving the original MIME type
export function dataUriToBlob(dataUri: string): Blob {
  const [header, base64Data] = dataUri.split(',');
  const mimeMatch = header.match(/data:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: mimeType });
}

/**
 * Remove the AI-generated background and replace with true transparency.
 *
 * Strategy 1 (primary): The AI is prompted to use a solid green (#00FF00) background.
 *   Detects green pixels using HSL color space and replaces them with transparent.
 *   Handles anti-aliased edges with gradual alpha blending.
 *
 * Strategy 2 (fallback): Detects AI-baked checkerboard pattern from image corners
 *   and replaces matching alternating gray pixels with transparent.
 */
export function removeCheckerboardBackground(dataUri: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;

      const worker = new Worker(new URL('./pixelWorker.ts', import.meta.url), {
        type: 'module'
      });

      const messageId = Math.random().toString(36).substr(2, 9);
      
      worker.onmessage = (e: MessageEvent) => {
        const { type, id, imageData: newData, error } = e.data;
        if (type === 'processCheckerboardDone' && id === messageId) {
          if (newData) {
            // Apply new image data
            const newImgData = new ImageData(new Uint8ClampedArray(newData), w, h);
            ctx.putImageData(newImgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            console.error(error);
            resolve(dataUri); // Neither detected or error -> return original
          }
          worker.terminate();
        }
      };

      worker.onerror = (err) => {
        console.error("Worker error:", err);
        resolve(dataUri);
        worker.terminate();
      };

      worker.postMessage({
        type: 'processCheckerboard',
        id: messageId,
        imageData: imageData.data.buffer,
        width: w,
        height: h
      }, [imageData.data.buffer]);
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
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