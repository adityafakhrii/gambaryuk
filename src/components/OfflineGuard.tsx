import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineGuardProps {
  children: React.ReactNode;
  featureNameKey?: string; // Optional specific feature name localization key
}

export function OfflineGuard({ children, featureNameKey }: OfflineGuardProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t, language } = useLanguage();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCheckConnection = async () => {
    try {
      // Try to fetch a small asset to confirm actual internet access
      const res = await fetch('/logo.webp', { method: 'HEAD', cache: 'no-store' });
      if (res.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    }
  };

  if (isOnline) {
    return <>{children}</>;
  }

  const isId = language === 'id';

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center bg-card/40 border border-border/50 rounded-2xl backdrop-blur-sm animate-in fade-in-50 zoom-in-95 duration-300">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 text-destructive mb-6">
        <WifiOff className="w-8 h-8 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive"></span>
        </span>
      </div>

      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
        {isId ? 'Fitur Membutuhkan Internet' : 'Internet Connection Required'}
      </h3>
      
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed mb-6">
        {featureNameKey ? (
          isId 
            ? `Alat "${t(featureNameKey)}" menggunakan teknologi server-side AI dan memerlukan koneksi internet untuk bekerja. Harap periksa koneksi Anda.`
            : `The "${t(featureNameKey)}" tool relies on server-side AI processing and requires an active internet connection to work. Please check your connection.`
        ) : (
          isId
            ? 'Alat ini memerlukan koneksi internet aktif untuk memproses data. Alat pemrosesan lokal (seperti Kompres, Ubah Ukuran, dan Potong) tetap dapat berjalan offline.'
            : 'This tool requires an active internet connection to process. Standard offline tools (like Compress, Resize, and Crop) remain fully functional offline.'
        )}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button 
          onClick={handleCheckConnection}
          className="w-full flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {isId ? 'Periksa Koneksi' : 'Check Connection'}
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/40">
        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
        <span>{isId ? 'Gambar Anda tetap aman di browser' : 'Your images remain safe in your browser'}</span>
      </div>
    </div>
  );
}
