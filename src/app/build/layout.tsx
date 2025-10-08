'use client';

import { BuilderProvider } from '@/contexts/BuilderContext';
import Header from '@/components/Header';

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return (
    <BuilderProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {children}
      </div>
    </BuilderProvider>
  );
}


