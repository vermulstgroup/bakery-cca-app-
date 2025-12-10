"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BakeryIcon } from '@/components/shared/icons';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useState } from 'react';
import { BAKERIES, ROLES } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selectedBakery, setSelectedBakery] = useState(data.bakery || '');
  const [selectedRole, setSelectedRole] = useState(data.role || 'manager');


  const handleContinue = () => {
    if (selectedBakery && selectedRole) {
      updateData({ bakery: selectedBakery, role: selectedRole as 'manager' | 'supervisor' });
      router.push('/select-products');
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
       <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="flex flex-col items-center gap-6 p-8 md:p-12">
            <div className='text-center space-y-2'>
              <p className="text-base text-muted-foreground">Welcome to</p>
              <h1 className="text-3xl font-bold text-foreground">BISS Bakery</h1>
            </div>

            <div className='w-full space-y-6 text-left'>
                <div>
                    <Label className='text-base font-semibold ml-1 mb-2 block'>Select your bakery</Label>
                    <div className="space-y-2">
                    {BAKERIES.map((bakery) => {
                      const isSelected = selectedBakery === bakery.id;
                      return (
                        <Card
                          key={bakery.id}
                          onClick={() => setSelectedBakery(bakery.id)}
                          className={cn(
                            'cursor-pointer p-4 transition-all flex items-center justify-between',
                            isSelected && 'bg-primary/10 border-primary ring-2 ring-primary'
                          )}
                        >
                          <span className="text-base font-medium">{bakery.name}</span>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </Card>
                      );
                    })}
                    </div>
                </div>
                
                <div>
                    <Label className='text-base font-semibold ml-1 mb-2 block'>Your Role</Label>
                     <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-full h-14 text-base">
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                        {Object.values(ROLES).map((role: UserRole) => (
                           <SelectItem key={role.id} value={role.id} className="text-base h-12">{role.icon} {role.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button size="lg" className="w-full mt-4" onClick={handleContinue} disabled={!selectedBakery || !selectedRole}>
              Continue →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
