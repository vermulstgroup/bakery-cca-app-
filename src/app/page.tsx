"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BakeryIcon } from '@/components/shared/icons';

export default function InitialRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This check runs only on the client
    if (typeof window !== 'undefined') {
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      if (onboardingComplete) {
        router.replace('/dashboard'); 
      } else {
        router.replace('/welcome');
      }
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <BakeryIcon className="h-16 w-16 text-primary" />
        <p className="text-muted-foreground">Loading Bakery App...</p>
      </div>
    </div>
  );
}
