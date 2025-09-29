'use client';

import { useState } from 'react';
import { supabaseStore } from '@/data/supabaseStore';
import { Order, PointsTransaction } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrencyNoEmoji } from '@/utils/currency';
import { getLocalizedName } from '@/utils/names';

export default function UserRewards() {
  const { language, t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pointsTx, setPointsTx] = useState<PointsTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [totals, setTotals] = useState({ spentCash: 0, spentPoints: 0, earnedPoints: 0 });

  const fetchData = async () => {
    if (!/^\d{8}$/.test(phone)) {
      alert('Please enter a valid 8-digit phone number');
      return;
    }
    setIsLoading(true);
    try {
      const [ordersRes, txRes, points] = await Promise.all([
        supabaseStore.supabase
          .from('orders')
          .select(`*, bread:breads(*)`)
          .eq('phone_number', phone)
          .order('created_at', { ascending: false }),
        supabaseStore.getPointsTransactionsByPhone(phone),
        supabaseStore.getLoyaltyPoints(phone)
      ]);

      if (ordersRes.error) throw ordersRes.error;
      type OrdersRow = {
        id: string;
        customer_name: string;
        phone_number: string;
        bread: Order['bread'];
        toppings: Order['toppings'] | null;
        total_price: number;
        status: Order['status'];
        created_at: string;
        delivered_at?: string | null;
        payment_method?: 'cash' | 'points' | null;
      };

      const userOrders: Order[] = (ordersRes.data || []).map((o: OrdersRow) => ({
        id: o.id,
        customerName: o.customer_name,
        phoneNumber: o.phone_number,
        bread: o.bread,
        toppings: o.toppings || [],
        totalPrice: o.total_price,
        status: o.status,
        createdAt: new Date(o.created_at),
        deliveredAt: o.delivered_at ? new Date(o.delivered_at) : undefined,
        paymentMethod: o.payment_method ?? 'cash',
      }));

      setOrders(userOrders);
      setPointsTx(txRes);
      setBalance(points ? points.totalPoints : 0);

      const spentCash = userOrders
        .filter(o => o.paymentMethod === 'cash' && o.status === 'delivered')
        .reduce((sum, o) => sum + o.totalPrice, 0);
      const spentPoints = txRes
        .filter(tx => tx.type === 'spend')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const earnedPoints = txRes
        .filter(tx => tx.type === 'earn')
        .reduce((sum, tx) => sum + tx.amount, 0);
      setTotals({ spentCash, spentPoints, earnedPoints });
    } catch (error) {
      console.error(error);
      alert('Failed to load your rewards data. Please try again.');
      setOrders([]);
      setPointsTx([]);
      setBalance(0);
      setTotals({ spentCash: 0, spentPoints: 0, earnedPoints: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 mt-20 sm:mt-24">
        {/* Hero / Intro */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t.myActivityTitle}</h1>
          <p className="opacity-90">{t.myActivitySubtitle}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.enterYourPhoneNumber}
              className="flex-1 px-4 py-3 rounded-lg text-primary border border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="px-5 py-3 rounded-lg bg-white text-primary font-semibold hover:bg-white/90 transition disabled:opacity-60"
            >
              {isLoading ? t.processing : t.viewMyActivity}
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-sm text-gray-500">Total Spent (Cash)</div>
            <div className="text-2xl font-semibold text-primary mt-1">{formatCurrencyNoEmoji(totals.spentCash)}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-sm text-gray-500">Points Spent</div>
            <div className="text-2xl font-semibold text-primary mt-1">{totals.spentPoints.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-sm text-gray-500">Points Earned</div>
            <div className="text-2xl font-semibold text-primary mt-1">{totals.earnedPoints.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-sm text-gray-500">Points Balance</div>
            <div className="text-2xl font-semibold text-primary mt-1">{balance.toFixed(2)}</div>
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-5 py-4 border-b text-lg font-semibold">Past Orders</div>
            <div className="h-96 overflow-y-auto overflow-x-auto">
              {orders.length === 0 ? (
                <div className="p-5 text-gray-500">No orders yet</div>
              ) : (
                <table className="min-w-max w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bread</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="px-4 py-2 text-sm text-gray-700">{o.createdAt.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{getLocalizedName(o.bread.name, language)}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{formatCurrencyNoEmoji(o.totalPrice)}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{o.paymentMethod}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-5 py-4 border-b text-lg font-semibold">Points History</div>
            <div className="h-96 overflow-y-auto overflow-x-auto">
              {pointsTx.length === 0 ? (
                <div className="p-5 text-gray-500">No transactions yet</div>
              ) : (
                <table className="min-w-max w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pointsTx.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-4 py-2 text-sm text-gray-700">{tx.createdAt.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{tx.type}</td>
                        <td className={`px-4 py-2 text-sm font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.amount >= 0 ? `+${tx.amount.toFixed(2)}` : `-${Math.abs(tx.amount).toFixed(2)}`}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{tx.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


