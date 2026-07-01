// PWA Updates Manager

export const PwaUpdateManager = {
  // Checks for service worker updates manually
  async checkForUpdates(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          return true;
        }
      } catch (err) {
        console.error('Failed to check for PWA updates:', err);
      }
    }
    return false;
  },

  // Set up periodic background update checking (e.g. every hour)
  startPeriodicChecks(intervalMs = 60 * 60 * 1000) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return () => {};

    // Initial check after loading
    const timer = setTimeout(() => {
      this.checkForUpdates();
    }, 5000);

    const interval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }
};
