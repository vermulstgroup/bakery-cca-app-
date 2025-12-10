"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BakeryIcon } from '@/components/shared/icons';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/select-bakery');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGetStarted = () => {
    router.push('/select-bakery');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
       <div className="w-full max-w-md profit-card-gradient rounded-3xl p-1">
        <Card className="rounded-3xl border-0 bg-card/80 backdrop-blur-lg">
          <CardContent className="flex flex-col items-center gap-6 p-8 md:p-12">
            <BakeryIcon className="h-16 w-16 text-primary" />
            <div>
              <p className="text-lg text-muted-foreground">Welcome to</p>
              <h1 className="text-4xl font-bold text-foreground">BISS Bakery App</h1>
              <p className="mt-2 text-lg text-muted-foreground">Track your bakery's success</p>
            </div>
            <Button variant="secondary" size="lg" className="w-full" onClick={handleGetStarted}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
