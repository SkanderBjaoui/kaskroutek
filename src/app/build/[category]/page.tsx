'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Topping, ToppingCategory } from '@/types';
import { supabaseStore } from '@/data/supabaseStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedName } from '@/utils/names';
import { formatCurrencyNoEmoji } from '@/utils/currency';
import { useBuilder } from '@/contexts/BuilderContext';

const ORDER: ToppingCategory[] = ['condiments', 'meats', 'salads', 'extra'];

export default function ChooseCategoryPage() {
  const params = useParams();
  const category = (params?.category as string) as ToppingCategory;
  const [toppings, setToppings] = useState<Topping[]>([]);
  const { language, t } = useLanguage();
  const { selectedBread, incrementTopping, decrementTopping, toppingQuantities } = useBuilder();
  const router = useRouter();

  useEffect(() => {
    supabaseStore.getToppings().then(setToppings).catch(console.error);
  }, []);

  const categoryToppings = useMemo(() => toppings.filter(t => t.category === category), [toppings, category]);

  const nextRoute = useMemo(() => {
    const idx = ORDER.indexOf(category);
    if (idx === -1) return '/';
    const next = ORDER[idx + 1];
    return next ? `/build/${next}` : '/build/summary';
  }, [category]);

  if (!['condiments','meats','salads','extra'].includes(category)) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6 capitalize">{t[category]}</h1>

      {!selectedBread && (
        <div className="mb-4 text-red-600">{t.pleaseSelectBread}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryToppings.map((top) => {
          const qty = toppingQuantities[top.id] || 0;
          return (
            <div key={top.id} className={`p-4 rounded-lg border-2 ${qty > 0 ? 'border-secondary bg-secondary-light text-white' : 'border-gray-200'}`}>
              {top.imageUrl && (
                <div className="mb-3 w-full">
                  <Image
                    src={top.imageUrl}
                    alt={top.name}
                    width={600}
                    height={120}
                    className="w-full h-28 object-cover rounded-lg"
                    unoptimized
                  />
                </div>
              )}
              <div className="font-semibold">{getLocalizedName(top.name, language)}</div>
              <div className="text-sm opacity-75">+{formatCurrencyNoEmoji(top.price)}</div>
              <div className="mt-3 flex items-center gap-3">
                <button onClick={() => decrementTopping(top)} className="px-3 py-1 rounded bg-gray-200 text-gray-800">-</button>
                <span className="min-w-6 text-center">{qty}</span>
                <button onClick={() => incrementTopping(top)} className="px-3 py-1 rounded bg-gray-800 text-white">+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => router.push('/build/bread')} className="py-2 px-4 rounded border">{t.back || 'Back'}</button>
        <button onClick={() => router.push(nextRoute)} className="bg-secondary text-white py-2 px-6 rounded-lg font-semibold">{t.next || 'NEXT'}</button>
      </div>
    </div>
  );
}


