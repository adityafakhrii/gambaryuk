import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useImageStats } from '@/hooks/useImageStats';
import { Input } from '@/components/ui/input';
import {
  Maximize2, FileDown, RefreshCw, ArrowRight,
  Crop, RotateCcw, Stamp, Eraser, Palette, FileText, LayoutGrid,
  Images, Zap, Shield, Link as LinkIcon,
  Info, Pipette, Binary, QrCode, Image as ImageIcon,
  Grid3X3, EyeOff, Type, ArrowLeftRight, Sparkles,
  ScanText, PenTool, Wand2, BrainCircuit, Sun, Moon, Search,
} from 'lucide-react';

const Index = () => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { stats } = useImageStats();
  const [searchQuery, setSearchQuery] = useState('');

  const tools = [
    { icon: Maximize2, title: t('feature.resize.title'), description: t('feature.resize.desc'), path: '/resize' },
    { icon: FileDown, title: t('feature.compress.title'), description: t('feature.compress.desc'), path: '/compress' },
    { icon: RefreshCw, title: t('feature.convert.title'), description: t('feature.convert.desc'), path: '/convert' },
    { icon: Crop, title: t('feature.crop.title'), description: t('feature.crop.desc'), path: '/crop' },
    { icon: RotateCcw, title: t('feature.rotate.title'), description: t('feature.rotate.desc'), path: '/rotate' },
    { icon: Stamp, title: t('feature.watermark.title'), description: t('feature.watermark.desc'), path: '/watermark' },
    { icon: Eraser, title: t('feature.removeBg.title'), description: t('feature.removeBg.desc'), path: '/remove-bg' },
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
    { icon: ScanText, title: t('feature.ocr.title'), description: t('feature.ocr.desc'), path: '/ocr' },
    { icon: PenTool, title: t('feature.annotate.title'), description: t('feature.annotate.desc'), path: '/annotate' },
    { icon: Wand2, title: t('feature.upscale.title'), description: t('feature.upscale.desc'), path: '/upscale' },
    { icon: BrainCircuit, title: t('feature.aiGen.title'), description: t('feature.aiGen.desc'), path: '/ai-generator' },
  ];

  const statItems = [
    {
      icon: Images,
      label: 'Gambar Diproses',
      value: stats.totalProcessed.toLocaleString('id-ID'),
      suffix: 'file',
    },
    {
      icon: Zap,
      label: 'Total Tools',
      value: tools.length.toString(),
      suffix: 'tools',
    },
    {
      icon: Shield,
      label: 'Data Tersimpan',
      value: '0',
      suffix: 'byte',
    },
  ];

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    const q = searchQuery.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
    );
  }, [searchQuery, tools]);

  return (
    <div className="min-h-full flex flex-col">
      {/* Hero - compact */}
      <section className="relative z-10 px-4 pt-8 pb-5 text-center">
        <div className="mx-auto max-w-2xl">
          {/* Theme toggle pill */}
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 backdrop-blur px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-300 shadow-soft hover:shadow-soft-lg"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              )}
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            GambarYuk
          </h1>
          <p className="mt-1.5 text-sm md:text-base text-muted-foreground">
            {t('app.slogan')}
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="relative z-10 px-4 pb-6">
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-3 gap-3">
            {statItems.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/50 bg-card/80 backdrop-blur px-3 py-3 text-center shadow-soft"
              >
                <div className="flex justify-center mb-1">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-lg font-bold text-foreground leading-none">
                  {stat.value}
                  <span className="text-xs font-normal text-muted-foreground ml-1">{stat.suffix}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search + Tools Grid */}
      <section className="relative z-10 flex-1 px-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('nav.home') === 'Home' ? 'Search tools...' : 'Cari tools...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-border/50 bg-card/80 backdrop-blur shadow-soft"
            />
          </div>
          {filteredTools.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('nav.home') === 'Home' ? 'No tools found.' : 'Tools tidak ditemukan.'}
            </div>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredTools.map((tool, index) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group animate-fade-in"
                style={{ animationDelay: `${0.04 * index}s` }}
              >
                <div className="h-full rounded-2xl border border-border/50 bg-card p-4 shadow-soft hover-card-enhanced flex flex-col items-center text-center gap-2.5 transition-all duration-300 group-hover:bg-primary/5 group-hover:border-primary/30">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
                    <tool.icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[-8deg]" />
                  </div>
                  <h3 className="text-xs font-semibold text-foreground leading-tight transition-colors duration-200 group-hover:text-primary">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-snug hidden sm:block line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-primary opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
