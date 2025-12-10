
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollText, Wallet, BarChart3, Settings, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

const navItems = [
  { href: '/dashboard', icon: BarChart3, labelKey: 'dashboard' },
  { href: '/entry', icon: ScrollText, labelKey: 'entry' },
  { href: '/expenses', icon: Wallet, labelKey: 'expenses' },
  { href: '/trends', icon: Lightbulb, labelKey: 'trends' },
  { href: '/settings', icon: Settings, labelKey: 'settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (href: string) => {
    if(href === '/dashboard') return pathname === href || pathname === '/reports';
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[64px] border-t bg-card/95 backdrop-blur-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)'}}>
      <div className="container mx-auto grid h-full max-w-4xl grid-cols-5">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 text-xs transition-colors min-h-[56px]",
                active ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              <div className={cn("flex items-center justify-center rounded-2xl px-4 py-1 transition-colors", active && "bg-primary/10")}>
                <Icon className="h-6 w-6" />
              </div>
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
