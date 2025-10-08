'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrencyWithEmoji, formatCurrencyNoEmoji } from '@/utils/currency';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, onProceedToCheckout }: CartSidebarProps) {
  const { cart, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-primary">{t.cart}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 text-lg">{t.cartEmpty}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-primary">{item.bread.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        {t.removeFromCart}
                      </button>
                    </div>
                    
                    {item.toppings.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">{t.toppings}:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.toppings.map((topping, index) => (
                            <span
                              key={index}
                              className="bg-secondary-light text-white text-xs px-2 py-1 rounded"
                            >
                              {topping.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {item.toppings.length} {t.toppings.toLowerCase()}
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrencyNoEmoji(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>{t.total}:</span>
                <span className="text-primary">{formatCurrencyWithEmoji(getTotalPrice())}</span>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-semibold"
                >
                  {t.proceedToCheckout}
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.clearCart}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

