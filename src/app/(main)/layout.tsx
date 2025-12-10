
"use client";

import { BottomNav } from '@/components/shared/bottom-nav';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-[88px]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
