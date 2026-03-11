import { Link, useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChevronRight, Home, Sun, Moon, Coffee } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const routeLabels: Record<string, string> = {
  '/resize': 'feature.resize.title',
  '/compress': 'feature.compress.title',
  '/convert': 'feature.convert.title',
  '/crop': 'feature.crop.title',
  '/rotate': 'feature.rotate.title',
  '/watermark': 'feature.watermark.title',
  '/remove-bg': 'feature.removeBg.title',
  '/filters': 'feature.filters.title',
  '/rename': 'feature.rename.title',
  '/collage': 'feature.collage.title',
  '/image-to-link': 'feature.imageToLink.title',
  '/metadata': 'feature.metadata.title',
  '/color-picker': 'feature.colorPicker.title',
  '/base64': 'feature.base64.title',
  '/qr-code': 'feature.qrCode.title',
  '/favicon': 'feature.favicon.title',
  '/splitter': 'feature.splitter.title',
  '/blur': 'feature.blur.title',
  '/meme': 'feature.meme.title',
  '/compare': 'feature.compare.title',
  '/beautifier': 'feature.beautifier.title',
  '/ocr': 'feature.ocr.title',
  '/annotate': 'feature.annotate.title',
  '/upscale': 'feature.upscale.title',
  '/ai-generator': 'feature.aiGen.title',
  '/privacy': 'privacy.title',
  '/about': 'about.title',
};

export function TopBar() {
  const location = useLocation();
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const isHome = location.pathname === '/';
  const currentLabel = routeLabels[location.pathname];

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 bg-card rounded-2xl border border-border/50 shadow-sm px-4 flex-shrink-0">
      <SidebarTrigger className="bg-background shadow-sm border border-border/50 text-foreground hover:bg-primary hover:text-white flex-shrink-0 h-9 w-9 rounded-lg transition-colors" />
      <div className="h-5 w-px bg-border/80 flex-shrink-0 hidden sm:block" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0 overflow-hidden flex-1">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">GambarYuk</span>
        </Link>

        {!isHome && currentLabel && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
            <span className="text-foreground font-semibold truncate">
              {t(currentLabel)}
            </span>
          </>
        )}

        {isHome && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 sm:hidden" />
            <span className="text-foreground font-semibold sm:hidden">{t('nav.home')}</span>
          </>
        )}
      </nav>

      {/* Support Us Button */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center gap-1.5 bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/30 hover:bg-sidebar-primary/20 hover:text-sidebar-primary dark:bg-sidebar-primary/10 dark:text-sidebar-primary/90 dark:border-sidebar-primary/20 dark:hover:bg-sidebar-primary/20 dark:hover:text-sidebar-primary flex-shrink-0 mr-1 transition-all"
      >
        <a href="#" target="_blank" rel="noopener noreferrer">
          <Coffee className="h-4 w-4" />
          <span className="hidden sm:inline font-bold">
            {language === 'id' ? 'Traktir Kopi' : 'Buy me a Coffee'}
          </span>
        </a>
      </Button>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/10 flex-shrink-0"
      >
        {theme === 'light' ? (
          <>
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Dark</span>
          </>
        ) : (
          <>
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Light</span>
          </>
        )}
      </Button>
    </header>
  );
}
