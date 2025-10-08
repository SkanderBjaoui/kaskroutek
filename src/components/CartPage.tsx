'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/types';
import { formatCurrencyWithEmoji, formatCurrencyNoEmoji } from '@/utils/currency';
import { getLocalizedName } from '@/utils/names';
import { supabaseStore } from '@/data/supabaseStore';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, deliveryMethod, setDeliveryMethod, shippingFee, pickupTimeISO, setPickupTimeISO, shippingTimeISO, setShippingTimeISO } = useCart();
  const { t, language } = useLanguage();
  const router = useRouter();

  const canProceedToCheckout = deliveryMethod === 'pickup' ? !!pickupTimeISO : !!shippingTimeISO;

  const getItemPrice = (item: CartItem) => {
    const basePrice = item.bread.price + item.toppings.reduce((sum: number, topping) => sum + topping.price, 0);
    return basePrice;
  };

  const handleCheckout = () => {
    if (!canProceedToCheckout) return;
    router.push('/checkout');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 mt-20 sm:mt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center sm:text-left">{t.cart}</h1>
          <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
              {cart.items.reduce((sum, item) => sum + item.quantity, 0)} {t.itemsInCart}
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm sm:text-base"
            >
              {t.orderNow}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart.items.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4">🛒</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">{t.cartEmpty}</h2>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Start building your perfect sandwich!</p>
                <Link
                  href="/"
                  className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-semibold text-sm sm:text-base"
                >
                  {t.orderNow}
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      {/* Item Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0">
                        {item.bread.imageUrl ? (
                          <Image
                            src={item.bread.imageUrl}
                            alt={item.bread.name}
                            fill
                            sizes="(max-width: 640px) 80px, 100px"
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-2xl">🥪</div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 truncate">{getLocalizedName(item.bread.name, language)}</h3>
                        {item.toppings.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {item.toppings.map((topping, index) => (
                                <span
                                  key={index}
                                  className="bg-secondary-light text-white text-xs px-2 py-1 rounded"
                                >
                                  {getLocalizedName(topping.name, language)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs sm:text-sm text-gray-600">
                          {formatCurrencyNoEmoji(getItemPrice(item))} each
                        </p>
                      </div>

                      {/* Quantity Controls and Actions */}
                      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 sm:px-3 py-2 hover:bg-gray-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-2 sm:px-4 py-2 font-semibold min-w-[2rem] sm:min-w-[3rem] text-center text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 sm:px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-bold text-primary">
                            {formatCurrencyNoEmoji(item.totalPrice)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 sm:p-2"
                          title={t.removeFromCart}
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cart.items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-20 sm:top-24">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-4 sm:mb-6">{t.orderSummary}</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">{t.subtotal || 'Subtotal'}:</span>
                    <span className="font-semibold text-sm sm:text-base">{formatCurrencyWithEmoji(getTotalPrice())}</span>
                  </div>

                  {/* Delivery Method */}
                  <div className="pt-2 border-t">
                    <div className="text-sm font-semibold text-gray-700 mb-2">{t.deliveryMethodLabel || 'Delivery Method'}</div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} /> {t.pickup || 'Pickup'}
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={deliveryMethod === 'shipping'} onChange={() => setDeliveryMethod('shipping')} /> {t.shipping} (+{formatCurrencyNoEmoji(shippingFee)})
                      </label>
                    </div>
                  </div>

                  {/* Pickup Timer (today only) */}
                  {deliveryMethod === 'pickup' && (
                    <div className="pt-2">
                      <div className="text-sm font-semibold text-gray-700 mb-2">{t.pickupTimeToday || 'Pickup Time (today)'}</div>
                      <Timers selectedISO={pickupTimeISO} onSelectISO={setPickupTimeISO} cutoffMinutes={30} />
                    </div>
                  )}

                  {/* Shipping Timer (today only, no cutoff) */}
                  {deliveryMethod === 'shipping' && (
                    <div className="pt-2">
                      <div className="text-sm font-semibold text-gray-700 mb-2">{t.shippingTimeToday || 'Shipping Time (today)'}</div>
                      <Timers selectedISO={shippingTimeISO} onSelectISO={setShippingTimeISO} tableName="shipping_timers_delivery" />
                    </div>
                  )}
                  
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-primary">
                      <span>{t.total}</span>
                      <span>{formatCurrencyWithEmoji(getTotalPrice())}</span>
                    </div>
                  </div>
                  
                  {!canProceedToCheckout && (
                    <div className="text-xs text-red-600 -mt-1 mb-2">{t.selectTimeToContinue || 'Please select a time to continue.'}</div>
                  )}
                  <button 
                    onClick={handleCheckout}
                    disabled={!canProceedToCheckout}
                    className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors font-semibold text-sm sm:text-base ${canProceedToCheckout ? 'bg-primary text-white hover:bg-primary-light' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  >
                    {t.checkout || 'Check out'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

function Timers({ selectedISO, onSelectISO, cutoffMinutes, tableName }: { selectedISO?: string; onSelectISO: (iso?: string) => void; cutoffMinutes?: number; tableName?: string }) {
  const [timers, setTimers] = useState<{ id: string; dayOfWeek: number; time: string; active: boolean }[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabaseStore.supabase
          .from(tableName || 'shipping_timers')
          .select('*')
          .eq('active', true);
        if (!error) {
          setTimers((data || []).map((r: any) => ({ id: r.id, dayOfWeek: r.day_of_week, time: r.time, active: r.active })));
        }
      } catch {}
    })();
  }, []);

  const today = new Date();
  const todayDow = today.getDay();
  const nowMs = today.getTime();
  const todayTimers = timers
    .filter(t => t.dayOfWeek === todayDow)
    .filter(t => {
      const [hh, mm] = t.time.split(':').map(Number);
      const candidate = new Date(today);
      candidate.setHours(hh, mm, 0, 0);
      const diffMin = (candidate.getTime() - nowMs) / 60000;
      // Always hide past times
      if (diffMin < 0) return false;
      if (cutoffMinutes && cutoffMinutes > 0) {
        // Hide only the pre-slot window; allow at exact time (diffMin === 0)
        if (diffMin < cutoffMinutes && diffMin > 0) return false;
      }
      return true;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-2">
      {todayTimers.length === 0 ? (
        <div className="text-sm text-gray-500">{t.noTimesAvailable || 'No times available'}</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {todayTimers.map((t) => {
            const [hh, mm] = t.time.split(':');
            const label = `${hh}:${mm}`;
            const d = new Date(today);
            d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
            const iso = d.toISOString();
            const active = selectedISO === iso;
            return (
              <button key={t.id} onClick={() => onSelectISO(iso)} className={`px-3 py-2 rounded border text-sm ${active ? 'bg-primary text-white border-primary' : 'border-gray-300'}`}>
                {label}
              </button>
            );
          })}
        </div>
      )}
      {selectedISO && (
        <button onClick={() => onSelectISO(undefined)} className="text-xs text-gray-500 underline">{t.clearSelection || 'Clear'}</button>
      )}
    </div>
  );
}
