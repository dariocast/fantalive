import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    // OS detection
    const ua = navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroidDevice = /Android/.test(ua);

    setIsIos(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed banner recently (within 2 days)
      const lastDismissed = localStorage.getItem('fantalive_pwa_banner_dismissed');
      const now = Date.now();
      if (!lastDismissed || now - parseInt(lastDismissed, 10) > 2 * 24 * 60 * 60 * 1000) {
        // Show subtle banner after 3 seconds on first visits if not standalone
        if (!isStandalone) {
          const timer = setTimeout(() => {
            setIsBannerVisible(true);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsBannerVisible(false);
      setIsModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error('PWA prompt error:', err);
      }
    } else {
      // Open our rich educational modal
      setIsModalOpen(true);
    }
  }, [deferredPrompt]);

  const openInstallModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeInstallModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const dismissBanner = useCallback(() => {
    setIsBannerVisible(false);
    localStorage.setItem('fantalive_pwa_banner_dismissed', Date.now().toString());
  }, []);

  return {
    canInstall: !!deferredPrompt,
    isStandalone,
    isInstalled,
    isIos,
    isAndroid,
    isModalOpen,
    isBannerVisible,
    promptInstall,
    openInstallModal,
    closeInstallModal,
    dismissBanner,
  };
}
