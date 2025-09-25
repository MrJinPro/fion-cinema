import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Download, X } from 'lucide-react';
import { Card, CardContent } from './card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if user previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed === 'true') {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-sm z-50 bg-card/95 backdrop-blur-sm border-accent">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Download className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              {t('installApp')}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Установите FiOn Cinema для быстрого доступа
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstall}
                className="flex-1 text-xs"
              >
                Установить
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}