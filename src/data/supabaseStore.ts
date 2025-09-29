import { supabase } from '@/lib/supabase';
import { Bread, Topping, Order, OrderStatus, LoyaltyPoints, PointsTransaction } from '@/types';
import { parseBilingualName } from '@/utils/names';

export class SupabaseStore {
  // Expose supabase client for direct access
  public supabase = supabase;

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('breads')
        .select('count')
        .limit(1);
      
      console.log('Connection test result:', { data, error });
      
      if (error) {
        console.error('Connection test failed:', error);
        return false;
      }
      
      console.log('Supabase connection successful');
      return true;
    } catch (err) {
      console.error('Connection test error:', err);
      return false;
    }
  }

  // Points transactions
  async logPointsTransaction(tx: Omit<PointsTransaction, 'id' | 'createdAt'>): Promise<PointsTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .insert({
          phone_number: tx.phoneNumber,
          amount: tx.amount,
          type: tx.type,
          reason: tx.reason,
          related_order_id: tx.relatedOrderId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging points transaction:', error);
        return null;
      }

      return {
        id: data.id,
        phoneNumber: data.phone_number,
        amount: parseFloat(data.amount),
        type: data.type,
        reason: data.reason || undefined,
        relatedOrderId: data.related_order_id || undefined,
        createdAt: new Date(data.created_at),
      };
    } catch (e) {
      console.error('Error logging points transaction:', e);
      return null;
    }
  }

  async getPointsTransactionsByPhone(phoneNumber: string): Promise<PointsTransaction[]> {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      phoneNumber: row.phone_number,
      amount: parseFloat(row.amount),
      type: row.type,
      reason: row.reason || undefined,
      relatedOrderId: row.related_order_id || undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  // Bread methods
  async getBreads(): Promise<Bread[]> {
    const { data, error } = await supabase
      .from('breads')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Transform database fields to match our interface
    return (data || []).map((item: { id: string; name: string; price: number; image_url?: string }) => {
      const { nameEn, nameFr } = parseBilingualName(item.name);
      return {
        id: item.id,
        name: item.name,
        nameEn,
        nameFr,
        price: item.price,
        imageUrl: item.image_url
      };
    });
  }

  async addBread(bread: Omit<Bread, 'id'>): Promise<Bread> {
    console.log('Adding bread:', bread);
    
    const { data, error } = await supabase
      .from('breads')
      .insert([{
        name: bread.name,
        price: bread.price,
        image_url: bread.imageUrl
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding bread:', error);
      throw error;
    }
    
    console.log('Bread added successfully:', data);
    
    // Transform database fields to match our interface
    const { nameEn, nameFr } = parseBilingualName(data.name);
    return {
      id: data.id,
      name: data.name,
      nameEn,
      nameFr,
      price: data.price,
      imageUrl: data.image_url
    };
  }

  async updateBread(id: string, updates: Partial<Omit<Bread, 'id'>>): Promise<Bread | null> {
    const updateData: { name?: string; price?: number; image_url?: string } = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    
    const { data, error } = await supabase
      .from('breads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Transform database fields to match our interface
    const { nameEn, nameFr } = parseBilingualName(data.name);
    return {
      id: data.id,
      name: data.name,
      nameEn,
      nameFr,
      price: data.price,
      imageUrl: data.image_url
    };
  }

  async deleteBread(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('breads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Topping methods
  async getToppings(): Promise<Topping[]> {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Transform database fields to match our interface
    return (data || []).map((item: { id: string; name: string; price: number; image_url?: string; category: string }) => {
      const { nameEn, nameFr } = parseBilingualName(item.name);
      return {
        id: item.id,
        name: item.name,
        nameEn,
        nameFr,
        price: item.price,
        imageUrl: item.image_url,
        category: item.category as 'salads' | 'meats' | 'condiments' | 'extra'
      };
    });
  }

  async addTopping(topping: Omit<Topping, 'id'>): Promise<Topping> {
    console.log('Adding topping:', topping);
    
    const { data, error } = await supabase
      .from('toppings')
      .insert([{
        name: topping.name,
        price: topping.price,
        image_url: topping.imageUrl,
        category: topping.category
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding topping:', error);
      throw error;
    }
    
    console.log('Topping added successfully:', data);
    
    // Transform database fields to match our interface
    const { nameEn, nameFr } = parseBilingualName(data.name);
    return {
      id: data.id,
      name: data.name,
      nameEn,
      nameFr,
      price: data.price,
      imageUrl: data.image_url,
      category: data.category as 'salads' | 'meats' | 'condiments' | 'extra'
    };
  }

  async updateTopping(id: string, updates: Partial<Omit<Topping, 'id'>>): Promise<Topping | null> {
    const updateData: { name?: string; price?: number; image_url?: string; category?: string } = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.category !== undefined) updateData.category = updates.category;
    
    const { data, error } = await supabase
      .from('toppings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Transform database fields to match our interface
    const { nameEn, nameFr } = parseBilingualName(data.name);
    return {
      id: data.id,
      name: data.name,
      nameEn,
      nameFr,
      price: data.price,
      imageUrl: data.image_url,
      category: data.category as 'salads' | 'meats' | 'condiments' | 'extra'
    };
  }

  async deleteTopping(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('toppings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        bread:breads(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our Order interface
    return (data || []).map((order: { 
      id: string; 
      customer_name: string; 
      phone_number: string; 
      bread: Bread; 
      toppings: Topping[]; 
      total_price: number; 
      status: OrderStatus; 
      created_at: string; 
      delivered_at?: string; 
      payment_method?: string;
    }) => ({
      id: order.id,
      customerName: order.customer_name,
      phoneNumber: order.phone_number,
      bread: order.bread,
      toppings: order.toppings || [],
      totalPrice: order.total_price,
      status: order.status,
      createdAt: new Date(order.created_at),
      deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
      paymentMethod: (order.payment_method as 'cash' | 'points') || 'cash',
    }));
  }

  async addOrder(order: Omit<Order, 'id' | 'createdAt'> & { status?: OrderStatus }): Promise<Order> {
    console.log('Adding order with data:', {
      customer_name: order.customerName,
      phone_number: order.phoneNumber,
      bread_id: order.bread.id,
      toppings: order.toppings,
      total_price: order.totalPrice,
      status: order.status || 'awaiting_confirmation',
      payment_method: order.paymentMethod
    });
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: order.customerName,
        phone_number: order.phoneNumber,
        bread_id: order.bread.id,
        toppings: order.toppings,
        total_price: order.totalPrice,
        status: order.status || 'awaiting_confirmation',
        payment_method: order.paymentMethod
      }])
      .select(`
        *,
        bread:breads(*)
      `)
      .single();
    
    if (error) {
      console.error('Error adding order:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    // Transform the data to match our Order interface
    return {
      id: data.id,
      customerName: data.customer_name,
      phoneNumber: data.phone_number,
      bread: data.bread,
      toppings: data.toppings || [],
      totalPrice: data.total_price,
      status: data.status,
      createdAt: new Date(data.created_at),
      deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
      paymentMethod: data.payment_method || 'cash',
    };
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const updateData: { status: OrderStatus; delivered_at?: string } = { status };
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        bread:breads(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match our Order interface
    return {
      id: data.id,
      customerName: data.customer_name,
      phoneNumber: data.phone_number,
      bread: data.bread,
      toppings: data.toppings || [],
      totalPrice: data.total_price,
      status: data.status,
      createdAt: new Date(data.created_at),
      deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
      paymentMethod: data.payment_method || 'cash',
    };
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        bread:breads(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our Order interface
    return (data || []).map((order: { 
      id: string; 
      customer_name: string; 
      phone_number: string; 
      bread: Bread; 
      toppings: Topping[]; 
      total_price: number; 
      status: OrderStatus; 
      created_at: string; 
      delivered_at?: string; 
      payment_method?: string;
    }) => ({
      id: order.id,
      customerName: order.customer_name,
      phoneNumber: order.phone_number,
      bread: order.bread,
      toppings: order.toppings || [],
      totalPrice: order.total_price,
      status: order.status,
      createdAt: new Date(order.created_at),
      deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
      paymentMethod: (order.payment_method as 'cash' | 'points') || 'cash',
    }));
  }

  async getDeliveredOrders(): Promise<Order[]> {
    return this.getOrdersByStatus('delivered');
  }

  // Loyalty Points methods
  async getLoyaltyPoints(phoneNumber: string): Promise<LoyaltyPoints | null> {
    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching loyalty points:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        phoneNumber: data.phone_number,
        customerName: data.customer_name,
        totalPoints: parseFloat(data.total_points),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      return null;
    }
  }

  async createOrUpdateLoyaltyPoints(phoneNumber: string, customerName: string, pointsToAdd: number): Promise<LoyaltyPoints | null> {
    try {
      // First, try to get existing points
      const existingPoints = await this.getLoyaltyPoints(phoneNumber);
      
      if (existingPoints) {
        // Update existing points
        const newTotalPoints = existingPoints.totalPoints + pointsToAdd;
        const { data, error } = await supabase
          .from('loyalty_points')
          .update({
            customer_name: customerName,
            total_points: newTotalPoints
          })
          .eq('phone_number', phoneNumber)
          .select()
          .single();

        if (error) {
          console.error('Error updating loyalty points:', error);
          return null;
        }

        const result: LoyaltyPoints = {
          id: data.id,
          phoneNumber: data.phone_number,
          customerName: data.customer_name,
          totalPoints: parseFloat(data.total_points),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        return result;
      } else {
        // Create new loyalty points record
        const { data, error } = await supabase
          .from('loyalty_points')
          .insert({
            phone_number: phoneNumber,
            customer_name: customerName,
            total_points: pointsToAdd
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating loyalty points:', error);
          return null;
        }

        const created: LoyaltyPoints = {
          id: data.id,
          phoneNumber: data.phone_number,
          customerName: data.customer_name,
          totalPoints: parseFloat(data.total_points),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        return created;
      }
    } catch (error) {
      console.error('Error creating/updating loyalty points:', error);
      return null;
    }
  }

  async redeemLoyaltyPoints(phoneNumber: string, pointsToRedeem: number): Promise<LoyaltyPoints | null> {
    try {
      const existingPoints = await this.getLoyaltyPoints(phoneNumber);
      
      if (!existingPoints || existingPoints.totalPoints < pointsToRedeem) {
        return null; // Not enough points
      }

      const newTotalPoints = existingPoints.totalPoints - pointsToRedeem;
      const { data, error } = await supabase
        .from('loyalty_points')
        .update({
          total_points: newTotalPoints
        })
        .eq('phone_number', phoneNumber)
        .select()
        .single();

      if (error) {
        console.error('Error redeeming loyalty points:', error);
        return null;
      }

      const result: LoyaltyPoints = {
        id: data.id,
        phoneNumber: data.phone_number,
        customerName: data.customer_name,
        totalPoints: parseFloat(data.total_points),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      // Log spend transaction
      await this.logPointsTransaction({
        phoneNumber,
        amount: -Math.abs(pointsToRedeem),
        type: 'spend',
        reason: 'Redeem at checkout',
      });
      return result;
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      return null;
    }
  }

  // Award points when order is delivered (0.05 points per 1 TND)
  // Only award points if the order was NOT paid with points
  async awardPointsForDeliveredOrder(order: Order): Promise<boolean> {
    try {
      // Don't award points if the order was paid with points
      if (order.paymentMethod === 'points') {
        console.log('Order was paid with points, no loyalty points awarded');
        return false;
      }

      const pointsToAward = order.totalPrice * 0.05; // 0.05 points per 1 TND
      const result = await this.createOrUpdateLoyaltyPoints(
        order.phoneNumber,
        order.customerName,
        pointsToAward
      );
      if (result) {
        await this.logPointsTransaction({
          phoneNumber: order.phoneNumber,
          amount: Math.abs(pointsToAward),
          type: 'earn',
          reason: 'Order delivered',
          relatedOrderId: order.id,
        });
      }
      return result !== null;
    } catch (error) {
      console.error('Error awarding points for delivered order:', error);
      return false;
    }
  }
}

export const supabaseStore = new SupabaseStore();