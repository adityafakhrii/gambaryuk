import { Link, useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChevronRight, Home, Sun, Moon } from 'lucide-react';
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
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const isHome = location.pathname === '/';
  const currentLabel = routeLabels[location.pathname];

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-border/50 bg-background/80 backdrop-blur-md px-3">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground flex-shrink-0" />
      <div className="h-4 w-px bg-border/70 flex-shrink-0" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm min-w-0 overflow-hidden flex-1">
        <Link
          to="/"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">GambarYuk</span>
        </Link>

        {!isHome && currentLabel && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
            <span className="text-foreground font-medium truncate">
              {t(currentLabel)}
            </span>
          </>
        )}

        {isHome && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0 sm:hidden" />
            <span className="text-foreground font-medium sm:hidden">Beranda</span>
          </>
        )}
      </nav>

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
