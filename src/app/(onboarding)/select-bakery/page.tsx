"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useState } from 'react';
import { BAKERIES, ROLES } from '@/lib/data';
import { cn } from '@/lib/utils';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function SelectBakeryPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selectedBakery, setSelectedBakery] = useState(data.bakery || '');

  const role = data.role ? ROLES[data.role.toUpperCase().replace('-', '_')] : null;

  const handleBakerySelect = (bakeryId: string) => {
    setSelectedBakery(bakeryId);
    updateData({ bakery: bakeryId });

    // Route based on role
    setTimeout(() => {
      if (data.role === 'strategic-manager') {
        router.push('/strategic');
      } else if (data.role === 'bakery-manager') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/welcome')}
            className="-ml-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🏪</span>
          <h1 className="text-2xl font-bold text-white mb-2">Select Your Bakery</h1>
          {role && (
            <p className="text-slate-400">
              Logging in as <span className="font-bold" style={{ color: role.color }}>{role.name}</span>
            </p>
          )}
        </div>

        {/* Bakery Selection Cards */}
        <div className="w-full space-y-3 flex-1">
          {BAKERIES.map((bakery) => {
            const isSelected = selectedBakery === bakery.id;
            return (
              <Card
                key={bakery.id}
                onClick={() => handleBakerySelect(bakery.id)}
                className={cn(
                  'cursor-pointer p-4 transition-all bg-slate-800/50 backdrop-blur-sm border',
                  'hover:bg-slate-800/70 active:scale-[0.98]',
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/30'
                    : 'border-slate-700 hover:border-slate-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🍞</span>
                    <div>
                      <h3 className="font-bold text-white">{bakery.name}</h3>
                      <p className="text-sm text-slate-400">
                        {bakery.region} • Manager: {bakery.manager}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-6 w-6 text-amber-500 shrink-0" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">Select the bakery you manage</p>
        </div>
      </div>
    </div>
  );
}
