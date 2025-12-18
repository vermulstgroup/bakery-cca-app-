
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useState, useEffect } from 'react';
import { BAKERIES, ROLES } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function WelcomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data, updateData, userId } = useOnboarding();
  const [selectedBakery, setSelectedBakery] = useState(data.bakery || '');
  const [selectedRole, setSelectedRole] = useState(data.role || '');

  useEffect(() => {
    if(userId) {
      updateData({ userId });
    }
  }, [userId, updateData]);

  const handleContinue = () => {
    if (selectedBakery && selectedRole) {
      updateData({ bakery: selectedBakery, role: selectedRole as 'manager' | 'supervisor' });
      router.push('/select-products');
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
       <div className="w-full max-w-md">
        
        <div className='text-center space-y-2 mb-8'>
            <p className="text-base text-muted-foreground">{t('welcome_to')}</p>
            <h1 className="text-3xl font-bold text-foreground">BISS Bakery</h1>
        </div>

        <div className='w-full space-y-8 text-left'>
            <div>
                 <h2 className='text-xl font-semibold ml-1 mb-3 block'>{t('select_your_role')}</h2>
                 <div className="space-y-2">
                    {Object.values(ROLES).map((role: UserRole) => {
                        const isSelected = selectedRole === role.id;
                        return (
                             <Card
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={cn(
                                    'cursor-pointer p-4 transition-all flex items-start gap-4',
                                    isSelected && 'bg-primary/10 border-primary ring-2 ring-primary'
                                )}
                            >
                                <span className="text-2xl mt-1">{role.icon}</span>
                                <div className='flex-grow'>
                                    <h3 className="text-base font-semibold">{t(role.id)}</h3>
                                    <p className="text-sm text-muted-foreground">{t(`${role.id}_description`)}</p>
                                </div>
                                {isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                            </Card>
                        )
                    })}
                </div>
            </div>

            <div>
                <h2 className='text-xl font-semibold ml-1 mb-3 block'>{t('select_your_bakery')}</h2>
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
        </div>

        <div className="mt-10">
            <Button size="lg" className="w-full" onClick={handleContinue} disabled={!selectedBakery || !selectedRole || !userId}>
              {t('next')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}
