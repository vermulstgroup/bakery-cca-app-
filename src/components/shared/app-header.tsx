"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOnboarding } from '@/hooks/use-onboarding';
import { BAKERIES } from '@/lib/data';

export function AppHeader() {
  const { data: onboardingData } = useOnboarding();
  const [isOnline, setIsOnline] = useState(true);
  const [selectedBakery, setSelectedBakery] = useState(onboardingData.bakery || BAKERIES[0].id);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentBakery = BAKERIES.find(b => b.id === selectedBakery)?.name || 'Select Bakery';

  return (
    <header className="sticky top-0 z-40 h-14 bg-card/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto flex h-full max-w-4xl items-center justify-between px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-lg font-bold">
              {currentBakery}
              <ChevronDown className="ml-1 h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {BAKERIES.map(bakery => (
              <DropdownMenuItem key={bakery.id} onSelect={() => setSelectedBakery(bakery.id)}>
                {bakery.name}
                {selectedBakery === bakery.id && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-success' : 'bg-destructive'}`} />
          <span className="text-sm text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
}
