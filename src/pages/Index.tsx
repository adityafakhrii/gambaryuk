import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { 
  Maximize2, FileDown, RefreshCw, ArrowRight,
  Crop, RotateCcw, Stamp, Eraser, Palette, FileText, LayoutGrid, Shield
} from 'lucide-react';

const Index = () => {
  const { t } = useLanguage();

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
  ];

  return (
    <div className="min-h-screen page-gradient flex flex-col">
      <Header />
      
      {/* Hero - compact */}
      <section className="relative z-10 px-4 pt-10 pb-6 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            GambarYuk
          </h1>
          <p className="mt-2 text-base md:text-lg text-muted-foreground">
            {t('app.slogan')}
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative z-10 flex-1 px-4 pb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tools.map((tool, index) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group animate-fade-in"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="h-full rounded-2xl border border-border/50 bg-card p-5 shadow-soft hover-card-enhanced flex flex-col items-center text-center gap-3 transition-all duration-300 group-hover:bg-primary/5 group-hover:border-primary/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
                    <tool.icon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-[-8deg]" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight transition-colors duration-200 group-hover:text-primary">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-snug hidden sm:block">
                    {tool.description}
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-primary opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Privacy badge */}
          <Link to="/privacy" className="mt-8 mx-auto flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Shield className="h-4 w-4" />
            <span>{t('footer.privacy')}</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-4 py-6">
        <div className="container mx-auto max-w-5xl text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            © 2026 GambarYuk. Part of YukAccess.
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t('footer.browserOnly')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
