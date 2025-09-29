'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
        <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
          Go back home
        </Link>
      </main>
    </div>
  );
}



