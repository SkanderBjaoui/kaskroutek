'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bread } from '@/types';
import { supabaseStore } from '@/data/supabaseStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedName } from '@/utils/names';
import { formatCurrencyNoEmoji } from '@/utils/currency';
import { useBuilder } from '@/contexts/BuilderContext';

export default function ChooseBreadPage() {
  const [breads, setBreads] = useState<Bread[]>([]);
  const { language, t } = useLanguage();
  const { selectedBread, isDoubleBread, setBread, toggleDoubleBread } = useBuilder();
  const router = useRouter();

  useEffect(() => {
    supabaseStore.getBreads().then(setBreads).catch(console.error);
  }, []);

  const handleSelectBread = (bread: Bread) => {
    setBread(bread);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const scrollTarget = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        );
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">{t.chooseYourBread}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {breads.map((bread) => (
          <button
            key={bread.id}
            onClick={() => handleSelectBread(bread)}
            className={`p-4 rounded-lg border-2 text-left ${selectedBread?.id === bread.id ? 'border-primary bg-primary-light text-white' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}`}
          >
            {bread.imageUrl && (
              <div className="mb-3 w-full">
                <Image
                  src={bread.imageUrl}
                  alt={bread.name}
                  width={600}
                  height={160}
                  className="w-full h-40 object-cover rounded-lg"
                  unoptimized
                />
              </div>
            )}
            <div className="font-semibold text-lg">{getLocalizedName(bread.name, language)}</div>
            <div className="text-sm opacity-75">{formatCurrencyNoEmoji(bread.price)}</div>
          </button>
        ))}
      </div>

      {selectedBread && (
        <div className="mt-6 flex items-center gap-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={isDoubleBread} onChange={toggleDoubleBread} className="w-5 h-5" />
            <span className="text-lg font-semibold">{t.doubleBread || 'Double bread'}</span>
          </label>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => router.push('/build/condiments')}
          disabled={!selectedBread}
          className="bg-secondary text-white py-2 px-6 rounded-lg font-semibold disabled:bg-gray-300"
        >
          {t.next || 'NEXT'}
        </button>
      </div>
    </div>
  );
}


