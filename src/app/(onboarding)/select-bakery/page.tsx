"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BAKERIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function SelectBakeryPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selectedBakery, setSelectedBakery] = useState(data.bakery || '');

  const handleContinue = () => {
    if (selectedBakery) {
      updateData({ bakery: selectedBakery });
      router.push('/select-role');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Select Your Bakery</h1>
        <p className="text-muted-foreground">Which bakery do you manage?</p>
      </div>

      <Card>
        <RadioGroup
          value={selectedBakery}
          onValueChange={setSelectedBakery}
          className="gap-0"
        >
          {BAKERIES.map((bakery, index) => (
            <Label
              key={bakery.id}
              htmlFor={bakery.id}
              className={`flex cursor-pointer items-center justify-between p-4 h-[72px] transition-colors hover:bg-secondary/50 ${
                selectedBakery === bakery.id ? 'bg-secondary' : ''
              } ${index < BAKERIES.length - 1 ? 'border-b' : ''} first:rounded-t-xl last:rounded-b-xl`}
            >
              <span className="text-lg font-medium">{bakery.name}</span>
              <RadioGroupItem value={bakery.id} id={bakery.id} />
            </Label>
          ))}
        </RadioGroup>
      </Card>

      <Button
        onClick={handleContinue}
        disabled={!selectedBakery}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
}
