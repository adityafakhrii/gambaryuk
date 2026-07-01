// PWA Storage & Cache Manager

export interface StorageEstimateResult {
  usage: number; // in bytes
  quota: number; // in bytes
  percentage: number;
}

export const PwaStorageManager = {
  // Check if Storage Estimation is supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'storage' in navigator && 
           'estimate' in navigator.storage;
  },

  // Query storage quota and usage estimates
  async getStorageEstimate(): Promise<StorageEstimateResult | null> {
    if (!this.isSupported()) return null;

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1; // avoid division by zero
      const percentage = Math.round((usage / quota) * 100);

      return {
        usage,
        quota,
        percentage
      };
    } catch (err) {
      console.error('Failed to estimate storage usage:', err);
      return null;
    }
  },

  // Format byte size to human readable string
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // Clean old/unused cache resources
  async clearAllOldCaches(keepCacheNames: string[] = []): Promise<string[]> {
    if (typeof window === 'undefined' || !('caches' in window)) return [];

    try {
      const keys = await window.caches.keys();
      const deletedKeys: string[] = [];
      
      await Promise.all(
        keys.map(async (key) => {
          // If this key is not in the keep list, delete it
          const shouldDelete = keepCacheNames.length > 0 
            ? !keepCacheNames.some(keep => key.includes(keep))
            : false;

          if (shouldDelete) {
            const success = await window.caches.delete(key);
            if (success) {
              deletedKeys.push(key);
              console.log(`Deleted old cache: ${key}`);
            }
          }
        })
      );
      return deletedKeys;
    } catch (err) {
      console.error('Failed to clear old caches:', err);
      return [];
    }
  },

  // Clear all caches completely (useful for factory resets / troubleshooting)
  async clearAllCachesComplete(): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) return false;

    try {
      const keys = await window.caches.keys();
      await Promise.all(keys.map(key => window.caches.delete(key)));
      console.log('All caches cleared completely.');
      return true;
    } catch (err) {
      console.error('Failed to clear all caches:', err);
      return false;
    }
  }
};
