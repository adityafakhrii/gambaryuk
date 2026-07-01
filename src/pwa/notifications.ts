// PWA Push Notification Service (Architecture Ready)

// Helper to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PwaNotificationService = {
  // Check if push notifications are supported by the browser
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'serviceWorker' in navigator && 
           'PushManager' in window &&
           'Notification' in window;
  },

  // Get current permission status
  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  // Request notification permissions from user
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  },

  // Subscribe user to Push Notifications
  async subscribeUser(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription first
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('User already subscribed to push notifications');
        return subscription;
      }

      // Convert VAPID key
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      console.log('Successfully subscribed user to push notifications:', subscription);
      
      // Return subscription object (should be saved to supabase/backend in the future)
      return subscription;
    } catch (err) {
      console.error('Failed to subscribe user to push notifications:', err);
      return null;
    }
  },

  // Unsubscribe user
  async unsubscribeUser(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const successful = await subscription.unsubscribe();
        console.log('Successfully unsubscribed user:', successful);
        return successful;
      }
      return false;
    } catch (err) {
      console.error('Error unsubscribing user:', err);
      return false;
    }
  },

  // Trigger a local notification (useful for confirmation/offline messages)
  async showLocalNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!this.isSupported() || this.getPermission() !== 'granted') return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        ...options
      } as any);
      return true;
    } catch (err) {
      console.error('Failed to show local notification:', err);
      return false;
    }
  }
};
