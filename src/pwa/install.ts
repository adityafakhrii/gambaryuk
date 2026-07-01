// PWA Installation Manager

export type DisplayMode = 'browser' | 'standalone' | 'installed-app';

let deferredPrompt: any = null;
const listeners = new Set<(prompt: any) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Notify listeners
    listeners.forEach((listener) => listener(deferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    console.log('GambarYuk was successfully installed!');
    deferredPrompt = null;
    listeners.forEach((listener) => listener(null));
    try {
      localStorage.setItem('pwa-installed-time', new Date().toISOString());
    } catch (e) {}
  });
}

export const PwaInstallManager = {
  // Subscribe to install prompt changes
  subscribe(callback: (prompt: any) => void) {
    listeners.add(callback);
    // Call immediately with current prompt state
    callback(deferredPrompt);
    return () => {
      listeners.delete(callback);
    };
  },

  // Get current deferred prompt
  getPrompt() {
    return deferredPrompt;
  },

  // Clear prompt
  clearPrompt() {
    deferredPrompt = null;
    listeners.forEach((listener) => listener(null));
  },

  // Trigger PWA installation
  async install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt) {
      console.warn('PWA install prompt is not available.');
      return 'unavailable';
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        deferredPrompt = null;
        listeners.forEach((listener) => listener(null));
      }
      return outcome;
    } catch (err) {
      console.error('Error during PWA installation:', err);
      return 'unavailable';
    }
  },

  // Detect current Display Mode
  getDisplayMode(): DisplayMode {
    if (typeof window === 'undefined') return 'browser';
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         ('standalone' in window.navigator && (window.navigator as any).standalone === true);
    
    if (isStandalone) {
      return 'standalone';
    }

    // Check if the site was launched from home screen (via start_url param)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('source') === 'pwa' || localStorage.getItem('pwa-installed-time')) {
      return 'installed-app';
    }

    return 'browser';
  }
};
