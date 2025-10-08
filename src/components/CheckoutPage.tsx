'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabaseStore } from '@/data/supabaseStore';
import OrderConfirmation from './OrderConfirmation';
import Link from 'next/link';
import { CartItem, LoyaltyPoints } from '@/types';
import { formatCurrencyWithEmoji, formatCurrencyNoEmoji } from '@/utils/currency';
import { getLocalizedName } from '@/utils/names';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart, deliveryMethod, pickupTimeISO, shippingTimeISO } = useCart();
  const { t, language } = useLanguage();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsError, setPointsError] = useState('');

  const getItemPrice = (item: CartItem) => {
    const breadPrice = item.bread.price * (item.isDoubleBread ? 2 : 1);
    const basePrice = breadPrice + item.toppings.reduce((sum: number, topping) => sum + topping.price, 0);
    return basePrice;
  };

  // Check loyalty points when phone number is entered (8 digits)
  useEffect(() => {
    const checkLoyaltyPoints = async () => {
      if (phoneNumber.length === 8 && /^\d+$/.test(phoneNumber)) {
        try {
          const points = await supabaseStore.getLoyaltyPoints(phoneNumber);
          setLoyaltyPoints(points);
          setPointsError('');
        } catch (error) {
          console.error('Error fetching loyalty points:', error);
          setLoyaltyPoints(null);
        }
      } else {
        setLoyaltyPoints(null);
        setPointsError('');
      }
    };

    checkLoyaltyPoints();
  }, [phoneNumber]);

  // Calculate points needed for current order (1 point = 1 TND)
  const pointsNeeded = getTotalPrice();
  const canUsePoints = loyaltyPoints && loyaltyPoints.totalPoints >= pointsNeeded;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) {
      alert(t.pleaseFillAllFields);
      return;
    }

    // Check if user wants to use points but doesn't have enough
    if (usePoints && !canUsePoints) {
      setPointsError(t.notEnoughPoints);
      return;
    }

    setIsSubmitting(true);

    // Test basic Supabase connection
    console.log('Testing basic Supabase connection...');
    try {
      const { data, error } = await supabaseStore.supabase
        .from('breads')
        .select('count')
        .limit(1);
      
      console.log('Basic connection test:', { data, error });
      
      if (error) {
        console.error('Basic connection failed:', error);
        alert('Database connection failed. Please try again.');
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Basic connection error:', err);
      alert('Database connection failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Redeem points if user chose to use them
    if (usePoints && canUsePoints && loyaltyPoints) {
      try {
        const redeemedPoints = await supabaseStore.redeemLoyaltyPoints(phoneNumber, pointsNeeded);
        if (!redeemedPoints) {
          alert(t.notEnoughPoints);
          setIsSubmitting(false);
          return;
        }
        // Update local loyalty points state
        setLoyaltyPoints(redeemedPoints);
      } catch (error) {
        console.error('Error redeeming points:', error);
        alert('Error redeeming points. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    // Create order for each cart item
    try {
      for (const item of cart.items) {
        for (let i = 0; i < item.quantity; i++) {
          await supabaseStore.addOrder({
            customerName,
            phoneNumber,
            bread: item.bread,
            toppings: item.toppings,
            totalPrice: getItemPrice(item),
            status: 'awaiting_confirmation',
            paymentMethod: usePoints ? 'points' : 'cash',
            isDoubleBread: item.isDoubleBread,
            note: orderNote ? orderNote.slice(0, 50) : undefined,
            deliveryMethod,
            pickupTime: pickupTimeISO ? new Date(pickupTimeISO) : undefined,
            shippingTime: shippingTimeISO ? new Date(shippingTimeISO) : undefined,
          });
        }
      }

      // Send Telegram notification for each unique sandwich
      try {
        for (const item of cart.items) {
          const baseBread = getLocalizedName(item.bread.name, language);
          const doubleNote = item.isDoubleBread ? ' + double pate' : '';
          const sandwichDescription = `${baseBread}${doubleNote} with ${item.toppings.map(topping => getLocalizedName(topping.name, language)).join(', ')}`;
          const currentTime = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Tunis',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          await fetch('/api/telegram/notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: customerName,
              phoneNumber: phoneNumber,
              sandwich: sandwichDescription,
              price: getItemPrice(item),
              time: currentTime,
              paymentMethod: usePoints ? 'points' : 'cash',
              note: orderNote ? orderNote.slice(0, 50) : undefined,
              deliveryMethod,
              pickupTime: pickupTimeISO || undefined,
              shippingTime: shippingTimeISO || undefined,
            })
          });
        }
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError);
        // Don't block the order if Telegram fails
      }
    } catch (error) {
      console.error('Error creating orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error creating orders: ${errorMessage}. Please try again.`);
      setIsSubmitting(false);
      return;
    }

    // Clear cart and reset form
    clearCart();
    setShowConfirmation(true);
    setIsSubmitting(false);
  };

  if (cart.items.length === 0 && !showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-12 text-center max-w-md mx-4">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 mt-20 sm:mt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t.checkout || 'Checkout'}</h1>
          <Link
            href="/cart"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            ← {t.backToCart || 'Back to Cart'}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-primary mb-4 sm:mb-6">{t.orderSummary}</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    {/* Item Image */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0">
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
                        <div className="text-gray-400 text-lg sm:text-xl">🥪</div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-primary mb-1">
                        {item.isDoubleBread ? (
                          <>
                            <div>{getLocalizedName(item.bread.name, language)}</div>
                            <div>{getLocalizedName(item.bread.name, language)}</div>
                          </>
                        ) : (
                          <div className="truncate">{getLocalizedName(item.bread.name, language)}</div>
                        )}
                      </h3>
                      {item.toppings.length > 0 && (
                        <div className="mb-1">
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
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-primary">
                          {formatCurrencyNoEmoji(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-primary">
                  <span>{t.total}</span>
                  <span>{formatCurrencyWithEmoji(getTotalPrice())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-primary mb-4 sm:mb-6">{t.completeYourOrder}</h2>
              
              <form onSubmit={handleOrderSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    placeholder={t.enterYourFullName}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    {t.phoneNumber} *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    placeholder={t.enterYourPhoneNumber}
                    required
                  />
                  
                  {/* Loyalty Points Display */}
                  {phoneNumber.length === 8 && /^\d+$/.test(phoneNumber) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      {loyaltyPoints ? (
                        <div>
                          <div className="text-sm font-medium text-blue-800 mb-2">
                            {t.availablePoints}: {loyaltyPoints.totalPoints.toFixed(2)} points
                          </div>
                          {canUsePoints ? (
                            <div className="space-y-2">
                              <div className="text-sm text-blue-700">
                                {t.pointsNeeded}: {pointsNeeded.toFixed(2)} points
                              </div>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={usePoints}
                                  onChange={(e) => {
                                    setUsePoints(e.target.checked);
                                    setPointsError('');
                                  }}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-blue-800">
                                  {t.payWithPoints}
                                </span>
                              </label>
                            </div>
                          ) : (
                            <div className="text-sm text-red-600">
                              {t.notEnoughPoints}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          No loyalty points found for this phone number
                        </div>
                      )}
                    </div>
                  )}
                  
                  {pointsError && (
                    <div className="mt-2 text-sm text-red-600">
                      {pointsError}
                    </div>
                  )}
                </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{t.orderTotal}</div>
                  <div className="text-lg sm:text-xl font-bold text-primary">{formatCurrencyWithEmoji(getTotalPrice())}</div>
                <div>
                  <label htmlFor="orderNote" className="block text-xs sm:text-sm text-gray-600 mb-1">Note (max 50)</label>
                  <textarea
                    id="orderNote"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value.slice(0, 50))}
                    maxLength={50}
                    rows={2}
                    placeholder={t.notePlaceholder || 'Optional note for your sandwich'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  <div className="text-right text-xs text-gray-500">{orderNote.length}/50</div>
                </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (t.processing || 'Processing...') : (t.placeOrder || 'Place Order')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmation && (
        <OrderConfirmation
          customerName={customerName}
          phoneNumber={phoneNumber}
        />
      )}
    </div>
  );
}
