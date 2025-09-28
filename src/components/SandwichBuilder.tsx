'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bread, Topping, ToppingCategory } from '@/types';
import { supabaseStore } from '@/data/supabaseStore';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrencyWithEmoji, formatCurrencyNoEmoji } from '@/utils/currency';
import { getLocalizedName } from '@/utils/names';

interface SandwichBuilderProps {
  onOrderSubmit: (customerName: string, phoneNumber: string) => void;
}

export default function SandwichBuilder({ onOrderSubmit }: SandwichBuilderProps) {
  const [breads, setBreads] = useState<Bread[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [selectedBread, setSelectedBread] = useState<Bread | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const { addToCart, getItemCount, getTotalPrice } = useCart();
  const { t, language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [breadsData, toppingsData] = await Promise.all([
          supabaseStore.getBreads(),
          supabaseStore.getToppings()
        ]);
        setBreads(breadsData);
        setToppings(toppingsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const breadPrice = selectedBread?.price || 0;
    const toppingsPrice = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    setTotalPrice(breadPrice + toppingsPrice);
  }, [selectedBread, selectedToppings]);

  const handleBreadSelect = (bread: Bread) => {
    setSelectedBread(bread);
  };

  const handleToppingToggle = (topping: Topping) => {
    setSelectedToppings(prev => {
      const isSelected = prev.some(t => t.id === topping.id);
      if (isSelected) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedBread) {
      alert(t.pleaseSelectBread);
      return;
    }
    
    addToCart(selectedBread, selectedToppings);
    
    // Reset current selection
    setSelectedBread(null);
    setSelectedToppings([]);
  };


  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) {
      alert(t.pleaseFillAllFields);
      return;
    }

    onOrderSubmit(customerName, phoneNumber);
    
    // Reset form
    setCustomerName('');
    setPhoneNumber('');
    setShowOrderForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-20 sm:mt-20">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-primary mb-4">{t.buildYourPerfectSandwich}</h2>
        <p className="text-gray-600 text-lg">{t.chooseYourBread}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Bread Selection */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-primary mb-6">{t.chooseYourBread}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {breads.map((bread) => (
                <button
                  key={bread.id}
                  onClick={() => handleBreadSelect(bread)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedBread?.id === bread.id
                      ? 'border-primary bg-primary-light text-white'
                      : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                  }`}
                >
                  {bread.imageUrl && (
                    <div className="mb-3 w-full h-24 relative">
                      <Image
                        src={bread.imageUrl}
                        alt={bread.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="font-semibold text-lg">{getLocalizedName(bread.name, language)}</div>
                  <div className="text-sm opacity-75">{formatCurrencyNoEmoji(bread.price)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Toppings Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-primary mb-6">{t.addToppings}</h3>
            
            {/* Group toppings by category */}
            {(['condiments', 'meats', 'salads', 'extra'] as ToppingCategory[]).map((category) => {
              const categoryToppings = toppings.filter(topping => topping.category === category);
              if (categoryToppings.length === 0) return null;
              
              return (
                <div key={category} className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 capitalize">
                    {t[category]}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryToppings.map((topping) => {
                      const isSelected = selectedToppings.some(t => t.id === topping.id);
                      return (
                        <button
                          key={topping.id}
                          onClick={() => handleToppingToggle(topping)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-secondary bg-secondary-light text-white'
                              : 'border-gray-200 hover:border-secondary hover:bg-gray-50'
                          }`}
                        >
                          {topping.imageUrl && (
                            <div className="mb-3 w-full h-20 relative">
                              <Image
                                src={topping.imageUrl}
                                alt={topping.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="font-semibold">{getLocalizedName(topping.name, language)}</div>
                          <div className="text-sm opacity-75">+{formatCurrencyNoEmoji(topping.price)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-30">
            <h3 className="text-2xl font-semibold text-primary mb-6">{t.orderSummary}</h3>
            
            {selectedBread && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">{t.bread}</h4>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span>{getLocalizedName(selectedBread.name, language)}</span>
                  <span className="font-semibold">{formatCurrencyNoEmoji(selectedBread.price)}</span>
                </div>
              </div>
            )}

            {selectedToppings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">{t.toppings}</h4>
                <div className="space-y-2">
                  {selectedToppings.map((topping) => (
                    <div key={topping.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm">{getLocalizedName(topping.name, language)}</span>
                      <span className="text-sm font-semibold">+{formatCurrencyNoEmoji(topping.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold text-primary">
                <span>{t.total}</span>
                <span>{formatCurrencyWithEmoji(totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={!selectedBread}
                className="w-full bg-secondary text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-secondary-light disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {selectedBread ? t.addToCart : t.selectBreadFirst}
              </button>
              
              {getItemCount() > 0 && (
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-primary-light transition-colors"
                >
                  {t.cart} ({getItemCount()})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-semibold text-primary mb-6">{t.completeYourOrder}</h3>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t.enterYourFullName}
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phoneNumber} *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t.enterYourPhoneNumber}
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t.orderTotal}</div>
                <div className="text-xl font-bold text-primary">{formatCurrencyWithEmoji(getTotalPrice())}</div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                >
                  {t.placeOrder}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
