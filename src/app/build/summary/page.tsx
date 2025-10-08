'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topping } from '@/types';
import { supabaseStore } from '@/data/supabaseStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBuilder } from '@/contexts/BuilderContext';
import { formatCurrencyNoEmoji, formatCurrencyWithEmoji } from '@/utils/currency';
import { getLocalizedName } from '@/utils/names';
import { useCart } from '@/contexts/CartContext';

export default function BuildSummaryPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { selectedBread, isDoubleBread, getSelectedToppingsArray, clearBuilder } = useBuilder();
  const { addToCart } = useCart();
  const [allToppings, setAllToppings] = useState<Topping[]>([]);

  useEffect(() => {
    supabaseStore.getToppings().then(setAllToppings).catch(console.error);
  }, []);

  const chosenToppings = useMemo(() => getSelectedToppingsArray(allToppings), [allToppings, getSelectedToppingsArray]);
  const totalPrice = useMemo(() => {
    const breadPrice = (selectedBread?.price || 0) * (isDoubleBread ? 2 : 1);
    const toppingsPrice = chosenToppings.reduce((sum, t) => sum + t.price, 0);
    return breadPrice + toppingsPrice;
  }, [selectedBread, isDoubleBread, chosenToppings]);

  const handleAdd = () => {
    if (!selectedBread) return;
    // Add a single cart item with isDoubleBread flag; cart will compute price accordingly
    addToCart(selectedBread, chosenToppings, { isDoubleBread });
    clearBuilder();
    router.push('/cart');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">{t.orderSummary}</h1>

      <div className="bg-white rounded-xl shadow p-6">
        {selectedBread && (
          <div className="mb-4">
            <div className="font-semibold mb-1">{t.bread}</div>
            <div className="flex justify-between">
              <span>{getLocalizedName(selectedBread.name, language)}{isDoubleBread ? ` ${getLocalizedName(selectedBread.name, language)}` : ''}</span>
              <span>{formatCurrencyNoEmoji((selectedBread.price) * (isDoubleBread ? 2 : 1))}</span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="font-semibold mb-1">{t.toppings}</div>
          {chosenToppings.length === 0 ? (
            <div className="text-gray-500">—</div>
          ) : (
            <div className="space-y-1">
              {chosenToppings.map((top, idx) => (
                <div key={`${top.id}-${idx}`} className="flex justify-between text-sm">
                  <span>{getLocalizedName(top.name, language)}</span>
                  <span>+{formatCurrencyNoEmoji(top.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4 flex justify-between text-xl font-bold text-primary">
          <span>{t.total}</span>
          <span>{formatCurrencyWithEmoji(totalPrice)}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => router.push('/build/extra')} className="py-2 px-4 rounded border">{t.back || 'Back'}</button>
        <button onClick={handleAdd} disabled={!selectedBread} className="bg-primary text-white py-2 px-6 rounded-lg font-semibold disabled:bg-gray-300">{t.addToCart}</button>
      </div>
    </div>
  );
}


