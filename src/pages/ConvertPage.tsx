import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackImageProcessed } from '@/hooks/useImageStats';
import { UploadZone } from '@/components/UploadZone';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { convertImage, downloadImage, formatFileSize, ProcessedImage } from '@/lib/imageProcessing';
import { imagesToSinglePdf, imageToPdf, pdfToImages, PdfPage, extractPdfFirstPage } from '@/lib/pdfProcessing';
import { downloadAsZip } from '@/lib/zipDownload';
import { Download, Loader2, Trash2, FileText } from 'lucide-react';
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
  pdfBlob?: Blob; // for image-to-pdf result
}

interface PdfFileState {
  file: File;
  preview?: string;
}

type Format = 'jpeg' | 'png' | 'webp' | 'bmp' | 'gif' | 'ico' | 'svg' | 'avif' | 'tiff' | 'pdf';

export default function ConvertPage() {
  const { t } = useLanguage();

  const formats: { value: Format; label: string; description: string }[] = [
    { value: 'jpeg', label: 'JPEG (.jpg)', description: t('format.jpeg.desc') },
    { value: 'png', label: 'PNG (.png)', description: t('format.png.desc') },
    { value: 'webp', label: 'WebP (.webp)', description: t('format.webp.desc') },
    { value: 'pdf', label: 'PDF (.pdf)', description: t('format.pdf.desc') },
    { value: 'avif', label: 'AVIF (.avif)', description: t('format.avif.desc') },
    { value: 'gif', label: 'GIF (.gif)', description: t('format.gif.desc') },
    { value: 'bmp', label: 'BMP (.bmp)', description: t('format.bmp.desc') },
    { value: 'ico', label: 'ICO (.ico)', description: t('format.ico.desc') },
    { value: 'svg', label: 'SVG (.svg)', description: t('format.svg.desc') },
    { value: 'tiff', label: 'TIFF (.tiff)', description: t('format.tiff.desc') },
  ];

  const [images, setImages] = useState<ProcessedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<Format>('webp');
  const [preserveTransparency, setPreserveTransparency] = useState(true);
  const [pdfMode, setPdfMode] = useState<'single' | 'separate'>('single');

  // PDF file input state
  const [pdfFiles, setPdfFiles] = useState<PdfFileState[]>([]);
  const [pdfPages, setPdfPages] = useState<PdfPage[]>([]);
  const [pdfProcessing, setPdfProcessing] = useState(false);

  const isPdfSource = pdfFiles.length > 0;

  const handleFilesSelected = useCallback((files: ImageFile[]) => {
    setImages((prev) => [...prev, ...files.map(f => ({ ...f }))]);
    setPdfFiles([]);
    setPdfPages([]);
  }, []);

  const handlePdfUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const pdfs = Array.from(files).filter(f => f.type === 'application/pdf');
    if (pdfs.length === 0) {
      toast.error('Hanya file PDF yang diterima');
      return;
    }

    // Create initial state
    const newPdfStates: PdfFileState[] = pdfs.map(f => ({ file: f }));
    setPdfFiles(newPdfStates);
    setImages([]);
    setPdfPages([]);
    setTargetFormat('jpeg');

    // Load previews asynchronously
    for (let i = 0; i < pdfs.length; i++) {
      try {
        const previewUrl = await extractPdfFirstPage(pdfs[i], 0.5); // scale 0.5 for small preview
        setPdfFiles(current => {
          const updated = [...current];
          if (updated[i]) {
            updated[i] = { ...updated[i], preview: previewUrl };
          }
          return updated;
        });
      } catch (err) {
        console.error('Failed to extract PDF preview', err);
      }
    }
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
    pdfPages.forEach(p => URL.revokeObjectURL(p.url));
    setPdfPages([]);
    pdfFiles.forEach(p => {
      if (p.preview) URL.revokeObjectURL(p.preview);
    });
    setPdfFiles([]);
  };

  const getOriginalFormat = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', webp: 'WebP',
      gif: 'GIF', bmp: 'BMP', ico: 'ICO', svg: 'SVG',
      avif: 'AVIF', tiff: 'TIFF', tif: 'TIFF', pdf: 'PDF',
    };
    return map[ext] || ext.toUpperCase();
  };

  const getMimeType = (format: Format): string => {
    const map: Record<Format, string> = {
      jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
      avif: 'image/avif', gif: 'image/gif', bmp: 'image/bmp',
      ico: 'image/x-icon', svg: 'image/svg+xml', tiff: 'image/tiff',
      pdf: 'application/pdf',
    };
    return map[format];
  };

  const getExt = (format: Format): string => {
    if (format === 'jpeg') return 'jpg';
    if (format === 'tiff') return 'tif';
    return format;
  };

  // Process PDF to Images
  const processPdfToImages = async () => {
    setPdfProcessing(true);
    try {
      const allPages: PdfPage[] = [];
      for (const pdfState of pdfFiles) {
        const pages = await pdfToImages(pdfState.file);
        allPages.push(...pages);
      }
      setPdfPages(allPages);
      trackImageProcessed(allPages.length);
      toast.success(`${allPages.length} halaman berhasil dikonversi!`);
    } catch (error) {
      toast.error('Gagal mengkonversi PDF');
    }
    setPdfProcessing(false);
  };

  // Process Images to PDF
  const processImagesToPdf = async () => {
    if (pdfMode === 'single') {
      // Merge all images into one PDF
      setImages(prev => prev.map(img => ({ ...img, processing: true })));
      try {
        const pdfBlob = await imagesToSinglePdf(
          images.map(img => ({ url: img.preview, width: img.width, height: img.height }))
        );
        // Store result on first image, mark all done
        const resultUrl = URL.createObjectURL(pdfBlob);
        setImages(prev => prev.map((img, i) => ({
          ...img,
          processing: false,
          pdfBlob: i === 0 ? pdfBlob : undefined,
          result: i === 0 ? {
            blob: pdfBlob,
            url: resultUrl,
            width: img.width,
            height: img.height,
            size: pdfBlob.size,
            format: 'pdf',
          } : img.result,
        })));
        trackImageProcessed(images.length);
        toast.success('Semua gambar digabung jadi 1 PDF!');
      } catch (error) {
        toast.error('Gagal membuat PDF');
        setImages(prev => prev.map(img => ({ ...img, processing: false })));
      }
    } else {
      // Separate: each image becomes its own PDF
      for (const image of images) {
        if (image.result) continue;
        setImages(prev => prev.map(img =>
          img.id === image.id ? { ...img, processing: true } : img
        ));
        try {
          const pdfBlob = await imageToPdf(image.preview, image.width, image.height);
          setImages(prev => prev.map(img =>
            img.id === image.id ? {
              ...img,
              processing: false,
              pdfBlob,
              result: {
                blob: pdfBlob,
                url: URL.createObjectURL(pdfBlob),
                width: img.width,
                height: img.height,
                size: pdfBlob.size,
                format: 'pdf',
              },
            } : img
          ));
          trackImageProcessed();
        } catch {
          setImages(prev => prev.map(img =>
            img.id === image.id ? { ...img, processing: false } : img
          ));
        }
      }
      toast.success('Setiap gambar dikonversi ke PDF terpisah!');
    }
  };

  // Standard image format conversion
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

  const processImage = async (image: ProcessedFile) => {
    setImages(prev => prev.map(img =>
      img.id === image.id ? { ...img, processing: true } : img
    ));

    try {
      let result: ProcessedImage;

      if (targetFormat === 'svg') {
        const svgBlob = await imageToTracedSvg(image.preview, image.width, image.height);
        result = {
          blob: svgBlob, url: URL.createObjectURL(svgBlob),
          width: image.width, height: image.height, size: svgBlob.size, format: 'svg',
        };
      } else if (targetFormat === 'ico') {
        const icoResult = await convertImage(image.preview, { format: 'png', preserveTransparency: true });
        const icoBlob = new Blob([icoResult.blob], { type: 'image/x-icon' });
        result = { ...icoResult, blob: icoBlob, size: icoBlob.size, format: 'ico' };
      } else {
        const canvasFormat = (['jpeg', 'png', 'webp'] as const).includes(targetFormat as 'jpeg' | 'png' | 'webp')
          ? targetFormat as 'jpeg' | 'png' | 'webp'
          : 'png';

        result = await convertImage(image.preview, {
          format: canvasFormat,
          preserveTransparency: preserveTransparency && targetFormat !== 'jpeg',
        });

        if (!['jpeg', 'png', 'webp'].includes(targetFormat)) {
          const reBlob = new Blob([result.blob], { type: getMimeType(targetFormat) });
          result = { ...result, blob: reBlob, size: reBlob.size, format: targetFormat };
        }
      }

      setImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, result, processing: false } : img
      ));
      trackImageProcessed();
      toast.success(t('common.success'));
    } catch (error) {
      toast.error('Failed to convert image');
      setImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, processing: false } : img
      ));
    }
  };

  const processAll = async () => {
    if (targetFormat === 'pdf') {
      await processImagesToPdf();
      return;
    }
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

  const handleDownloadAll = async () => {
    if (targetFormat === 'pdf' && pdfMode === 'single') {
      const first = images.find(img => img.pdfBlob);
      if (first?.pdfBlob) {
        downloadImage(first.pdfBlob, 'merged.pdf');
      }
    } else {
      const processed = images.filter(img => img.result);
      if (processed.length <= 1) {
        processed.forEach(img => handleDownload(img));
        return;
      }
      const ext = getExt(targetFormat);
      await downloadAsZip(
        processed.map(img => ({
          name: img.file.name.replace(/\.[^.]+$/, '') + `.${ext}`,
          blob: img.result!.blob,
        })),
        `converted-images.zip`
      );
    }
  };

  const handleDownloadPdfPage = (page: PdfPage, index: number) => {
    const name = pdfFiles[0]?.file?.name?.replace(/\.pdf$/i, '') || 'page';
    downloadImage(page.blob, `${name}_page${index + 1}.jpg`);
  };

  const handleDownloadAllPdfPages = async () => {
    if (pdfPages.length <= 1) {
      pdfPages.forEach((page, i) => handleDownloadPdfPage(page, i));
      return;
    }
    const name = pdfFiles[0]?.file?.name?.replace(/\.pdf$/i, '') || 'page';
    await downloadAsZip(
      pdfPages.map((page, i) => ({
        name: `${name}_page${i + 1}.jpg`,
        blob: page.blob,
      })),
      `${name}-pages.zip`
    );
  };

  const showPdfModeOption = targetFormat === 'pdf' && images.length > 1;
  const showTransparency = !['jpeg', 'bmp', 'gif', 'ico', 'pdf'].includes(targetFormat);

  return (
    <div className="min-h-full">
      <main className="container relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {t('convert.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('feature.convert.desc')}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Area */}
          <div className="space-y-6">
            {/* PDF Upload Option */}
            {images.length === 0 && pdfFiles.length === 0 && (
              <div className="space-y-4">
                <UploadZone onFilesSelected={handleFilesSelected} className="min-h-[240px]" />

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative bg-background px-4 py-1 rounded-full text-center">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                      {t('upload.or') || 'ATAU'}
                    </span>
                  </div>
                </div>

                <label className="flex flex-col cursor-pointer items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/50 bg-card shadow-soft p-8 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">{t('upload.pdfTitle')}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t('upload.pdfDesc')}</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handlePdfUpload}
                  />
                </label>
              </div>
            )}

            {/* PDF source: show PDF info & results */}
            {isPdfSource && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {pdfFiles.length} PDF file{pdfFiles.length > 1 ? 's' : ''} dipilih
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('common.clearAll')}
                  </Button>
                </div>

                {/* PDF file cards */}
                <div className="space-y-2">
                  {pdfFiles.map((pdfState, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                      {pdfState.preview ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/50 shadow-sm bg-white flex items-center justify-center">
                          <img src={pdfState.preview} alt="PDF Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{pdfState.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(pdfState.file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Converted pages */}
                {pdfPages.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{pdfPages.length} halaman dikonversi</p>
                      <Button size="sm" onClick={handleDownloadAllPdfPages}>
                        <Download className="h-4 w-4 mr-1" />
                        {t('common.downloadAll')}
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {pdfPages.map((page, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                          <img src={page.url} alt={`Page ${i + 1}`} className="w-full h-32 object-contain bg-muted" />
                          <div className="p-3 flex items-center justify-between border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              Hal {i + 1} • {formatFileSize(page.blob.size)}
                            </p>
                            <Button size="sm" variant="ghost" onClick={() => handleDownloadPdfPage(page, i)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image source: show images */}
            {!isPdfSource && images.length > 0 && (
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
                        <img src={image.preview} alt="Preview" className="w-full h-40 object-contain bg-muted" />
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
                                {targetFormat === 'pdf' && pdfMode === 'single'
                                  ? 'Digabung ke 1 PDF'
                                  : `Converted to ${targetFormat.toUpperCase()}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(image.result.size)}
                              </p>
                            </div>
                            {!(targetFormat === 'pdf' && pdfMode === 'single') && (
                              <Button size="sm" onClick={() => handleDownload(image)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
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
              <h2 className="font-semibold text-foreground">
                {isPdfSource ? 'PDF ke Gambar' : t('convert.to')}
              </h2>

              <div className="mt-4 space-y-4">
                {!isPdfSource && (
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
                )}

                {isPdfSource && (
                  <p className="text-sm text-muted-foreground">
                    Setiap halaman PDF akan dikonversi menjadi gambar JPG berkualitas tinggi.
                  </p>
                )}

                {showTransparency && (
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

                {/* PDF merge option */}
                {showPdfModeOption && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{t('convert.pdfOptions')}</Label>
                    <RadioGroup value={pdfMode} onValueChange={(v) => setPdfMode(v as 'single' | 'separate')}>
                      <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                        <RadioGroupItem value="single" id="pdf-single" className="mt-0.5" />
                        <Label htmlFor="pdf-single" className="cursor-pointer">
                          <p className="text-sm font-medium">{t('convert.mergePdf')}</p>
                          <p className="text-xs text-muted-foreground">{t('convert.mergeDesc')}</p>
                        </Label>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                        <RadioGroupItem value="separate" id="pdf-separate" className="mt-0.5" />
                        <Label htmlFor="pdf-separate" className="cursor-pointer">
                          <p className="text-sm font-medium">{t('convert.splitPdf')}</p>
                          <p className="text-xs text-muted-foreground">{t('convert.splitDesc')}</p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-xl bg-muted/50 p-4">
                <h3 className="text-sm font-medium text-foreground">{t('convert.formatInfo')}</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isPdfSource
                    ? t('convert.pdfSourceDesc')
                    : formats.find(f => f.value === targetFormat)?.description}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            {(images.length > 0 || isPdfSource) && (
              <div className="space-y-3">
                {isPdfSource && pdfPages.length === 0 && (
                  <Button
                    className="w-full btn-accent"
                    size="lg"
                    onClick={processPdfToImages}
                    disabled={pdfProcessing}
                  >
                    {pdfProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Konversi PDF ke JPG
                  </Button>
                )}

                {!isPdfSource && images.length > 0 && (
                  <>
                    <Button
                      className="w-full btn-accent"
                      size="lg"
                      onClick={processAll}
                      disabled={images.every(img => img.processing)}
                    >
                      {images.some(img => img.processing) && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      {targetFormat === 'pdf' && pdfMode === 'single'
                        ? 'Gabung ke PDF'
                        : images.length > 1 ? t('common.processAll') : t('common.process')}
                    </Button>

                    {images.some(img => img.result) && (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={handleDownloadAll}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {targetFormat === 'pdf' && pdfMode === 'single'
                          ? 'Download PDF'
                          : t('common.downloadAll')}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
