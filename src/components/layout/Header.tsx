 import { Link, useLocation } from 'react-router-dom';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useTheme } from '@/contexts/ThemeContext';
 import { Sun, Moon, Globe } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 export function Header() {
   const { language, setLanguage, t } = useLanguage();
   const { theme, toggleTheme } = useTheme();
   const location = useLocation();
 
   const navItems = [
     { path: '/', label: 'nav.home' },
     { path: '/resize', label: 'nav.resize' },
     { path: '/compress', label: 'nav.compress' },
     { path: '/convert', label: 'nav.convert' },
   ];
 
   return (
     <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
       <div className="container flex h-16 items-center justify-between px-4">
         <Link to="/" className="flex items-center gap-2">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
             IM
           </div>
           <span className="hidden font-semibold text-foreground sm:inline-block">
             ImageUtils
           </span>
         </Link>
 
         <nav className="hidden md:flex items-center gap-1">
           {navItems.map((item) => (
             <Link
               key={item.path}
               to={item.path}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                 location.pathname === item.path
                   ? 'bg-primary text-primary-foreground'
                   : 'text-muted-foreground hover:text-foreground hover:bg-muted'
               }`}
             >
               {t(item.label)}
             </Link>
           ))}
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
         </div>
       </div>
 
       {/* Mobile Navigation */}
       <nav className="md:hidden flex items-center justify-center gap-1 pb-3 px-4 overflow-x-auto">
         {navItems.map((item) => (
           <Link
             key={item.path}
             to={item.path}
             className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
               location.pathname === item.path
                 ? 'bg-primary text-primary-foreground'
                 : 'text-muted-foreground hover:text-foreground bg-muted'
             }`}
           >
             {t(item.label)}
           </Link>
         ))}
       </nav>
     </header>
   );
 }