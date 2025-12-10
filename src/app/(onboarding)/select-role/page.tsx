"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { CheckCircle2 } from 'lucide-react';

export default function SelectRolePage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState(data.role || '');

  const handleSelectRole = (roleId: 'manager' | 'supervisor') => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      updateData({ role: selectedRole as 'manager' | 'supervisor' });
      router.push('/select-products');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">What's your role?</h1>
      </div>

      <div className="space-y-4">
        {Object.values(ROLES).map((role: UserRole) => (
          <Card
            key={role.id}
            onClick={() => handleSelectRole(role.id)}
            className={cn(
              'cursor-pointer p-5 transition-all h-[100px] flex items-center gap-4 relative',
              selectedRole === role.id && 'border-primary ring-2 ring-primary'
            )}
          >
            <div className="text-4xl">{role.icon}</div>
            <div>
              <CardTitle className="text-lg">{role.name}</CardTitle>
              <CardDescription className="text-sm">{role.description}</CardDescription>
            </div>
            {selectedRole === role.id && (
              <CheckCircle2 className="absolute right-4 top-4 h-6 w-6 text-primary" />
            )}
          </Card>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedRole}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
}
