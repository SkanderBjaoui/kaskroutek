'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface OrderConfirmationProps {
  customerName: string;
  phoneNumber: string;
  onClose: () => void;
}

export default function OrderConfirmation({ customerName, phoneNumber, onClose }: OrderConfirmationProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-2xl font-semibold text-primary mb-2">{t.orderConfirmed}</h3>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-700">
            {t.thankYou} <span className="font-semibold text-primary">{customerName}</span>!
          </p>
          <p className="text-gray-700">
            {t.orderReceived} <span className="font-semibold text-primary">{phoneNumber}</span> {t.contactYouShortly}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            {t.estimatedTime}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
        >
          {t.orderAnotherSandwich}
        </button>
      </div>
    </div>
  );
}
