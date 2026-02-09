import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { 
  Maximize2, FileDown, RefreshCw, Zap, Shield, Gift, ArrowRight,
  Crop, RotateCcw, Stamp, Eraser, Palette, FileText, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { t } = useLanguage();

  const featureCategories = [
    {
      title: t('category.essential'),
      features: [
        {
          icon: Maximize2,
          title: t('feature.resize.title'),
          description: t('feature.resize.desc'),
          path: '/resize',
        },
        {
          icon: FileDown,
          title: t('feature.compress.title'),
          description: t('feature.compress.desc'),
          path: '/compress',
        },
        {
          icon: RefreshCw,
          title: t('feature.convert.title'),
          description: t('feature.convert.desc'),
          path: '/convert',
        },
      ],
    },
    {
      title: t('category.edit'),
      features: [
        {
          icon: Crop,
          title: t('feature.crop.title'),
          description: t('feature.crop.desc'),
          path: '/crop',
        },
        {
          icon: RotateCcw,
          title: t('feature.rotate.title'),
          description: t('feature.rotate.desc'),
          path: '/rotate',
        },
        {
          icon: Stamp,
          title: t('feature.watermark.title'),
          description: t('feature.watermark.desc'),
          path: '/watermark',
        },
      ],
    },
    {
      title: t('category.advanced'),
      features: [
        {
          icon: Eraser,
          title: t('feature.removeBg.title'),
          description: t('feature.removeBg.desc'),
          path: '/remove-bg',
        },
        {
          icon: Palette,
          title: t('feature.filters.title'),
          description: t('feature.filters.desc'),
          path: '/filters',
        },
        {
          icon: FileText,
          title: t('feature.rename.title'),
          description: t('feature.rename.desc'),
          path: '/rename',
        },
        {
          icon: LayoutGrid,
          title: t('feature.collage.title'),
          description: t('feature.collage.desc'),
          path: '/collage',
        },
      ],
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: t('benefits.fast.title'),
      description: t('benefits.fast.desc'),
    },
    {
      icon: Shield,
      title: t('benefits.private.title'),
      description: t('benefits.private.desc'),
    },
    {
      icon: Gift,
      title: t('benefits.free.title'),
      description: t('benefits.free.desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="animate-fade-in text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-2 animate-fade-in text-xl font-medium text-primary md:text-2xl" style={{ animationDelay: '0.1s' }}>
            {t('hero.subtitle')}
          </p>
          <p className="mx-auto mt-6 max-w-2xl animate-fade-in text-lg text-muted-foreground" style={{ animationDelay: '0.2s' }}>
            {t('hero.description')}
          </p>
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/resize">
              <Button size="lg" className="btn-accent h-12 px-8 text-base font-semibold rounded-xl gap-2">
                {t('hero.cta')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </section>

      {/* Features Section */}
      {featureCategories.map((category, categoryIndex) => (
        <section 
          key={category.title} 
          className={`px-4 py-12 md:py-16 ${categoryIndex % 2 === 1 ? 'bg-muted/30' : ''}`}
        >
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl mb-8">
              {category.title}
            </h2>
            <div className={`grid gap-6 ${category.features.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
              {category.features.map((feature, index) => (
                <Link
                  key={feature.path}
                  to={feature.path}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="h-full rounded-2xl border border-border/50 bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 hover:border-primary/30">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary">
                      <span>{t('common.getStarted')}</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Benefits Section */}
      <section className="px-4 py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            {t('benefits.title')}
          </h2>
          
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-8">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 ImageUtils. All processing happens in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;