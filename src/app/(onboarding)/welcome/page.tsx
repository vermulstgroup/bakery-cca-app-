"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useState, useEffect } from 'react';
import { ROLES } from '@/lib/data';
import type { RoleId, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { data, updateData, userId } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState<RoleId | ''>(data.role || '');

  useEffect(() => {
    if (userId) {
      updateData({ userId });
    }
  }, [userId, updateData]);

  const handleRoleSelect = (roleId: RoleId) => {
    setSelectedRole(roleId);
    updateData({ role: roleId });

    // Route based on role
    setTimeout(() => {
      if (roleId === 'supervisor') {
        // Supervisor goes directly to supervisor dashboard
        router.push('/supervisor');
      } else {
        // Manager roles need to select bakery first
        router.push('/select-bakery');
      }
    }, 300);
  };

  const getRoleBorderClass = (roleId: string) => {
    switch (roleId) {
      case 'bakery-manager':
        return 'border-amber-500/30 hover:border-amber-500/50';
      case 'strategic-manager':
        return 'border-blue-500/30 hover:border-blue-500/50';
      case 'supervisor':
        return 'border-purple-500/30 hover:border-purple-500/50';
      default:
        return 'border-slate-700';
    }
  };

  const getRoleAccentClass = (roleId: string) => {
    switch (roleId) {
      case 'bakery-manager':
        return 'text-amber-500';
      case 'strategic-manager':
        return 'text-blue-400';
      case 'supervisor':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-6xl mb-4 block">🍞</span>
          <h1 className="text-3xl font-bold text-white mb-2">BISS Bakery Tracker</h1>
          <p className="text-slate-400">Production & Sales Management</p>
        </div>

        {/* Role Selection Cards */}
        <div className="w-full space-y-4">
          {Object.values(ROLES).map((role: UserRole) => {
            const isSelected = selectedRole === role.id;
            return (
              <Card
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={cn(
                  'cursor-pointer p-5 transition-all bg-slate-800/50 backdrop-blur-sm border-2',
                  'hover:bg-slate-800/70 active:scale-[0.98]',
                  getRoleBorderClass(role.id),
                  isSelected && 'ring-2 ring-offset-2 ring-offset-slate-900',
                  isSelected && role.id === 'bakery-manager' && 'ring-amber-500 border-amber-500',
                  isSelected && role.id === 'strategic-manager' && 'ring-blue-500 border-blue-500',
                  isSelected && role.id === 'supervisor' && 'ring-purple-500 border-purple-500'
                )}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{role.icon}</span>
                  <div className="flex-grow">
                    <h3 className={cn('text-lg font-bold', getRoleAccentClass(role.id))}>
                      {role.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{role.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className={cn('h-6 w-6 shrink-0', getRoleAccentClass(role.id))} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">Child Care Africa</p>
          <p className="text-slate-600 text-xs">Uganda</p>
        </div>
      </div>
    </div>
  );
}
