"use client";

import { BottomNav } from '@/components/shared/bottom-nav';
import { OfflineIndicator } from '@/components/shared/offline-indicator';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <OfflineIndicator />
      <main className="flex-1 pb-[88px]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
