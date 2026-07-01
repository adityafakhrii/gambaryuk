// PWA Background Sync Manager

export const PwaBackgroundSync = {
  // Check if Background Sync is supported by the browser
  isSupported(): boolean {
    return typeof window !== 'undefined' &&
           'serviceWorker' in navigator &&
           'SyncManager' in window;
  },

  // Register a background sync tag
  async registerSyncTag(tag: string): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Background Sync is not supported in this browser. Falling back to immediate execution.');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      console.log(`Background Sync tag registered: ${tag}`);
      return true;
    } catch (err) {
      console.error(`Failed to register Background Sync tag "${tag}":`, err);
      return false;
    }
  },

  // Queue a request dynamically to IndexedDB or localStorage for background sync
  queueOfflineRequest(key: string, data: any): void {
    try {
      const queue = JSON.parse(localStorage.getItem('offline-sync-queue') || '[]');
      queue.push({
        key,
        data,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('offline-sync-queue', JSON.stringify(queue));
      
      // Register sync tag
      this.registerSyncTag('offline-form-sync');
    } catch (err) {
      console.error('Failed to queue offline request:', err);
    }
  },

  // Process queued requests (to be called when coming back online as a fallback)
  async processOfflineQueue(processFn: (key: string, data: any) => Promise<boolean>): Promise<void> {
    try {
      const queueStr = localStorage.getItem('offline-sync-queue');
      if (!queueStr) return;

      const queue = JSON.parse(queueStr);
      if (queue.length === 0) return;

      console.log(`Processing offline queue containing ${queue.length} items...`);
      const remainingItems = [];

      for (const item of queue) {
        try {
          const success = await processFn(item.key, item.data);
          if (!success) {
            remainingItems.push(item);
          }
        } catch (err) {
          console.error(`Error processing sync item "${item.key}":`, err);
          remainingItems.push(item);
        }
      }

      if (remainingItems.length > 0) {
        localStorage.setItem('offline-sync-queue', JSON.stringify(remainingItems));
      } else {
        localStorage.removeItem('offline-sync-queue');
        console.log('All offline items synced successfully.');
      }
    } catch (err) {
      console.error('Error processing offline queue:', err);
    }
  }
};
