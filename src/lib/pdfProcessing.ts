import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export interface PdfPage {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

/**
 * Convert multiple images to a single PDF file
 */
export async function imagesToSinglePdf(
  imageUrls: { url: string; width: number; height: number }[]
): Promise<Blob> {
  const first = imageUrls[0];
  const pdf = new jsPDF({
    orientation: first.width > first.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [first.width, first.height],
  });

  for (let i = 0; i < imageUrls.length; i++) {
    const img = imageUrls[i];
    if (i > 0) {
      pdf.addPage([img.width, img.height], img.width > img.height ? 'landscape' : 'portrait');
    }
    // Load image as data URL
    const dataUrl = await toDataUrl(img.url);
    pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);
  }

  return pdf.output('blob');
}

/**
 * Convert a single image to its own PDF file
 */
export async function imageToPdf(
  imageUrl: string,
  width: number,
  height: number
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
  });

  const dataUrl = await toDataUrl(imageUrl);
  pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);

  return pdf.output('blob');
}

/**
 * Convert PDF pages to images (JPG)
 */
export async function pdfToImages(
  pdfFile: File,
  scale: number = 2
): Promise<PdfPage[]> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: PdfPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to render PDF page'))),
        'image/jpeg',
        0.92
      );
    });

    pages.push({
      blob,
      url: URL.createObjectURL(blob),
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
    });
  }

  return pages;
}

/** Helper: convert image URL to data URL via canvas */
async function toDataUrl(url: string): Promise<string> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Extract the first page of a PDF as a JPEG preview URL
 */
export async function extractPdfFirstPage(
  pdfFile: File,
  scale: number = 1
): Promise<string> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  await page.render({ canvasContext: ctx, viewport }).promise;

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(URL.createObjectURL(b)) : reject(new Error('Failed to render PDF preview'))),
      'image/jpeg',
      0.8
    );
  });
}
