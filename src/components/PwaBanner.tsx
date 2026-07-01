import React, { useState, useEffect } from 'react';
import { usePwa } from '@/pwa/PwaContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, RefreshCw, X, Sparkles, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

export function PwaBanner() {
  const {
    isOnline,
    displayMode,
    isInstallable,
    isInstalled,
    updateAvailable,
    installApp,
    performUpdate,
  } = usePwa();

  const { language } = useLanguage();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [lastDismissedTime, setLastDismissedTime] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('pwa-install-dismissed-time');
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  });

  const isId = language === 'id';

  useEffect(() => {
    if (!isInstallable || isInstalled) {
      setShowInstallBanner(false);
      return;
    }

    const checkVisibility = () => {
      const now = Date.now();
      const timeSinceDismiss = now - lastDismissedTime;
      const oneMinute = 60 * 1000;

      if (lastDismissedTime === 0 || timeSinceDismiss >= oneMinute) {
        setShowInstallBanner(true);
      } else {
        setShowInstallBanner(false);
      }
    };

    // Auto check after a short delay
    const initialTimer = setTimeout(() => {
      checkVisibility();
    }, 3000);

    // Periodic check to capture when 1 minute expires
    const interval = setInterval(() => {
      checkVisibility();
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isInstallable, isInstalled, lastDismissedTime]);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateBanner(true);
    }
  }, [updateAvailable]);

  const handleDismissInstall = () => {
    const now = Date.now();
    setLastDismissedTime(now);
    try {
      localStorage.setItem('pwa-install-dismissed-time', now.toString());
    } catch {}
    setShowInstallBanner(false);
  };

  const handleDismissUpdate = () => {
    setShowUpdateBanner(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-[calc(100%-2rem)] sm:w-[360px]">
      <AnimatePresence>
        {/* 1. UPDATE BANNER (Highest Priority) */}
        {showUpdateBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto"
          >
            <Card className="border border-primary/40 shadow-xl bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/85 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-600" />
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground">
                      {isId ? 'Pembaruan Tersedia' : 'Update Available'}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-normal">
                      {isId
                        ? 'Versi baru GambarYuk telah dirilis. Perbarui untuk mendapatkan fitur & stabilitas terbaru.'
                        : 'A new version of GambarYuk is available. Update now to get the latest features and fixes.'}
                    </p>
                  </div>
                  <button
                    onClick={handleDismissUpdate}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 rounded-lg shrink-0 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={performUpdate}
                    className="flex-1 text-xs h-9 bg-primary hover:bg-primary/90 font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    {isId ? 'Perbarui Sekarang' : 'Update Now'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDismissUpdate}
                    className="text-xs h-9 font-medium"
                  >
                    {isId ? 'Nanti' : 'Later'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 2. INSTALL BANNER */}
        {showInstallBanner && !showUpdateBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto"
          >
            <Card className="border border-border shadow-xl bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/85 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 pointer-events-none" />
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-foreground">
                        {isId ? 'Pasang GambarYuk' : 'Install GambarYuk'}
                      </h4>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        PWA
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-normal">
                      {isId
                        ? 'Jalankan GambarYuk langsung dari layar utama Anda untuk proses cepat dan akses offline.'
                        : 'Launch GambarYuk directly from your home screen for quick, offline-capable image editing.'}
                    </p>
                  </div>
                  <button
                    onClick={handleDismissInstall}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 rounded-lg shrink-0 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={installApp}
                    className="flex-1 text-xs h-9 bg-primary hover:bg-primary/90 font-bold"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    {isId ? 'Instal Aplikasi' : 'Install App'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDismissInstall}
                    className="text-xs h-9 font-medium"
                  >
                    {isId ? 'Nanti' : 'Later'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
