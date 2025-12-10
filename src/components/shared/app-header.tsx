
"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOnboarding } from '@/hooks/use-onboarding';
import { BAKERIES } from '@/lib/data';
import { useTranslation } from '@/hooks/use-translation';
import { LANGUAGES } from '@/lib/data';

export function AppHeader() {
  const { data: onboardingData, updateData } = useOnboarding();
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { language, setLanguage, t } = useTranslation();
  const selectedBakery = onboardingData.bakery || BAKERIES[0].id;
  const currentBakeryName = BAKERIES.find(b => b.id === selectedBakery)?.name || t('select_bakery');
  console.log('Dashboard bakery:', selectedBakery);


  const handleBakeryChange = (bakeryId: string) => {
    updateData({ bakery: bakeryId });
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-card/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto flex h-full max-w-4xl items-center justify-between px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-lg font-bold">
              {currentBakeryName}
              <ChevronDown className="ml-1 h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {BAKERIES.map(bakery => (
              <DropdownMenuItem key={bakery.id} onSelect={() => handleBakeryChange(bakery.id)}>
                {bakery.name}
                {selectedBakery === bakery.id && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-4">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem key={lang.code} onSelect={() => setLanguage(lang.code)}>
                  {lang.name}
                  {language === lang.code && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-success' : 'bg-destructive'}`} />
            <span className="text-sm text-muted-foreground">{isOnline ? t('online') : t('offline')}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
