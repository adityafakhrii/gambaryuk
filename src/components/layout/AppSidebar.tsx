import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import logoImg from '@/assets/logo.webp';
import {
  Maximize2, FileDown, RefreshCw, Crop, RotateCcw, Stamp,
  Eraser, Palette, FileText, LayoutGrid, Home, Globe,
  Shield, ChevronDown, ChevronRight, Link as LinkIcon,
  Info, Pipette, Binary, QrCode, Image as ImageIcon,
  Grid3X3, EyeOff, Type, ArrowLeftRight, Sparkles,
  ScanText, PenTool, Wand2, BrainCircuit, Heart, Scissors,
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
import { useState } from 'react';

const toolGroups = [
  {
    key: 'category.essential',
    tools: [
      { path: '/resize', icon: Maximize2, key: 'nav.resize', descKey: 'feature.resize.desc' },
      { path: '/compress', icon: FileDown, key: 'nav.compress', descKey: 'feature.compress.desc' },
      { path: '/convert', icon: RefreshCw, key: 'nav.convert', descKey: 'feature.convert.desc' },
    ],
  },
  {
    key: 'category.edit',
    tools: [
      { path: '/crop', icon: Crop, key: 'nav.crop', descKey: 'feature.crop.desc' },
      { path: '/rotate', icon: RotateCcw, key: 'nav.rotate', descKey: 'feature.rotate.desc' },
      { path: '/watermark', icon: Stamp, key: 'nav.watermark', descKey: 'feature.watermark.desc' },
      { path: '/remove-watermark', icon: Scissors, key: 'nav.removeWatermark', descKey: 'feature.removeWatermark.desc' },
    ],
  },
  {
    key: 'category.advanced',
    tools: [
      { path: '/remove-bg', icon: Eraser, key: 'nav.removeBg', descKey: 'feature.removeBg.desc' },
      { path: '/filters', icon: Palette, key: 'nav.filters', descKey: 'feature.filters.desc' },
      { path: '/rename', icon: FileText, key: 'nav.rename', descKey: 'feature.rename.desc' },
      { path: '/collage', icon: LayoutGrid, key: 'nav.collage', descKey: 'feature.collage.desc' },
      { path: '/image-to-link', icon: LinkIcon, key: 'nav.imageToLink', descKey: 'feature.imageToLink.desc' },
    ],
  },
  {
    key: 'category.generate',
    tools: [
      { path: '/splitter', icon: Grid3X3, key: 'nav.splitter', descKey: 'feature.splitter.desc' },
      { path: '/blur', icon: EyeOff, key: 'nav.blur', descKey: 'feature.blur.desc' },
      { path: '/meme', icon: Type, key: 'nav.meme', descKey: 'feature.meme.desc' },
      { path: '/compare', icon: ArrowLeftRight, key: 'nav.compare', descKey: 'feature.compare.desc' },
      { path: '/beautifier', icon: Sparkles, key: 'nav.beautifier', descKey: 'feature.beautifier.desc' },
    ],
  },
  {
    key: 'category.utility',
    tools: [
      { path: '/metadata', icon: Info, key: 'nav.metadata', descKey: 'feature.metadata.desc' },
      { path: '/color-picker', icon: Pipette, key: 'nav.colorPicker', descKey: 'feature.colorPicker.desc' },
      { path: '/base64', icon: Binary, key: 'nav.base64', descKey: 'feature.base64.desc' },
      { path: '/qr-code', icon: QrCode, key: 'nav.qrCode', descKey: 'feature.qrCode.desc' },
      { path: '/favicon', icon: ImageIcon, key: 'nav.favicon', descKey: 'feature.favicon.desc' },
    ],
  },
  {
    key: 'category.ai',
    tools: [
      { path: '/ocr', icon: ScanText, key: 'nav.ocr', descKey: 'feature.ocr.desc' },
      { path: '/annotate', icon: PenTool, key: 'nav.annotate', descKey: 'feature.annotate.desc' },
      { path: '/upscale', icon: Wand2, key: 'nav.upscale', descKey: 'feature.upscale.desc' },
      { path: '/ai-generator', icon: BrainCircuit, key: 'nav.aiGen', descKey: 'feature.aiGen.desc' },
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
    <Sidebar variant="floating" collapsible="icon" className="border-none">
      {/* Header */}
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <img src={logoImg} alt="GambarYuk" className="flex-shrink-0 h-8 w-8 object-contain" />
          {!isCollapsed && (
            <span className="font-bold text-sidebar-foreground text-base truncate">
              GambarYuk
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 group-data-[collapsible=icon]:px-0">
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
                className="cursor-pointer flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors select-none"
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
                        tooltip={`${t(tool.key)} — ${t(tool.descKey)}`}
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
      <SidebarFooter className="px-2 py-3 space-y-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === '/about'}
              tooltip={t('nav.about')}
            >
              <Link to="/about" className="flex items-center gap-2 text-sidebar-foreground/70">
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
              <Link to="/privacy" className="flex items-center gap-2 text-sidebar-foreground/70">
                <Shield className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-xs">{t('nav.privacyPolicy')}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={language === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-xs">
                  {language === 'id' ? '🇮🇩 Indonesia' : '🇺🇸 English'}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
