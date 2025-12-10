"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is now part of the welcome screen, so we just redirect.
export default function SelectBakeryRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/welcome');
  }, [router]);

  return null;
}
