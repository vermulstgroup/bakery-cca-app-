"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollText, Wallet, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/entry', icon: ScrollText, label: 'Entry' },
  { href: '/expenses', icon: Wallet, label: 'Expenses' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  // Special case for dashboard as it combines reports
  const isActive = (href: string) => {
    if(href === '/dashboard') return pathname === href || pathname === '/reports';
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[64px] border-t bg-card/80 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)'}}>
      <div className="container mx-auto grid h-full max-w-4xl grid-cols-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors",
                active && "text-primary"
              )}
            >
              <div className={cn("flex items-center justify-center rounded-full p-2 transition-colors", active && "bg-primary/10")}>
                <Icon className="h-6 w-6" />
              </div>
              <span className={cn(active && "font-semibold")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
