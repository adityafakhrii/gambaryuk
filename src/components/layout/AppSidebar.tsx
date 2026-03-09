import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import logoImg from '@/assets/logo.png';
import {
  Maximize2, FileDown, RefreshCw, Crop, RotateCcw, Stamp,
  Eraser, Palette, FileText, LayoutGrid, Home, Sun, Moon, Globe,
  Shield, ChevronDown, ChevronRight, Link as LinkIcon,
  Info, Pipette, Binary, QrCode, Image as ImageIcon,
  Grid3X3, EyeOff, Type, ArrowLeftRight, Sparkles,
  ScanText, PenTool, Wand2, BrainCircuit,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const toolGroups = [
  {
    key: 'category.essential',
    tools: [
      { path: '/resize', icon: Maximize2, key: 'nav.resize' },
      { path: '/compress', icon: FileDown, key: 'nav.compress' },
      { path: '/convert', icon: RefreshCw, key: 'nav.convert' },
    ],
  },
  {
    key: 'category.edit',
    tools: [
      { path: '/crop', icon: Crop, key: 'nav.crop' },
      { path: '/rotate', icon: RotateCcw, key: 'nav.rotate' },
      { path: '/watermark', icon: Stamp, key: 'nav.watermark' },
    ],
  },
  {
    key: 'category.advanced',
    tools: [
      { path: '/remove-bg', icon: Eraser, key: 'nav.removeBg' },
      { path: '/filters', icon: Palette, key: 'nav.filters' },
      { path: '/rename', icon: FileText, key: 'nav.rename' },
      { path: '/collage', icon: LayoutGrid, key: 'nav.collage' },
      { path: '/image-to-link', icon: LinkIcon, key: 'nav.imageToLink' },
    ],
  },
  {
    key: 'category.generate',
    tools: [
      { path: '/splitter', icon: Grid3X3, key: 'nav.splitter' },
      { path: '/blur', icon: EyeOff, key: 'nav.blur' },
      { path: '/meme', icon: Type, key: 'nav.meme' },
      { path: '/compare', icon: ArrowLeftRight, key: 'nav.compare' },
      { path: '/beautifier', icon: Sparkles, key: 'nav.beautifier' },
    ],
  },
  {
    key: 'category.utility',
    tools: [
      { path: '/metadata', icon: Info, key: 'nav.metadata' },
      { path: '/color-picker', icon: Pipette, key: 'nav.colorPicker' },
      { path: '/base64', icon: Binary, key: 'nav.base64' },
      { path: '/qr-code', icon: QrCode, key: 'nav.qrCode' },
      { path: '/favicon', icon: ImageIcon, key: 'nav.favicon' },
    ],
  },
  {
    key: 'category.ai',
    tools: [
      { path: '/ocr', icon: ScanText, key: 'nav.ocr' },
      { path: '/annotate', icon: PenTool, key: 'nav.annotate' },
      { path: '/upscale', icon: Wand2, key: 'nav.upscale' },
      { path: '/ai-generator', icon: BrainCircuit, key: 'nav.aiGen' },
    ],
  },
];

export function AppSidebar() {
  const { t, language, setLanguage } = useLanguage();
  
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'category.essential': true,
    'category.edit': true,
    'category.advanced': true,
    'category.generate': true,
    'category.utility': true,
    'category.ai': true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      {/* Header */}
      <SidebarHeader className="border-b border-border/50 px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <img src={logoImg} alt="GambarYuk" className="flex-shrink-0 h-8 w-8 rounded-lg object-contain" />
          {!isCollapsed && (
            <span className="font-bold text-sidebar-foreground text-base truncate">
              GambarYuk
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {/* Home */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === '/'}
              tooltip={t('nav.home')}
            >
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{t('nav.home')}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        {/* Tool Groups */}
        {toolGroups.map((group) => (
          <SidebarGroup key={group.key} className="p-0 mb-1">
            {!isCollapsed && (
              <SidebarGroupLabel
                onClick={() => toggleGroup(group.key)}
                className="cursor-pointer flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none"
              >
                <span>{t(group.key)}</span>
                {openGroups[group.key] ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </SidebarGroupLabel>
            )}
            {(isCollapsed || openGroups[group.key]) && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.tools.map((tool) => (
                    <SidebarMenuItem key={tool.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === tool.path}
                        tooltip={t(tool.key)}
                      >
                        <Link to={tool.path} className="flex items-center gap-2">
                          <tool.icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && <span className="truncate">{t(tool.key)}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border/50 px-2 py-3 space-y-1">
        {/* About & Privacy */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === '/about'}
              tooltip={t('nav.about')}
            >
              <Link to="/about" className="flex items-center gap-2 text-muted-foreground">
                <Info className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-xs">{t('nav.about')}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === '/privacy'}
              tooltip="Privacy Policy"
            >
              <Link to="/privacy" className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-xs">Privacy Policy</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-1" />

        {/* Language switcher as text menu */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip={language === 'id' ? 'Ganti Bahasa' : 'Change Language'}>
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-xs">
                      {language === 'id' ? 'Bahasa: Indonesia' : 'Language: English'}
                    </span>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
