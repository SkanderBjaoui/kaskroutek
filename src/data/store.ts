import { Bread, Topping, Order, OrderStatus } from '@/types';

// Temporary data store - will be replaced with Supabase later
export class DataStore {
  private static instance: DataStore;
  private breads: Bread[] = [
    { id: '1', name: 'White Bread, Pain Blanc', nameEn: 'White Bread', nameFr: 'Pain Blanc', price: 2.50, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop' },
    { id: '2', name: 'Whole Wheat, Pain Complet', nameEn: 'Whole Wheat', nameFr: 'Pain Complet', price: 3.00, imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop' },
    { id: '3', name: 'Rye Bread, Pain de Seigle', nameEn: 'Rye Bread', nameFr: 'Pain de Seigle', price: 3.50, imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=200&fit=crop' },
    { id: '4', name: 'Sourdough, Pain au Levain', nameEn: 'Sourdough', nameFr: 'Pain au Levain', price: 4.00, imageUrl: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=300&h=200&fit=crop' },
    { id: '5', name: 'Multigrain, Pain Multi-Céréales', nameEn: 'Multigrain', nameFr: 'Pain Multi-Céréales', price: 3.75, imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop' },
  ];

  private toppings: Topping[] = [
    { id: '1', name: 'Lettuce, Laitue', nameEn: 'Lettuce', nameFr: 'Laitue', price: 0.50, imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&h=200&fit=crop', category: 'salads' },
    { id: '2', name: 'Tomato, Tomate', nameEn: 'Tomato', nameFr: 'Tomate', price: 0.75, imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop', category: 'salads' },
    { id: '3', name: 'Onion, Oignon', nameEn: 'Onion', nameFr: 'Oignon', price: 0.50, imageUrl: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=200&h=200&fit=crop', category: 'salads' },
    { id: '4', name: 'Bacon, Bacon', nameEn: 'Bacon', nameFr: 'Bacon', price: 2.00, imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop', category: 'meats' },
    { id: '5', name: 'Avocado, Avocat', nameEn: 'Avocado', nameFr: 'Avocat', price: 1.50, imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop', category: 'salads' },
    { id: '6', name: 'Extra Cheese, Fromage Supplémentaire', nameEn: 'Extra Cheese', nameFr: 'Fromage Supplémentaire', price: 1.00, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop', category: 'extra' },
    { id: '7', name: 'Cucumber, Concombre', nameEn: 'Cucumber', nameFr: 'Concombre', price: 0.50, imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&h=200&fit=crop', category: 'salads' },
    { id: '8', name: 'Pickles, Cornichons', nameEn: 'Pickles', nameFr: 'Cornichons', price: 0.50, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop', category: 'condiments' },
    { id: '9', name: 'Jalapeños, Jalapeños', nameEn: 'Jalapeños', nameFr: 'Jalapeños', price: 0.75, imageUrl: 'https://images.unsplash.com/photo-1609501676725-7186f3a1a2d1?w=200&h=200&fit=crop', category: 'condiments' },
    { id: '10', name: 'Mushrooms, Champignons', nameEn: 'Mushrooms', nameFr: 'Champignons', price: 1.25, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop', category: 'salads' },
  ];

  private orders: Order[] = [];

  private constructor() {}

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  // Bread methods
  getBreads(): Bread[] {
    return [...this.breads];
  }

  addBread(bread: Omit<Bread, 'id'>): Bread {
    const newBread: Bread = {
      ...bread,
      id: (this.breads.length + 1).toString(),
    };
    this.breads.push(newBread);
    return newBread;
  }

  updateBread(id: string, updates: Partial<Omit<Bread, 'id'>>): Bread | null {
    const index = this.breads.findIndex(bread => bread.id === id);
    if (index === -1) return null;
    
    this.breads[index] = { ...this.breads[index], ...updates };
    return this.breads[index];
  }

  deleteBread(id: string): boolean {
    const index = this.breads.findIndex(bread => bread.id === id);
    if (index === -1) return false;
    
    this.breads.splice(index, 1);
    return true;
  }

  // Topping methods
  getToppings(): Topping[] {
    return [...this.toppings];
  }

  addTopping(topping: Omit<Topping, 'id'>): Topping {
    const newTopping: Topping = {
      ...topping,
      id: (this.toppings.length + 1).toString(),
    };
    this.toppings.push(newTopping);
    return newTopping;
  }

  updateTopping(id: string, updates: Partial<Omit<Topping, 'id'>>): Topping | null {
    const index = this.toppings.findIndex(topping => topping.id === id);
    if (index === -1) return null;
    
    this.toppings[index] = { ...this.toppings[index], ...updates };
    return this.toppings[index];
  }

  deleteTopping(id: string): boolean {
    const index = this.toppings.findIndex(topping => topping.id === id);
    if (index === -1) return false;
    
    this.toppings.splice(index, 1);
    return true;
  }

  // Order methods
  getOrders(): Order[] {
    return [...this.orders];
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
    const newOrder: Order = {
      ...order,
      id: (this.orders.length + 1).toString(),
      status: 'confirmed',
      createdAt: new Date(),
      paymentMethod: order.paymentMethod || 'cash',
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  updateOrderStatus(id: string, status: OrderStatus): Order | null {
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) return null;
    
    const updatedOrder = { ...this.orders[index], status };
    if (status === 'delivered') {
      updatedOrder.deliveredAt = new Date();
    }
    
    this.orders[index] = updatedOrder;
    return updatedOrder;
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  getDeliveredOrders(): Order[] {
    return this.orders.filter(order => order.status === 'delivered');
  }
}

export const dataStore = DataStore.getInstance();
