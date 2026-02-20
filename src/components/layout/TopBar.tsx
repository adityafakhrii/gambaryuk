import { Link, useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  '/privacy': 'privacy.title',
};

export function TopBar() {
  const location = useLocation();
  const { t } = useLanguage();

  const isHome = location.pathname === '/';
  const currentLabel = routeLabels[location.pathname];

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-border/50 bg-background/80 backdrop-blur-md px-3">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground flex-shrink-0" />
      <div className="h-4 w-px bg-border/70 flex-shrink-0" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm min-w-0 overflow-hidden">
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
    </header>
  );
}
