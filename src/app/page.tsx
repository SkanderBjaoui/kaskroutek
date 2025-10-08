'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/build/bread');
  }, [router]);

  // Confirmation closes when navigating away via the modal's button

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex flex-col items-center justify-center py-16" />
    </div>
  );
}
