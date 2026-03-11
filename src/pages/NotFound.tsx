import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileDown, RefreshCw, Eraser, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const popularTools = [
  { path: '/compress', icon: FileDown, key: 'nav.compress' },
  { path: '/convert', icon: RefreshCw, key: 'nav.convert' },
  { path: '/remove-bg', icon: Eraser, key: 'nav.removeBg' },
];

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center space-y-8">
        {/* 404 Header */}
        <div className="flex justify-center mb-6">
          <div className="text-[10rem] font-black leading-none text-primary/10 select-none tracking-tighter">
            404
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {t('notFound.title')}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('notFound.description')}
          </p>
        </div>

        {/* Back Home Button */}
        <Button asChild size="lg" className="rounded-xl">
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('notFound.backHome')}
          </Link>
        </Button>

        {/* Popular Tools */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3">
            {t('notFound.popularTools')}
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {popularTools.map((tool) => (
              <Button key={tool.path} asChild variant="outline" size="sm" className="rounded-xl gap-1.5">
                <Link to={tool.path}>
                  <tool.icon className="h-3.5 w-3.5" />
                  {t(tool.key)}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
