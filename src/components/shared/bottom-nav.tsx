"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ScrollText,
  BarChart3,
  Settings,
  History,
  TrendingUp,
  Home,
  Calendar,
  Building2,
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import type { RoleId } from '@/lib/types';

type NavItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

// Navigation items per role
const getNavItems = (role: RoleId | undefined): NavItem[] => {
  switch (role) {
    case 'bakery-manager':
      return [
        { href: '/dashboard', icon: Home, label: 'Home' },
        { href: '/entry', icon: ScrollText, label: 'Entry' },
        { href: '/summary', icon: TrendingUp, label: 'Summary' },
        { href: '/history', icon: History, label: 'History' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ];
    case 'strategic-manager':
      return [
        { href: '/strategic', icon: BarChart3, label: 'Dashboard' },
        { href: '/date-select', icon: Calendar, label: 'Data' },
        { href: '/history', icon: History, label: 'History' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ];
    case 'supervisor':
      return [
        { href: '/supervisor', icon: Eye, label: 'Overview' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ];
    default:
      // Default nav for unset role
      return [
        { href: '/welcome', icon: Home, label: 'Home' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ];
  }
};

// Role-specific colors
const getRoleColor = (role: RoleId | undefined): string => {
  switch (role) {
    case 'bakery-manager':
      return 'text-amber-500';
    case 'strategic-manager':
      return 'text-blue-500';
    case 'supervisor':
      return 'text-purple-500';
    default:
      return 'text-primary';
  }
};

const getRoleBgColor = (role: RoleId | undefined): string => {
  switch (role) {
    case 'bakery-manager':
      return 'bg-amber-500/10';
    case 'strategic-manager':
      return 'bg-blue-500/10';
    case 'supervisor':
      return 'bg-purple-500/10';
    default:
      return 'bg-primary/10';
  }
};

export function BottomNav() {
  const pathname = usePathname();
  const { data } = useOnboarding();
  const role = data.role;

  const navItems = getNavItems(role);
  const activeColor = getRoleColor(role);
  const activeBgColor = getRoleBgColor(role);

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/strategic' || href === '/supervisor') {
      return pathname === href || pathname === '/reports';
    }
    return pathname.startsWith(href);
  };

  // Don't show nav on onboarding pages
  if (pathname.startsWith('/welcome') || pathname.startsWith('/select-bakery')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-900/95 backdrop-blur-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className={cn(
        "container mx-auto grid h-16 max-w-4xl",
        `grid-cols-${navItems.length}`
      )} style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 text-sm transition-colors",
                active ? activeColor : "text-slate-400 hover:text-slate-300"
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-2xl px-4 py-1.5 transition-colors",
                active && activeBgColor
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
