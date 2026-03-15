import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/input';
import {
  Maximize2, FileDown, RefreshCw, ArrowRight,
  Crop, RotateCcw, Stamp, Eraser, Palette, FileText, LayoutGrid,
  Link as LinkIcon, Scissors,
  Info, Pipette, Binary, QrCode, Image as ImageIcon,
  Grid3X3, EyeOff, Type, ArrowLeftRight, Sparkles,
  ScanText, PenTool, Wand2, BrainCircuit, Search,
  Shield, Zap, Lock, Layers
} from 'lucide-react';

const Index = () => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const tools = [
    { icon: Maximize2, title: t('feature.resize.title'), description: t('feature.resize.desc'), path: '/resize' },
    { icon: FileDown, title: t('feature.compress.title'), description: t('feature.compress.desc'), path: '/compress' },
    { icon: RefreshCw, title: t('feature.convert.title'), description: t('feature.convert.desc'), path: '/convert' },
    { icon: Crop, title: t('feature.crop.title'), description: t('feature.crop.desc'), path: '/crop' },
    { icon: RotateCcw, title: t('feature.rotate.title'), description: t('feature.rotate.desc'), path: '/rotate' },
    { icon: Stamp, title: t('feature.watermark.title'), description: t('feature.watermark.desc'), path: '/watermark' },
    { icon: Palette, title: t('feature.filters.title'), description: t('feature.filters.desc'), path: '/filters' },
    { icon: FileText, title: t('feature.rename.title'), description: t('feature.rename.desc'), path: '/rename' },
    { icon: LayoutGrid, title: t('feature.collage.title'), description: t('feature.collage.desc'), path: '/collage' },
    { icon: LinkIcon, title: t('feature.imageToLink.title'), description: t('feature.imageToLink.desc'), path: '/image-to-link' },
    { icon: Info, title: t('feature.metadata.title'), description: t('feature.metadata.desc'), path: '/metadata' },
    { icon: Pipette, title: t('feature.colorPicker.title'), description: t('feature.colorPicker.desc'), path: '/color-picker' },
    { icon: Binary, title: t('feature.base64.title'), description: t('feature.base64.desc'), path: '/base64' },
    { icon: QrCode, title: t('feature.qrCode.title'), description: t('feature.qrCode.desc'), path: '/qr-code' },
    { icon: ImageIcon, title: t('feature.favicon.title'), description: t('feature.favicon.desc'), path: '/favicon' },
    { icon: Grid3X3, title: t('feature.splitter.title'), description: t('feature.splitter.desc'), path: '/splitter' },
    { icon: EyeOff, title: t('feature.blur.title'), description: t('feature.blur.desc'), path: '/blur' },
    { icon: Type, title: t('feature.meme.title'), description: t('feature.meme.desc'), path: '/meme' },
    { icon: ArrowLeftRight, title: t('feature.compare.title'), description: t('feature.compare.desc'), path: '/compare' },
    { icon: Sparkles, title: t('feature.beautifier.title'), description: t('feature.beautifier.desc'), path: '/beautifier' },
    { icon: PenTool, title: t('feature.annotate.title'), description: t('feature.annotate.desc'), path: '/annotate' },
    
    // AI Tools (Coming Soon)
    { icon: ScanText, title: t('feature.ocr.title'), description: t('feature.ocr.desc'), path: '/ocr', isAi: true },
    { icon: Scissors, title: t('feature.removeWatermark.title'), description: t('feature.removeWatermark.desc'), path: '/remove-watermark', isAi: true },
    { icon: Eraser, title: t('feature.removeBg.title'), description: t('feature.removeBg.desc'), path: '/remove-bg', isAi: true },
    { icon: Wand2, title: t('feature.upscale.title'), description: t('feature.upscale.desc'), path: '/upscale', isAi: true },
    { icon: BrainCircuit, title: t('feature.aiGen.title'), description: t('feature.aiGen.desc'), path: '/ai-generator', isAi: true },
  ];


  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    const q = searchQuery.toLowerCase();

    // Natural language keyword mapping
    const keywordMap: Record<string, string[]> = {
      '/resize': ['resize', 'ubah ukuran', 'perbesar', 'perkecil', 'dimensi', 'dimension', 'scale', 'size image', 'ukuran gambar', 'resolusi', 'resolution', 'pixel'],
      '/compress': ['compress', 'kompres', 'kecilkan', 'kecilin', 'reduce', 'smaller', 'file size', 'ukuran file', 'optimize', 'optimasi', 'ringan', 'lightweight', 'loading', 'kecil'],
      '/convert': ['convert', 'konversi', 'jpg', 'jpeg', 'png', 'webp', 'format', 'ubah format', 'ganti format', 'change format', 'tipe file', 'file type'],
      '/crop': ['crop', 'potong', 'cut', 'trim', 'pangkas', 'ratio', 'rasio', 'square', 'kotak'],
      '/rotate': ['rotate', 'putar', 'flip', 'balik', 'mirror', 'cermin', 'landscape', 'portrait', '90', '180', 'miring'],
      '/watermark': ['watermark', 'tanda air', 'logo', 'brand', 'copyright', 'hak cipta', 'stamp', 'cap'],
      '/remove-watermark': ['remove watermark', 'hapus watermark', 'notebooklm', 'notebook lm', 'potong bawah', 'crop bottom', 'watermark remover'],
      '/remove-bg': ['remove bg', 'background', 'latar', 'hapus latar', 'transparent', 'transparan', 'cutout', 'sticker', 'stiker', 'tanpa background'],
      '/filters': ['filter', 'efek', 'effect', 'brightness', 'contrast', 'saturation', 'kecerahan', 'kontras', 'saturasi', 'vintage', 'sepia', 'grayscale', 'hitam putih', 'black white', 'edit warna', 'color edit'],
      '/rename': ['rename', 'ganti nama', 'ubah nama', 'bulk rename', 'batch rename', 'massal'],
      '/collage': ['collage', 'kolase', 'gabung', 'merge', 'combine', 'grid', 'layout', 'kumpulkan'],
      '/image-to-link': ['link', 'share', 'bagikan', 'url', 'upload', 'hosting', 'online'],
      '/metadata': ['metadata', 'exif', 'info', 'informasi', 'camera', 'kamera', 'data gambar', 'detail', 'properties'],
      '/color-picker': ['color', 'warna', 'picker', 'ambil warna', 'palette', 'hex', 'rgb', 'eyedropper', 'pipet'],
      '/base64': ['base64', 'encode', 'decode', 'string', 'text', 'code', 'kode'],
      '/qr-code': ['qr', 'qr code', 'barcode', 'scan', 'kode qr'],
      '/favicon': ['favicon', 'icon', 'ikon', 'app icon', 'ico', 'pwa'],
      '/splitter': ['split', 'potong grid', 'carousel', 'instagram', 'feed', 'bagi', 'pecah'],
      '/blur': ['blur', 'sensor', 'censor', 'pixelate', 'pixel', 'samarkan', 'hide', 'sembunyikan', 'privacy', 'privasi'],
      '/meme': ['meme', 'text', 'teks', 'funny', 'lucu', 'caption', 'tulisan'],
      '/compare': ['compare', 'bandingkan', 'before after', 'sebelum sesudah', 'slider', 'perbandingan', 'diff'],
      '/beautifier': ['beautify', 'percantik', 'screenshot', 'mockup', 'frame', 'bingkai', 'shadow', 'bayangan', 'gradient', 'gradien'],
      '/ocr': ['ocr', 'text from image', 'extract text', 'baca teks', 'scan text', 'teks dari gambar', 'recognize', 'tulisan'],
      '/annotate': ['annotate', 'anotasi', 'draw', 'gambar', 'arrow', 'panah', 'shape', 'bentuk', 'coret', 'tulis di gambar', 'mark', 'tandai'],
      '/upscale': ['upscale', 'enhance', 'tingkatkan', 'perbesar', 'hd', 'high resolution', 'resolusi tinggi', 'quality', 'kualitas', 'jernih', 'tajam', 'sharp', 'ai enhance'],
      '/ai-generator': ['ai', 'generate', 'buat gambar', 'create image', 'artificial intelligence', 'text to image', 'prompt', 'ai gambar'],
    };

    return tools.filter((tool) => {
      // Match title/description
      if (tool.title.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q)) return true;
      // Match keywords
      const keywords = keywordMap[tool.path] || [];
      return keywords.some((kw) => q.includes(kw) || kw.includes(q));
    });
  }, [searchQuery, tools]);

  const activeToolsCount = tools.filter(t => !t.isAi).length;
  const comingSoonToolsCount = tools.filter(t => t.isAi).length;

  return (
    <div className="min-h-full flex flex-col">
      {/* Dashboard Header */}
      <section className="relative z-10 px-1 pt-2 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-sidebar-foreground">
              GambarYuk!
            </h1>
            <p className="mt-2 text-base md:text-lg text-muted-foreground font-medium">
              {t('app.slogan.main')} <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded ml-1">{t('app.slogan.highlight')}</span>
            </p>
          </div>
          <div className="relative w-full md:w-72" id="tour-search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="tool-search"
              type="text"
              placeholder={t('nav.home') === 'Home' ? 'Search tool...' : 'Cari alat...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full rounded-full border-border bg-card shadow-sm text-sm"
            />
          </div>
        </div>
      </section>



      {/* Tools Grid */}
      <section className="relative z-10 flex-1 px-1 pb-8">
        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm" id="tour-grid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-sidebar-foreground">
                {t('nav.home') === 'Home' ? 'Available Tools' : 'Alat Tersedia'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {activeToolsCount} {t('nav.home') === 'Home' ? 'Active' : 'Aktif'}
                </span>
                {comingSoonToolsCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {comingSoonToolsCount} {t('nav.home') === 'Home' ? 'Coming Soon' : 'Segera Hadir'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {filteredTools.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              {t('nav.home') === 'Home' ? 'No tools found matching your search.' : 'Tools tidak ditemukan.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredTools.map((tool, index) => {
                const isAiDisabled = tool.isAi;
                
                const cardContent = (
                  <div className={`h-full rounded-xl border border-border/50 bg-background/50 p-4 transition-all duration-300 flex flex-col items-start gap-3 relative overflow-hidden ${isAiDisabled ? 'opacity-60 cursor-not-allowed bg-muted/30 grayscale-[50%]' : 'group-hover:bg-card group-hover:-translate-y-1 group-hover:border-primary group-hover:ring-1 group-hover:ring-primary group-hover:shadow-md'}`}>
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-3xl -z-10 transition-colors ${!isAiDisabled && 'group-hover:from-primary/10'}`} />

                    {isAiDisabled && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </div>
                    )}

                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border/60 text-sidebar-foreground transition-all duration-300 shadow-sm ${!isAiDisabled && 'group-hover:border-primary/30 group-hover:text-primary'}`}>
                      <tool.icon className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className={`text-sm font-bold text-sidebar-foreground leading-tight transition-colors duration-200 mb-1 ${!isAiDisabled && 'group-hover:text-primary'}`}>
                        {tool.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );

                if (isAiDisabled) {
                  return (
                    <div 
                      key={tool.path}
                      className="group animate-fade-in flex flex-col h-full"
                      style={{ animationDelay: `${0.02 * index}s` }}
                      title="Segera Hadir / Coming Soon"
                    >
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className="group animate-fade-in flex flex-col h-full"
                    style={{ animationDelay: `${0.02 * index}s` }}
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-4 py-5">
        <div className="mx-auto max-w-4xl text-center space-y-0.5">
          <p className="text-xs text-muted-foreground">
            © 2026 GambarYuk. Part of YukAccess.
          </p>
          <p className="text-xs text-muted-foreground/60">
            All processing happens in your browser — zero data stored.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
