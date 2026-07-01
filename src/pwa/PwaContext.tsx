import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { PwaInstallManager, DisplayMode } from './install';
import { PwaUpdateManager } from './updates';
import { PwaStorageManager, StorageEstimateResult } from './storage';
import { PwaBackgroundSync } from './background-sync';
import { toast } from 'sonner';

interface PwaContextType {
  isOnline: boolean;
  displayMode: DisplayMode;
  isInstallable: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  offlineReady: boolean;
  storageEstimate: StorageEstimateResult | null;
  installApp: () => Promise<void>;
  performUpdate: () => void;
  clearCache: () => Promise<boolean>;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(PwaInstallManager.getDisplayMode());
  const [isInstallable, setIsInstallable] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimateResult | null>(null);

  // Integrate Vite's PWA Service Worker hook
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registered successfully:', r);
      // Start checking for updates in background
      PwaUpdateManager.startPeriodicChecks();
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  // Track online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(
        localStorage.getItem('language') === 'en' 
          ? 'Back online! Reconnected to GambarYuk.' 
          : 'Kembali online! Terhubung ke GambarYuk.',
        { id: 'connection-status' }
      );
      
      // Attempt background sync queue processing
      PwaBackgroundSync.processOfflineQueue(async (key, data) => {
        console.log(`Processing offline sync for: ${key}`, data);
        return true;
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning(
        localStorage.getItem('language') === 'en'
          ? 'You are offline. Standard tools are still functional.'
          : 'Koneksi terputus. Alat editor offline masih bisa digunakan.',
        { id: 'connection-status', duration: Infinity }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to PWA Installability events
  useEffect(() => {
    const unsubscribe = PwaInstallManager.subscribe((prompt) => {
      setIsInstallable(!!prompt);
    });

    // Detect display mode on mount and periodically
    setDisplayMode(PwaInstallManager.getDisplayMode());

    // Get storage estimate
    if (PwaStorageManager.isSupported()) {
      PwaStorageManager.getStorageEstimate().then(setStorageEstimate);
    }

    return unsubscribe;
  }, []);

  const installApp = async () => {
    const outcome = await PwaInstallManager.install();
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDisplayMode('standalone');
      toast.success(
        localStorage.getItem('language') === 'en'
          ? 'Thank you for installing GambarYuk!'
          : 'Terima kasih telah menginstal GambarYuk!'
      );
    } else if (outcome === 'dismissed') {
      toast.info(
        localStorage.getItem('language') === 'en'
          ? 'Installation dismissed.'
          : 'Instalasi dibatalkan.'
      );
    }
  };

  const performUpdate = () => {
    updateServiceWorker(true);
  };

  const clearCache = async () => {
    const cleared = await PwaStorageManager.clearAllCachesComplete();
    if (cleared) {
      if (PwaStorageManager.isSupported()) {
        PwaStorageManager.getStorageEstimate().then(setStorageEstimate);
      }
      toast.success(
        localStorage.getItem('language') === 'en'
          ? 'Cache cleared successfully!'
          : 'Cache berhasil dibersihkan!'
      );
    }
    return cleared;
  };

  const isInstalled = displayMode === 'standalone' || displayMode === 'installed-app';

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        displayMode,
        isInstallable,
        isInstalled,
        updateAvailable: needRefresh,
        offlineReady,
        storageEstimate,
        installApp,
        performUpdate,
        clearCache,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
}
