export interface Bread {
  id: string;
  name: string; // This will store "English Name, French Name" format
  nameEn: string; // Parsed English name
  nameFr: string; // Parsed French name
  price: number;
  imageUrl?: string;
}

export type ToppingCategory = 'salads' | 'meats' | 'condiments' | 'extra';

export interface Topping {
  id: string;
  name: string; // This will store "English Name, French Name" format
  nameEn: string; // Parsed English name
  nameFr: string; // Parsed French name
  price: number;
  imageUrl?: string;
  category: ToppingCategory;
}

export type OrderStatus = 'awaiting_confirmation' | 'confirmed' | 'in_preparation' | 'delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  bread: Bread;
  toppings: Topping[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  deliveredAt?: Date;
  paymentMethod: 'cash' | 'points';
}

export interface SandwichOrder {
  bread: Bread | null;
  toppings: Topping[];
  totalPrice: number;
}

export interface CartItem {
  id: string;
  bread: Bread;
  toppings: Topping[];
  quantity: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface LoyaltyPoints {
  id: string;
  phoneNumber: string;
  customerName: string;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PointsTransactionType = 'earn' | 'spend' | 'adjustment_add' | 'adjustment_subtract';

export interface PointsTransaction {
  id: string;
  phoneNumber: string;
  amount: number; // positive for earn/add, negative for spend/subtract
  type: PointsTransactionType;
  reason?: string;
  relatedOrderId?: string;
  createdAt: Date;
}

export type Language = 'en' | 'fr';

export interface Translations {
  // Header
  orderNow: string;
  admin: string;
  premiumSandwichShop: string;
  
  // Main page
  buildYourPerfectSandwich: string;
  chooseYourBread: string;
  addToppings: string;
  orderSummary: string;
  bread: string;
  toppings: string;
  total: string;
  checkout: string;
  selectBreadFirst: string;
  completeYourOrder: string;
  fullName: string;
  enterYourFullName: string;
  phoneNumber: string;
  enterYourPhoneNumber: string;
  orderTotal: string;
  cancel: string;
  placeOrder: string;
  pleaseSelectBread: string;
  pleaseFillAllFields: string;
  processing: string;
  
  // Order confirmation
  orderConfirmed: string;
  thankYou: string;
  orderReceived: string;
  contactYouShortly: string;
  estimatedTime: string;
  orderAnotherSandwich: string;
  
  // Admin
  adminLogin: string;
  accessManagementDashboard: string;
  username: string;
  enterUsername: string;
  password: string;
  enterPassword: string;
  login: string;
  demoCredentials: string;
  adminDashboard: string;
  logout: string;
  manageBreads: string;
  manageToppings: string;
  viewOrders: string;
  addNewBread: string;
  addNewTopping: string;
  name: string;
  price: string;
  actions: string;
  edit: string;
  delete: string;
  areYouSureDelete: string;
  noOrdersYet: string;
  customerOrders: string;
  editBread: string;
  breadName: string;
  enterBreadName: string;
  priceDollar: string;
  update: string;
  add: string;
  editTopping: string;
  toppingName: string;
  enterToppingName: string;
  updateTopping: string;
  addTopping: string;
  
  // Topping Categories
  toppingCategory: string;
  salads: string;
  meats: string;
  condiments: string;
  extra: string;
  allCategories: string;
  
  // Cart
  cart: string;
  addToCart: string;
  removeFromCart: string;
  cartEmpty: string;
  proceedToCheckout: string;
  itemsInCart: string;
  clearCart: string;
  
  // Order Status
  orderStatus: string;
  awaitingConfirmation: string;
  confirmed: string;
  inPreparation: string;
  delivery: string;
  delivered: string;
  cancelled: string;
  updateStatus: string;
  deliveredOrders: string;
  cancelledOrders: string;
  deliveryTime: string;
  cancelOrder: string;
  uncancelOrder: string;
  
  // Image Management
  image: string;
  uploadImage: string;
  changeImage: string;
  removeImage: string;
  imagePreview: string;
  selectImage: string;
  imageUrl: string;
  enterImageUrl: string;
  
  // Cart Page
  subtotal: string;
  shipping: string;
  free: string;
  backToCart: string;
  
  // Loyalty Points
  loyaltyPoints: string;
  availablePoints: string;
  payWithPoints: string;
  pointsNeeded: string;
  notEnoughPoints: string;
  pointsEarned: string;
  redeemPoints: string;
  
  // Payment Method
  paymentMethod: string;
  paidWithPoints: string;
  paidWithCash: string;
  
  // User Activity / Rewards
  checkActivity: string;
  myActivityTitle: string;
  myActivitySubtitle: string;
  viewMyActivity: string;

  // Customers (Admin & User activity labels)
  customers: string;
  searchByPhone: string;
  totalSpentCash: string;
  pointsSpentLabel: string;
  pointsBalance: string;
  pastOrders: string;
  pointsHistory: string;
  loading: string;
  noOrders: string;
  noTransactions: string;
  date: string;
  breadLabel: string;
  totalLabel: string;
  status: string;
  payment: string;
}