'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bread, Topping, Order, OrderStatus, PointsTransaction, ShippingTimer } from '@/types';
import { supabaseStore } from '@/data/supabaseStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrencyWithEmoji, formatCurrencyNoEmoji } from '@/utils/currency';
import { getLocalizedName, createBilingualName } from '@/utils/names';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'breads' | 'toppings' | 'orders' | 'delivered' | 'cancelled' | 'loyalty' | 'customers'>('breads');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [breads, setBreads] = useState<Bread[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [timers, setTimers] = useState<ShippingTimer[]>([]);
  const [deliveryTimers, setDeliveryTimers] = useState<ShippingTimer[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [showBreadForm, setShowBreadForm] = useState(false);
  const [showToppingForm, setShowToppingForm] = useState(false);
  const [editingBread, setEditingBread] = useState<Bread | null>(null);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  const [editingTimer, setEditingTimer] = useState<ShippingTimer | null>(null);
  const [breadForm, setBreadForm] = useState({ nameEn: '', nameFr: '', price: '', imageUrl: '' });
  const [toppingForm, setToppingForm] = useState({ nameEn: '', nameFr: '', price: '', imageUrl: '', category: 'extra' as 'salads' | 'meats' | 'condiments' | 'extra' });
  const [toppingFilter, setToppingFilter] = useState<'all' | 'condiments' | 'meats' | 'salads' | 'extra'>('all');
  const [showTimerForm, setShowTimerForm] = useState(false);
  const [timerForm, setTimerForm] = useState<{ dayOfWeek: number; time: string; active: boolean }>({ dayOfWeek: 1, time: '12:00', active: true });
  const [timerType, setTimerType] = useState<'pickup' | 'shipping'>('pickup');
  const [loyaltyPhone, setLoyaltyPhone] = useState('');
  const [loyaltyName, setLoyaltyName] = useState('');
  const [loyaltyPointsToAdd, setLoyaltyPointsToAdd] = useState('');
  const [loyaltyLookup, setLoyaltyLookup] = useState<{ total: number } | null>(null);
  const [isUpdatingPoints, setIsUpdatingPoints] = useState(false);

  // Customers tab state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerPointsTx, setCustomerPointsTx] = useState<PointsTransaction[]>([]);
  const [customerTotals, setCustomerTotals] = useState<{ spentCash: number; spentPoints: number; earnedPoints: number }>({ spentCash: 0, spentPoints: 0, earnedPoints: 0 });
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [customerPointsBalance, setCustomerPointsBalance] = useState<number>(0);
  
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [breadsData, toppingsData, ordersData, deliveredData, cancelledData, timersData, deliveryTimersData] = await Promise.all([
        supabaseStore.getBreads(),
        supabaseStore.getToppings(),
        supabaseStore.getOrders(),
        supabaseStore.getDeliveredOrders(),
        supabaseStore.getOrdersByStatus('cancelled'),
        supabaseStore.supabase.from('shipping_timers').select('*').order('day_of_week').order('time'),
        supabaseStore.supabase.from('shipping_timers_delivery').select('*').order('day_of_week').order('time')
      ]);
      
      setBreads(breadsData);
      setToppings(toppingsData);
      setOrders(ordersData.filter(order => order.status !== 'delivered' && order.status !== 'cancelled'));
      setDeliveredOrders(deliveredData);
      setCancelledOrders(cancelledData);
      if (timersData.error) throw timersData.error;
      setTimers((timersData.data || []).map((r: any) => ({ id: r.id, dayOfWeek: r.day_of_week, time: r.time, active: r.active })));
      if (deliveryTimersData.error) throw deliveryTimersData.error;
      setDeliveryTimers((deliveryTimersData.data || []).map((r: any) => ({ id: r.id, dayOfWeek: r.day_of_week, time: r.time, active: r.active })));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const lookupLoyalty = async (phone: string) => {
    if (!/^\d{8}$/.test(phone)) {
      setLoyaltyLookup(null);
      return;
    }
    try {
      const points = await supabaseStore.getLoyaltyPoints(phone);
      setLoyaltyLookup(points ? { total: points.totalPoints } : { total: 0 });
    } catch {
      setLoyaltyLookup(null);
    }
  };

  const handleAddLoyaltyPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{8}$/.test(loyaltyPhone)) {
      alert('Enter a valid 8-digit phone number');
      return;
    }
    const amount = parseFloat(loyaltyPointsToAdd);
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a positive points amount');
      return;
    }
    if (!loyaltyName.trim()) {
      alert('Enter customer name');
      return;
    }
    setIsUpdatingPoints(true);
    try {
      const updated = await supabaseStore.createOrUpdateLoyaltyPoints(loyaltyPhone, loyaltyName.trim(), amount);
      if (!updated) {
        alert('Failed to update points');
      } else {
        // Log adjustment here only (admin action)
        await supabaseStore.logPointsTransaction({
          phoneNumber: loyaltyPhone,
          amount: amount,
          type: 'adjustment_add',
          reason: 'Admin manual add',
        });
        setLoyaltyLookup({ total: updated.totalPoints });
        setLoyaltyPointsToAdd('');
        alert('Points updated successfully');
      }
    } catch {
      alert('Error updating points');
    } finally {
      setIsUpdatingPoints(false);
    }
  };

  const fetchCustomerData = async (phone: string) => {
    if (!/^\d{8}$/.test(phone)) {
      setCustomerOrders([]);
      setCustomerPointsTx([]);
      setCustomerTotals({ spentCash: 0, spentPoints: 0, earnedPoints: 0 });
      return;
    }
    setIsLoadingCustomer(true);
    try {
      const [ordersByPhone, pointsTx, loyalty] = await Promise.all([
        supabaseStore.supabase
          .from('orders')
          .select(`*, bread:breads(*)`)
          .eq('phone_number', phone)
          .order('created_at', { ascending: false }),
        supabaseStore.getPointsTransactionsByPhone(phone),
        supabaseStore.getLoyaltyPoints(phone)
      ]);

      if (ordersByPhone.error) throw ordersByPhone.error;
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
      const orders: Order[] = (ordersByPhone.data || []).map((o: OrdersRow) => ({
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

      setCustomerOrders(orders);
      setCustomerPointsTx(pointsTx);
      setCustomerPointsBalance(loyalty ? loyalty.totalPoints : 0);

      const spentCash = orders
        .filter(o => o.paymentMethod === 'cash' && o.status === 'delivered')
        .reduce((sum, o) => sum + o.totalPrice, 0);
      const spentPoints = pointsTx
        .filter(tx => tx.type === 'spend')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const earnedPoints = pointsTx
        .filter(tx => tx.type === 'earn')
        .reduce((sum, tx) => sum + tx.amount, 0);
      setCustomerTotals({ spentCash, spentPoints, earnedPoints });
    } catch (error) {
      console.error('Error fetching customer data', error);
      setCustomerOrders([]);
      setCustomerPointsTx([]);
      setCustomerTotals({ spentCash: 0, spentPoints: 0, earnedPoints: 0 });
      setCustomerPointsBalance(0);
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const handleBreadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(breadForm.price);
    const bilingualName = createBilingualName(breadForm.nameEn, breadForm.nameFr);
    
    try {
      if (editingBread) {
        await supabaseStore.updateBread(editingBread.id, { 
          name: bilingualName, 
          price, 
          imageUrl: breadForm.imageUrl || undefined 
        });
      } else {
        await supabaseStore.addBread({ 
          name: bilingualName,
          nameEn: breadForm.nameEn,
          nameFr: breadForm.nameFr,
          price, 
          imageUrl: breadForm.imageUrl || undefined 
        });
      }
      
      await loadData();
      setShowBreadForm(false);
      setEditingBread(null);
      setBreadForm({ nameEn: '', nameFr: '', price: '', imageUrl: '' });
    } catch (error) {
      console.error('Error saving bread:', error);
      alert('Error saving bread. Please try again.');
    }
  };

  const handleToppingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(toppingForm.price);
    const bilingualName = createBilingualName(toppingForm.nameEn, toppingForm.nameFr);
    
    try {
      if (editingTopping) {
        await supabaseStore.updateTopping(editingTopping.id, { 
          name: bilingualName, 
          price, 
          imageUrl: toppingForm.imageUrl || undefined,
          category: toppingForm.category
        });
      } else {
        await supabaseStore.addTopping({ 
          name: bilingualName,
          nameEn: toppingForm.nameEn,
          nameFr: toppingForm.nameFr,
          price, 
          imageUrl: toppingForm.imageUrl || undefined,
          category: toppingForm.category
        });
      }
      
      await loadData();
      setShowToppingForm(false);
      setEditingTopping(null);
      setToppingForm({ nameEn: '', nameFr: '', price: '', imageUrl: '', category: 'extra' });
    } catch (error) {
      console.error('Error saving topping:', error);
      alert('Error saving topping. Please try again.');
    }
  };

  const handleEditBread = (bread: Bread) => {
    setEditingBread(bread);
    setBreadForm({ 
      nameEn: bread.nameEn, 
      nameFr: bread.nameFr, 
      price: bread.price.toString(), 
      imageUrl: bread.imageUrl || '' 
    });
    setShowBreadForm(true);
  };

  const handleEditTopping = (topping: Topping) => {
    setEditingTopping(topping);
    setToppingForm({ 
      nameEn: topping.nameEn, 
      nameFr: topping.nameFr, 
      price: topping.price.toString(), 
      imageUrl: topping.imageUrl || '',
      category: topping.category
    });
    setShowToppingForm(true);
  };

  const handleDeleteBread = async (id: string) => {
    if (confirm('Are you sure you want to delete this bread?')) {
      try {
        await supabaseStore.deleteBread(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting bread:', error);
        alert('Error deleting bread. Please try again.');
      }
    }
  };

  const handleDeleteTopping = async (id: string) => {
    if (confirm('Are you sure you want to delete this topping?')) {
      try {
        await supabaseStore.deleteTopping(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting topping:', error);
        alert('Error deleting topping. Please try again.');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Get the order before updating to check if we need to award points
      const orderToUpdate = orders.find(order => order.id === orderId);
      const wasDelivered = orderToUpdate?.status === 'delivered';
      
      await supabaseStore.updateOrderStatus(orderId, newStatus);
      
      // Award points if order is being marked as delivered for the first time
      // Only award points if the order was NOT paid with points
      if (newStatus === 'delivered' && !wasDelivered && orderToUpdate) {
        await supabaseStore.awardPointsForDeliveredOrder(orderToUpdate);
      }
      
      await loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await supabaseStore.updateOrderStatus(orderId, 'cancelled');
      await loadData();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order. Please try again.');
    }
  };

  const handleUncancelOrder = async (orderId: string) => {
    try {
      await supabaseStore.updateOrderStatus(orderId, 'confirmed');
      await loadData();
    } catch (error) {
      console.error('Error uncancelling order:', error);
      alert('Error uncancelling order. Please try again.');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_confirmation':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_preparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_confirmation':
        return t.awaitingConfirmation;
      case 'confirmed':
        return t.confirmed;
      case 'in_preparation':
        return t.inPreparation;
      case 'delivery':
        return t.delivery;
      case 'delivered':
        return t.delivered;
      case 'cancelled':
        return t.cancelled;
      default:
        return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'salads':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'meats':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'condiments':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'extra':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFilteredAndSortedToppings = () => {
    let filteredToppings = toppings;
    
    // Filter by category if not 'all'
    if (toppingFilter !== 'all') {
      filteredToppings = toppings.filter(topping => topping.category === toppingFilter);
    }
    
    // Sort by category order: condiments -> meats -> salads -> extra
    const categoryOrder = ['condiments', 'meats', 'salads', 'extra'];
    return filteredToppings.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      return aIndex - bIndex;
    });
  };

  const renderBreadManagement = () => (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-primary">Bread Management</h2>
          <button
            onClick={() => {
              setEditingBread(null);
              setBreadForm({ nameEn: '', nameFr: '', price: '', imageUrl: '' });
              setShowBreadForm(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Add New Bread
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-max w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {breads.map((bread) => (
                <tr key={bread.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bread.imageUrl ? (
                      <div className="w-16 h-12 relative">
                        <Image
                          src={bread.imageUrl}
                          alt={bread.name}
                          fill
                          sizes="64px"
                          className="object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getLocalizedName(bread.name, language)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrencyNoEmoji(bread.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditBread(bread)}
                      className="text-primary hover:text-primary-light"
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteBread(bread.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderToppingManagement = () => (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-primary">Topping Management</h2>
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <select
              value={toppingFilter}
              onChange={(e) => setToppingFilter(e.target.value as 'all' | 'condiments' | 'meats' | 'salads' | 'extra')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t.allCategories}</option>
              <option value="condiments">{t.condiments}</option>
              <option value="meats">{t.meats}</option>
              <option value="salads">{t.salads}</option>
              <option value="extra">{t.extra}</option>
            </select>
            <button
              onClick={() => {
                setEditingTopping(null);
                setToppingForm({ nameEn: '', nameFr: '', price: '', imageUrl: '', category: 'extra' });
                setShowToppingForm(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              Add New Topping
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-max w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.image}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.name}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.price}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.toppingCategory}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredAndSortedToppings().map((topping) => (
                <tr key={topping.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {topping.imageUrl ? (
                      <div className="w-16 h-12 relative">
                        <Image
                          src={topping.imageUrl}
                          alt={topping.name}
                          fill
                          sizes="64px"
                          className="object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getLocalizedName(topping.name, language)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrencyNoEmoji(topping.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(topping.category)}`}>
                      {t[topping.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditTopping(topping)}
                      className="text-primary hover:text-primary-light"
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteTopping(topping.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimersManagement = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-primary">Pickup & Shipping Timers</h2>
          <button
            onClick={() => {
              setEditingTimer(null);
              setTimerForm({ dayOfWeek: 1, time: '12:00', active: true });
              setTimerType('pickup');
              setShowTimerForm(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Add Timer
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="px-6 py-3 border-b text-lg font-semibold">Pickup Timers</div>
          <div className="overflow-x-auto">
            <table className="min-w-max w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timers.map((tm) => (
                  <tr key={tm.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][tm.dayOfWeek]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tm.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tm.active ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingTimer(tm);
                          setTimerForm({ dayOfWeek: tm.dayOfWeek, time: tm.time, active: tm.active });
                          setTimerType('pickup');
                          setShowTimerForm(true);
                        }}
                        className="text-primary hover:text-primary-light"
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this timer?')) return;
                          await supabaseStore.supabase.from('shipping_timers').delete().eq('id', tm.id);
                          await loadData();
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg">
          <div className="px-6 py-3 border-b text-lg font-semibold">Shipping Timers</div>
          <div className="overflow-x-auto">
            <table className="min-w-max w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryTimers.map((tm) => (
                  <tr key={tm.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][tm.dayOfWeek]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tm.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tm.active ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingTimer(tm);
                          setTimerForm({ dayOfWeek: tm.dayOfWeek, time: tm.time, active: tm.active });
                          setTimerType('shipping');
                          setShowTimerForm(true);
                        }}
                        className="text-primary hover:text-primary-light"
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this timer?')) return;
                          await supabaseStore.supabase.from('shipping_timers_delivery').delete().eq('id', tm.id);
                          await loadData();
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showTimerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-semibold text-primary mb-6">{editingTimer ? 'Edit Timer' : 'Add Timer'}</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const targetTable = editingTimer
                  ? (timers.find(t => editingTimer && t.id === editingTimer.id) ? 'shipping_timers' : 'shipping_timers_delivery')
                  : (timerType === 'pickup' ? 'shipping_timers' : 'shipping_timers_delivery');
                if (editingTimer) {
                  await supabaseStore.supabase
                    .from(targetTable)
                    .update({ day_of_week: timerForm.dayOfWeek, time: timerForm.time, active: timerForm.active })
                    .eq('id', editingTimer.id);
                } else {
                  await supabaseStore.supabase
                    .from(targetTable)
                    .insert({ day_of_week: timerForm.dayOfWeek, time: timerForm.time, active: timerForm.active });
                }
                setShowTimerForm(false);
                setEditingTimer(null);
                await loadData();
              }}
              className="space-y-4"
            >
              {!editingTimer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timer Type</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={timerType === 'pickup'} onChange={() => setTimerType('pickup')} /> Pickup
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={timerType === 'shipping'} onChange={() => setTimerType('shipping')} /> Shipping
                    </label>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                <select
                  value={timerForm.dayOfWeek}
                  onChange={(e) => setTimerForm({ ...timerForm, dayOfWeek: parseInt(e.target.value, 10) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, idx) => (
                    <option key={idx} value={idx}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time (HH:MM)</label>
                <input
                  type="time"
                  value={timerForm.time}
                  onChange={(e) => setTimerForm({ ...timerForm, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={timerForm.active} onChange={(e) => setTimerForm({ ...timerForm, active: e.target.checked })} /> Active
              </label>
              <div className="flex space-x-4">
                <button type="button" onClick={() => { setShowTimerForm(false); setEditingTimer(null); }} className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">{t.cancel}</button>
                <button type="submit" className="flex-1 py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">{editingTimer ? t.update : t.add}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  const renderOrders = () => (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-primary">Customer Orders</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{order.customerName}</h3>
                    <p className="text-gray-600">{order.phoneNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatCurrencyWithEmoji(order.totalPrice)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="mb-2">
                    <span className="font-medium">Bread: </span>
                    <span className="text-gray-700">
                      {order.isDoubleBread ? (
                        <>
                          <div>{getLocalizedName(order.bread.name, language)}</div>
                          <div>{getLocalizedName(order.bread.name, language)}</div>
                        </>
                      ) : (
                        <div>{getLocalizedName(order.bread.name, language)}</div>
                      )}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Delivery: </span>
                    <span className="text-gray-700">
                      {order.deliveryMethod || 'pickup'}
                      {order.deliveryMethod === 'shipping' && order.shippingTime && (
                        <>
                          {' '}• Time: {new Date(order.shippingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      )}
                      {order.deliveryMethod === 'pickup' && order.pickupTime && (
                        <>
                          {' '}• Time: {new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      )}
                    </span>
                  </div>
                  {order.note && (
                    <div className="mb-2">
                      <span className="font-medium">Note: </span>
                      <span className="text-gray-700 break-words">{order.note}</span>
                    </div>
                  )}
                  {order.toppings.length > 0 && (
                    <div className="mb-4">
                      <span className="font-medium">Toppings: </span>
                      <span className="text-gray-700">
                        {order.toppings.map(t => getLocalizedName(t.name, language)).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{t.orderStatus}:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{t.paymentMethod}:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          order.paymentMethod === 'points' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.paymentMethod === 'points' ? t.paidWithPoints : t.paidWithCash}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="awaiting_confirmation">{t.awaitingConfirmation}</option>
                        <option value="confirmed">{t.confirmed}</option>
                        <option value="in_preparation">{t.inPreparation}</option>
                        <option value="delivery">{t.delivery}</option>
                        <option value="delivered">{t.delivered}</option>
                        <option value="cancelled">{t.cancelled}</option>
                      </select>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                      >
                        {t.cancelOrder}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDeliveredOrders = () => (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-primary">{t.deliveredOrders}</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        {deliveredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No delivered orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{order.customerName}</h3>
                    <p className="text-gray-600">{order.phoneNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatCurrencyWithEmoji(order.totalPrice)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="mb-2">
                    <span className="font-medium">Bread: </span>
                    <span className="text-gray-700">
                      {order.isDoubleBread ? (
                        <>
                          <div>{getLocalizedName(order.bread.name, language)}</div>
                          <div>{getLocalizedName(order.bread.name, language)}</div>
                        </>
                      ) : (
                        <div>{getLocalizedName(order.bread.name, language)}</div>
                      )}
                    </span>
                  </div>
                  {order.toppings.length > 0 && (
                    <div className="mb-4">
                      <span className="font-medium">Toppings: </span>
                      <span className="text-gray-700">
                        {order.toppings.map(t => getLocalizedName(t.name, language)).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{t.orderStatus}:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{t.paymentMethod}:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          order.paymentMethod === 'points' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.paymentMethod === 'points' ? t.paidWithPoints : t.paidWithCash}
                        </span>
                      </div>
                    </div>
                    {order.deliveredAt && (
                      <div className="md:text-right">
                        <p className="text-sm text-gray-500">{t.deliveryTime}:</p>
                        <p className="text-sm font-medium text-green-600">
                          {new Date(order.deliveredAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCancelledOrders = () => (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-primary">{t.cancelledOrders}</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        {cancelledOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No cancelled orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cancelledOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{order.customerName}</h3>
                    <p className="text-gray-600">{order.phoneNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatCurrencyWithEmoji(order.totalPrice)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="mb-2">
                    <span className="font-medium">Bread: </span>
                    <span className="text-gray-700">
                      {order.isDoubleBread ? (
                        <>
                          <div>{getLocalizedName(order.bread.name, language)}</div>
                          <div>{getLocalizedName(order.bread.name, language)}</div>
                        </>
                      ) : (
                        <div>{getLocalizedName(order.bread.name, language)}</div>
                      )}
                    </span>
                  </div>
                  
                  {order.toppings.length > 0 && (
                    <div className="mb-4">
                      <span className="font-medium">Toppings: </span>
                      <span className="text-gray-700">
                        {order.toppings.map(t => getLocalizedName(t.name, language)).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{t.orderStatus}:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{t.paymentMethod}:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          order.paymentMethod === 'points' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.paymentMethod === 'points' ? t.paidWithPoints : t.paidWithCash}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUncancelOrder(order.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        {t.uncancelOrder}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-primary">{t.customers}</h2>
      </div>
      <div className="flex-1 bg-white p-6 pb-16 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.searchByPhone}</label>
            <div className="flex gap-3">
              <input
                type="tel"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t.enterYourPhoneNumber}
              />
              <button
                onClick={() => fetchCustomerData(customerSearch)}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-sm text-gray-600">{t.totalSpentCash}</div>
              <div className="text-2xl font-semibold text-primary mt-1">{formatCurrencyNoEmoji(customerTotals.spentCash)}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-sm text-gray-600">{t.pointsSpentLabel}</div>
              <div className="text-2xl font-semibold text-primary mt-1">{customerTotals.spentPoints.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-sm text-gray-600">{t.pointsEarned}</div>
              <div className="text-2xl font-semibold text-primary mt-1">{customerTotals.earnedPoints.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-sm text-gray-600">{t.pointsBalance}</div>
              <div className="text-2xl font-semibold text-primary mt-1">{customerPointsBalance.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-3 border-b text-lg font-semibold">{t.pastOrders}</div>
            <div className="h-96 overflow-y-auto overflow-x-auto">
                {isLoadingCustomer ? (
                  <div className="p-4 text-gray-500">{t.loading}</div>
                ) : customerOrders.length === 0 ? (
                  <div className="p-4 text-gray-500">{t.noOrders}</div>
                ) : (
                  <table className="min-w-max w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.breadLabel}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.totalLabel}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.payment}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="px-4 py-2 text-sm text-gray-700">{o.createdAt.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {o.isDoubleBread ? (
                              <>
                                <div>{getLocalizedName(o.bread.name, language)}</div>
                                <div>{getLocalizedName(o.bread.name, language)}</div>
                              </>
                            ) : (
                              <div>{getLocalizedName(o.bread.name, language)}</div>
                            )}
                          </td>
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

            {/* Points History */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-3 border-b text-lg font-semibold">{t.pointsHistory}</div>
              <div className="h-96 overflow-y-auto overflow-x-auto">
                {isLoadingCustomer ? (
                  <div className="p-4 text-gray-500">{t.loading}</div>
                ) : customerPointsTx.length === 0 ? (
                  <div className="p-4 text-gray-500">{t.noTransactions}</div>
                ) : (
                  <table className="min-w-max w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerPointsTx.map((tx) => (
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
    </div>
  );
  const renderLoyaltyManagement = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-primary">{t.loyaltyPoints}</h2>
      </div>
      <div className="flex-1 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <form onSubmit={handleAddLoyaltyPoints} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneNumber}</label>
              <input
                type="tel"
                value={loyaltyPhone}
                onChange={(e) => {
                  setLoyaltyPhone(e.target.value);
                  lookupLoyalty(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t.enterYourPhoneNumber}
              />
              {loyaltyLookup && (
                <p className="mt-2 text-sm text-gray-600">{t.availablePoints}: {loyaltyLookup.total.toFixed(2)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
              <input
                type="text"
                value={loyaltyName}
                onChange={(e) => setLoyaltyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t.enterYourFullName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Points</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={loyaltyPointsToAdd}
                onChange={(e) => setLoyaltyPointsToAdd(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                type="submit"
                disabled={isUpdatingPoints}
                className="px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {isUpdatingPoints ? t.processing : 'Add Points'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoyaltyPhone('');
                  setLoyaltyName('');
                  setLoyaltyPointsToAdd('');
                  setLoyaltyLookup(null);
                }}
                className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`
          ${isSidebarCollapsed ? 'md:w-16' : 'md:w-64'}
          ${isMobileSidebarOpen ? 'w-64' : 'w-0'}
          bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all
          overflow-hidden md:overflow-visible
        `}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            {!isSidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
            )}
            <button
              onClick={() => (window.innerWidth < 768 ? setIsMobileSidebarOpen(false) : setIsSidebarCollapsed(!isSidebarCollapsed))}
              className="ml-auto px-2 py-1 rounded hover:bg-gray-100"
              title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <span className="text-gray-700">{isSidebarCollapsed ? '▶' : '◀'}</span>
            </button>
          </div>
          {!isSidebarCollapsed && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Welcome back!</p>
              <p className="text-sm font-medium text-primary">{user?.username || 'Admin User'}</p>
            </div>
          )}
          
          <nav className="space-y-2 flex-1">
            {[
              { id: 'breads', label: t.manageBreads, count: breads.length, icon: '🍞' },
              { id: 'toppings', label: t.manageToppings, count: toppings.length, icon: '🥗' },
              { id: 'orders', label: t.viewOrders, count: orders.length, icon: '📋' },
              { id: 'delivered', label: t.deliveredOrders, count: deliveredOrders.length, icon: '✅' },
              { id: 'cancelled', label: t.cancelledOrders, count: cancelledOrders.length, icon: '❌' },
              { id: 'loyalty', label: t.loyaltyPoints, count: 0, icon: '⭐' },
              { id: 'timers', label: t.shippingTimers || 'Shipping Timers', count: timers.length, icon: '⏰' },
            { id: 'customers', label: t.customers, count: 0, icon: '👤' },
            ].map((tab) => (
              <button
                key={tab.id}
              onClick={() => setActiveTab(tab.id as 'breads' | 'toppings' | 'orders' | 'delivered' | 'cancelled' | 'loyalty' | 'customers')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isSidebarCollapsed ? tab.label : undefined}
                onMouseDown={() => { if (window.innerWidth < 768) setIsMobileSidebarOpen(false); }}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  {!isSidebarCollapsed && <span>{tab.label}</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white bg-opacity-20 text-black'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          {/* Language Switcher and Logout - Bottom of Sidebar */}
          {!isSidebarCollapsed && (
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors shadow-sm border ${
                    language === 'en'
                      ? 'bg-primary text-white font-semibold border-primary'
                      : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors shadow-sm border ${
                    language === 'fr'
                      ? 'bg-primary text-white font-semibold border-primary'
                      : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  Français
                </button>
              </div>
              <button
                onClick={logout}
                className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden min-h-0 transition-all
        ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} md:pl-0 pl-0 ml-0
      `}>
        {/* Top bar for mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="px-3 py-2 rounded bg-gray-100"
            title="Menu"
          >
            ☰
          </button>
          <div className="text-sm font-semibold text-primary">Admin</div>
          <div />
        </div>
        {activeTab === 'breads' && renderBreadManagement()}
        {activeTab === 'toppings' && renderToppingManagement()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'delivered' && renderDeliveredOrders()}
        {activeTab === 'cancelled' && renderCancelledOrders()}
        {activeTab === 'loyalty' && renderLoyaltyManagement()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'timers' && renderTimersManagement()}
      </div>

      {/* Bread Form Modal */}
      {showBreadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-semibold text-primary mb-6">
              {editingBread ? 'Edit Bread' : 'Add New Bread'}
            </h3>
            
            <form onSubmit={handleBreadSubmit} className="space-y-4">
              <div>
                <label htmlFor="breadNameEn" className="block text-sm font-medium text-gray-700 mb-2">
                  Bread Name (English)
                </label>
                <input
                  type="text"
                  id="breadNameEn"
                  value={breadForm.nameEn}
                  onChange={(e) => setBreadForm({ ...breadForm, nameEn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter bread name in English"
                  required
                />
              </div>

              <div>
                <label htmlFor="breadNameFr" className="block text-sm font-medium text-gray-700 mb-2">
                  Bread Name (French)
                </label>
                <input
                  type="text"
                  id="breadNameFr"
                  value={breadForm.nameFr}
                  onChange={(e) => setBreadForm({ ...breadForm, nameFr: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter bread name in French"
                  required
                />
              </div>

              <div>
                <label htmlFor="breadPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.priceDollar}
                </label>
                <input
                  type="number"
                  id="breadPrice"
                  step="0.01"
                  min="0"
                  value={breadForm.price}
                  onChange={(e) => setBreadForm({ ...breadForm, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="breadImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.imageUrl}
                </label>
                <input
                  type="url"
                  id="breadImageUrl"
                  value={breadForm.imageUrl}
                  onChange={(e) => setBreadForm({ ...breadForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t.enterImageUrl}
                />
                {breadForm.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">{t.imagePreview}:</p>
                    <div className="w-24 h-16 relative">
                        <Image
                        src={breadForm.imageUrl}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                        className="object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBreadForm(false);
                    setEditingBread(null);
                    setBreadForm({ nameEn: '', nameFr: '', price: '', imageUrl: '' });
                  }}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                >
                  {editingBread ? 'Update' : 'Add'} Bread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topping Form Modal */}
      {showToppingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-semibold text-primary mb-6">
              {editingTopping ? 'Edit Topping' : 'Add New Topping'}
            </h3>
            
            <form onSubmit={handleToppingSubmit} className="space-y-4">
              <div>
                <label htmlFor="toppingNameEn" className="block text-sm font-medium text-gray-700 mb-2">
                  Topping Name (English)
                </label>
                <input
                  type="text"
                  id="toppingNameEn"
                  value={toppingForm.nameEn}
                  onChange={(e) => setToppingForm({ ...toppingForm, nameEn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter topping name in English"
                  required
                />
              </div>

              <div>
                <label htmlFor="toppingNameFr" className="block text-sm font-medium text-gray-700 mb-2">
                  Topping Name (French)
                </label>
                <input
                  type="text"
                  id="toppingNameFr"
                  value={toppingForm.nameFr}
                  onChange={(e) => setToppingForm({ ...toppingForm, nameFr: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter topping name in French"
                  required
                />
              </div>

              <div>
                <label htmlFor="toppingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.priceDollar}
                </label>
                <input
                  type="number"
                  id="toppingPrice"
                  step="0.01"
                  min="0"
                  value={toppingForm.price}
                  onChange={(e) => setToppingForm({ ...toppingForm, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="toppingCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.toppingCategory}
                </label>
                <select
                  id="toppingCategory"
                  value={toppingForm.category}
                  onChange={(e) => setToppingForm({ ...toppingForm, category: e.target.value as 'salads' | 'meats' | 'condiments' | 'extra' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="salads">{t.salads}</option>
                  <option value="meats">{t.meats}</option>
                  <option value="condiments">{t.condiments}</option>
                  <option value="extra">{t.extra}</option>
                </select>
              </div>

              <div>
                <label htmlFor="toppingImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.imageUrl}
                </label>
                <input
                  type="url"
                  id="toppingImageUrl"
                  value={toppingForm.imageUrl}
                  onChange={(e) => setToppingForm({ ...toppingForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t.enterImageUrl}
                />
                {toppingForm.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">{t.imagePreview}:</p>
                    <div className="w-24 h-16 relative">
                        <Image
                        src={toppingForm.imageUrl}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                        className="object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowToppingForm(false);
                    setEditingTopping(null);
                    setToppingForm({ nameEn: '', nameFr: '', price: '', imageUrl: '', category: 'extra' });
                  }}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                >
                  {editingTopping ? 'Update' : 'Add'} Topping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
