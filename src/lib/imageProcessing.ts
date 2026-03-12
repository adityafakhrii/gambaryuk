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

      // ── Strategy 1: Green-screen chroma-key removal ────────────────
      // Count how many corner pixels are "green-ish" to decide strategy
      const isGreenish = (r: number, g: number, b: number) =>
        g > 100 && g > r * 1.5 && g > b * 1.5;

      let greenCornerCount = 0;
      const sampleSize = Math.min(20, Math.floor(w / 10), Math.floor(h / 10));
      const corners = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1],
      ];
      for (const [cx, cy] of corners) {
        for (let dy = 0; dy < sampleSize; dy++) {
          for (let dx = 0; dx < sampleSize; dx++) {
            const sx = cx === 0 ? dx : w - 1 - dx;
            const sy = cy === 0 ? dy : h - 1 - dy;
            if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;
            const i = (sy * w + sx) * 4;
            if (isGreenish(d[i], d[i + 1], d[i + 2])) greenCornerCount++;
          }
        }
      }

      const totalCornerPixels = 4 * sampleSize * sampleSize;
      const greenRatio = greenCornerCount / totalCornerPixels;

      if (greenRatio > 0.3) {
        // Green background detected — do chroma-key removal
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];

          if (isGreenish(r, g, b)) {
            // How "green" is this pixel? More green = more transparent
            const greenness = Math.min(1, Math.max(0,
              (g - Math.max(r, b)) / 128
            ));
            d[i + 3] = Math.round((1 - greenness) * 255);
            // Also reduce the green tint from semi-transparent edge pixels
            if (d[i + 3] > 0 && d[i + 3] < 255) {
              d[i + 1] = Math.max(0, g - Math.round(greenness * 100)); // reduce G
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      // ── Strategy 2: Checkerboard pattern removal (fallback) ────────
      const px = (x: number, y: number): [number, number, number] => {
        const i = (y * w + x) * 4;
        return [d[i], d[i + 1], d[i + 2]];
      };

      const isGray = (r: number, g: number, b: number) =>
        Math.abs(r - g) < 25 && Math.abs(g - b) < 25;

      const cornerConfigs = [
        { x: 0, y: 0, dx: 1, dy: 1 },
        { x: w - 1, y: 0, dx: -1, dy: 1 },
        { x: 0, y: h - 1, dx: 1, dy: -1 },
        { x: w - 1, y: h - 1, dx: -1, dy: -1 },
      ];

      let cellSize = 0;
      let evenColor: [number, number, number] = [0, 0, 0];
      let oddColor: [number, number, number] = [0, 0, 0];

      for (const corner of cornerConfigs) {
        const cp = px(corner.x, corner.y);
        if (!isGray(cp[0], cp[1], cp[2])) continue;

        let cs = 0;
        for (let step = 1; step < Math.min(64, w / 2); step++) {
          const nx = corner.x + step * corner.dx;
          if (nx < 0 || nx >= w) break;
          const np = px(nx, corner.y);
          if (Math.abs(np[0] - cp[0]) > 20) { cs = step; break; }
        }
        if (cs < 2 || cs > 50) continue;

        const c2x = corner.x + cs * corner.dx;
        if (c2x < 0 || c2x >= w) continue;
        const c2 = px(c2x, corner.y);
        if (!isGray(c2[0], c2[1], c2[2])) continue;
        if (Math.abs(cp[0] - c2[0]) < 15) continue;

        let valid = true;
        for (let check = 2; check <= 5; check++) {
          const checkX = corner.x + cs * check * corner.dx;
          if (checkX < 0 || checkX >= w) break;
          const checkP = px(checkX, corner.y);
          const expected = check % 2 === 0 ? cp : c2;
          if (Math.abs(checkP[0] - expected[0]) > 30) { valid = false; break; }
        }
        if (!valid) continue;

        for (let check = 1; check <= 4; check++) {
          const checkY = corner.y + cs * check * corner.dy;
          if (checkY < 0 || checkY >= h) break;
          const checkP = px(corner.x, checkY);
          const expected = check % 2 === 0 ? cp : c2;
          if (Math.abs(checkP[0] - expected[0]) > 30) { valid = false; break; }
        }
        if (!valid) continue;

        cellSize = cs;
        const cornerCellX = Math.floor(corner.x / cs);
        const cornerCellY = Math.floor(corner.y / cs);
        const cornerPhase = (cornerCellX + cornerCellY) % 2;
        if (cornerPhase === 0) { evenColor = cp; oddColor = c2; }
        else { evenColor = c2; oddColor = cp; }
        break;
      }

      if (cellSize > 0) {
        const tolerance = 35;
        const matchColor = (r: number, g: number, b: number, c: [number, number, number]) =>
          Math.abs(r - c[0]) < tolerance && Math.abs(g - c[1]) < tolerance && Math.abs(b - c[2]) < tolerance;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = d[i], g = d[i + 1], b = d[i + 2];
            if (!isGray(r, g, b)) continue;
            const cellX = Math.floor(x / cellSize);
            const cellY = Math.floor(y / cellSize);
            const phase = (cellX + cellY) % 2;
            const expectedColor = phase === 0 ? evenColor : oddColor;
            if (matchColor(r, g, b, expectedColor)) {
              d[i + 3] = 0;
            }
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      // Neither detected → return original
      resolve(dataUri);
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