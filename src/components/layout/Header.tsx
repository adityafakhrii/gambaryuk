import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Globe, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toolGroups = [
    {
      label: 'category.essential',
      tools: [
        { path: '/resize', label: 'nav.resize' },
        { path: '/compress', label: 'nav.compress' },
        { path: '/convert', label: 'nav.convert' },
      ],
    },
    {
      label: 'category.edit',
      tools: [
        { path: '/crop', label: 'nav.crop' },
        { path: '/rotate', label: 'nav.rotate' },
        { path: '/watermark', label: 'nav.watermark' },
      ],
    },
    {
      label: 'category.advanced',
      tools: [
        { path: '/remove-bg', label: 'nav.removeBg' },
        { path: '/filters', label: 'nav.filters' },
        { path: '/rename', label: 'nav.rename' },
        { path: '/collage', label: 'nav.collage' },
      ],
    },
  ];

  const allTools = toolGroups.flatMap((group) => group.tools);
  const isToolActive = allTools.some((tool) => tool.path === location.pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            GY
          </div>
          <span className="hidden font-semibold text-foreground sm:inline-block">
            GambarYuk
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {t('nav.home')}
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`gap-1 ${
                  isToolActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('nav.tools')}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {toolGroups.map((group, groupIndex) => (
                <div key={group.label}>
                  {groupIndex > 0 && <DropdownMenuSeparator />}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {t(group.label)}
                  </div>
                  {group.tools.map((tool) => (
                    <DropdownMenuItem key={tool.path} asChild>
                      <Link
                        to={tool.path}
                        className={
                          location.pathname === tool.path
                            ? 'bg-muted font-medium'
                            : ''
                        }
                      >
                        {t(tool.label)}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-muted' : ''}
              >
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('id')}
                className={language === 'id' ? 'bg-muted' : ''}
              >
                🇮🇩 Indonesia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {t('nav.home')}
                </Link>
                
                {toolGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">
                      {t(group.label)}
                    </div>
                    {group.tools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === tool.path
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {t(tool.label)}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}