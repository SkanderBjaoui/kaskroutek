'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import SandwichBuilder from '@/components/SandwichBuilder';
import OrderConfirmation from '@/components/OrderConfirmation';
import { useCart } from '@/contexts/CartContext';
import { dataStore } from '@/data/store';

export default function Home() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    customerName: string;
    phoneNumber: string;
  } | null>(null);

  const { cart, clearCart } = useCart();

  const handleOrderSubmit = (customerName: string, phoneNumber: string) => {
    // Save each item in cart as a separate order
    cart.items.forEach(item => {
      dataStore.addOrder({
        customerName,
        phoneNumber,
        bread: item.bread,
        toppings: item.toppings,
        totalPrice: item.totalPrice,
        paymentMethod: 'cash', // Default to cash for local data store
      });
    });

    // Clear cart after successful order
    clearCart();

    // Show confirmation
    setConfirmationData({ customerName, phoneNumber });
    setShowConfirmation(true);
  };

  // Confirmation closes when navigating away via the modal's button

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <SandwichBuilder onOrderSubmit={handleOrderSubmit} />
      </main>
      
      {showConfirmation && confirmationData && (
        <OrderConfirmation
          customerName={confirmationData.customerName}
          phoneNumber={confirmationData.phoneNumber}
        />
      )}
    </div>
  );
}
