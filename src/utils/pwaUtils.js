// Register Service Worker
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};

// Check if app is installed
export const isPWAInstalled = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

// Install prompt
let deferredPrompt = null;

export const setupInstallPrompt = (onInstallPrompt) => {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (onInstallPrompt) {
      onInstallPrompt(true);
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (onInstallPrompt) {
      onInstallPrompt(false);
    }
  });
};

export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === "accepted";
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("Notifications not supported");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// Show notification
export const showNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          vibrate: [200, 100, 200],
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: "/pwa-192x192.png",
        ...options,
      });
    }
  }
};

// Check if online
export const isOnline = () => navigator.onLine;

// Network status listeners
export const onNetworkStatusChange = (callback) => {
  window.addEventListener("online", () => callback(true));
  window.addEventListener("offline", () => callback(false));
};
