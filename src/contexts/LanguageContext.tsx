'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations } from '@/types';

const translations: Record<Language, Translations> = {
  en: {
    // Header
    orderNow: 'Order Now',
    admin: 'Admin',
    premiumSandwichShop: 'Premium Sandwich Shop',
    
    // Main page
    buildYourPerfectSandwich: 'Build Your Perfect Sandwich',
    chooseYourBread: 'Choose Your Bread',
    addToppings: 'Add Toppings',
    orderSummary: 'Order Summary',
    bread: 'Bread:',
    toppings: 'Toppings:',
    total: 'Total:',
    checkout: 'Checkout',
    selectBreadFirst: 'Select Bread First',
    completeYourOrder: 'Complete Your Order',
    fullName: 'Full Name',
    enterYourFullName: 'Enter your full name',
    phoneNumber: 'Phone Number',
    enterYourPhoneNumber: 'Enter your phone number',
    orderTotal: 'Order Total:',
    cancel: 'Cancel',
    placeOrder: 'Place Order',
    pleaseSelectBread: 'Please select a bread type first!',
    pleaseFillAllFields: 'Please fill in all required fields!',
    processing: 'Processing...',
    
    // Order confirmation
    orderConfirmed: 'Order Confirmed!',
    thankYou: 'Thank you,',
    orderReceived: 'Your order has been received. We will contact you at',
    contactYouShortly: 'shortly.',
    estimatedTime: '🕒 Estimated preparation time: 15-20 minutes',
    orderAnotherSandwich: 'Order Another Sandwich',
    
    // Admin
    adminLogin: 'Admin Login',
    accessManagementDashboard: 'Access the management dashboard',
    username: 'Username',
    enterUsername: 'Enter username',
    password: 'Password',
    enterPassword: 'Enter password',
    login: 'Login',
    demoCredentials: 'Demo credentials:',
    adminDashboard: 'Admin Dashboard',
    logout: 'Logout',
    manageBreads: 'Manage Breads',
    manageToppings: 'Manage Toppings',
    viewOrders: 'View Orders',
    addNewBread: 'Add New Bread',
    addNewTopping: 'Add New Topping',
    name: 'Name',
    price: 'Price',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    areYouSureDelete: 'Are you sure you want to delete this',
    noOrdersYet: 'No orders yet',
    customerOrders: 'Customer Orders',
    editBread: 'Edit Bread',
    breadName: 'Bread Name',
    enterBreadName: 'Enter bread name',
    priceDollar: 'Price (TND)',
    update: 'Update',
    add: 'Add',
    editTopping: 'Edit Topping',
    toppingName: 'Topping Name',
    enterToppingName: 'Enter topping name',
    updateTopping: 'Update Topping',
    addTopping: 'Add Topping',
    
    // Topping Categories
    toppingCategory: 'Topping Category',
    salads: 'Salads',
    meats: 'Meats',
    condiments: 'Condiments',
    extra: 'Extra Toppings',
    allCategories: 'All Categories',
    
    // Cart
    cart: 'Cart',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove from Cart',
    cartEmpty: 'Your cart is empty',
    proceedToCheckout: 'Proceed to Checkout',
    itemsInCart: 'items in cart',
    clearCart: 'Clear Cart',
    
    // Order Status
    orderStatus: 'Order Status',
    awaitingConfirmation: 'Awaiting Confirmation',
    confirmed: 'Confirmed',
    inPreparation: 'In Preparation',
    delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    updateStatus: 'Update Status',
    deliveredOrders: 'Delivered Orders',
    cancelledOrders: 'Cancelled Orders',
    deliveryTime: 'Delivery Time',
    cancelOrder: 'Cancel Order',
    uncancelOrder: 'Uncancel Order',
    
    // Image Management
    image: 'Image',
    uploadImage: 'Upload Image',
    changeImage: 'Change Image',
    removeImage: 'Remove Image',
    imagePreview: 'Image Preview',
    selectImage: 'Select Image',
    imageUrl: 'Image URL',
    enterImageUrl: 'Enter image URL',
    
    // Cart Page
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    backToCart: 'Back to Cart',
    
    // Loyalty Points
    loyaltyPoints: 'Loyalty Points',
    availablePoints: 'Available Points',
    payWithPoints: 'Pay with Points',
    pointsNeeded: 'Points Needed',
    notEnoughPoints: 'Not enough points available',
    pointsEarned: 'Points Earned',
    redeemPoints: 'Redeem Points',
    
    // Payment Method
    paymentMethod: 'Payment Method',
    paidWithPoints: 'Paid with Points',
    paidWithCash: 'Paid with Cash',
    
    // User Activity / Rewards
    checkActivity: 'Check Activity',
    myActivityTitle: 'My Activity',
    myActivitySubtitle: 'Track your spending and loyalty points.',
    viewMyActivity: 'View My Activity',

    // Customers
    customers: 'Customers',
    searchByPhone: 'Search by Phone Number',
    totalSpentCash: 'Total Spent (Cash)',
    pointsSpentLabel: 'Points Spent',
    pointsBalance: 'Points Balance',
    pastOrders: 'Past Orders',
    pointsHistory: 'Points History',
    loading: 'Loading...',
    noOrders: 'No orders',
    noTransactions: 'No transactions',
    date: 'Date',
    breadLabel: 'Bread',
    totalLabel: 'Total',
    status: 'Status',
    payment: 'Payment',

    // Preloader
    preloadingTitle: 'Building your sandwich...',
    preloadingSubtitle: 'Preheating grill and loading fresh images',
    preloadingTip: 'Tip: Try paying with points after a few orders!'
  },
  fr: {
    // Header
    orderNow: 'Commander',
    admin: 'Admin',
    premiumSandwichShop: 'Sandwicherie Premium',
    
    // Main page
    buildYourPerfectSandwich: 'Créez Votre Sandwich Parfait',
    chooseYourBread: 'Choisissez Votre Pain',
    addToppings: 'Ajoutez des Garnitures',
    orderSummary: 'Résumé de la Commande',
    bread: 'Pain:',
    toppings: 'Garnitures:',
    total: 'Total:',
    checkout: 'Commander',
    selectBreadFirst: 'Sélectionnez d\'abord un pain',
    completeYourOrder: 'Finalisez Votre Commande',
    fullName: 'Nom Complet',
    enterYourFullName: 'Entrez votre nom complet',
    phoneNumber: 'Numéro de Téléphone',
    enterYourPhoneNumber: 'Entrez votre numéro de téléphone',
    orderTotal: 'Total de la Commande:',
    cancel: 'Annuler',
    placeOrder: 'Passer la Commande',
    pleaseSelectBread: 'Veuillez d\'abord sélectionner un type de pain!',
    pleaseFillAllFields: 'Veuillez remplir tous les champs requis!',
    processing: 'Traitement en cours...',
    
    // Order confirmation
    orderConfirmed: 'Commande Confirmée!',
    thankYou: 'Merci,',
    orderReceived: 'Votre commande a été reçue. Nous vous contacterons au',
    contactYouShortly: 'sous peu.',
    estimatedTime: '🕒 Temps de préparation estimé: 15-20 minutes',
    orderAnotherSandwich: 'Commander un Autre Sandwich',
    
    // Admin
    adminLogin: 'Connexion Admin',
    accessManagementDashboard: 'Accéder au tableau de bord de gestion',
    username: 'Nom d\'utilisateur',
    enterUsername: 'Entrez le nom d\'utilisateur',
    password: 'Mot de passe',
    enterPassword: 'Entrez le mot de passe',
    login: 'Se connecter',
    demoCredentials: 'Identifiants de démonstration:',
    adminDashboard: 'Tableau de Bord Admin',
    logout: 'Se déconnecter',
    manageBreads: 'Gérer les Pains',
    manageToppings: 'Gérer les Garnitures',
    viewOrders: 'Voir les Commandes',
    addNewBread: 'Ajouter un Nouveau Pain',
    addNewTopping: 'Ajouter une Nouvelle Garniture',
    name: 'Nom',
    price: 'Prix',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    areYouSureDelete: 'Êtes-vous sûr de vouloir supprimer ce',
    noOrdersYet: 'Aucune commande pour le moment',
    customerOrders: 'Commandes Clients',
    editBread: 'Modifier le Pain',
    breadName: 'Nom du Pain',
    enterBreadName: 'Entrez le nom du pain',
    priceDollar: 'Prix (TND)',
    update: 'Mettre à jour',
    add: 'Ajouter',
    editTopping: 'Modifier la Garniture',
    toppingName: 'Nom de la Garniture',
    enterToppingName: 'Entrez le nom de la garniture',
    updateTopping: 'Mettre à jour la Garniture',
    addTopping: 'Ajouter la Garniture',
    
    // Topping Categories
    toppingCategory: 'Catégorie de Garniture',
    salads: 'Salades',
    meats: 'Viandes',
    condiments: 'Condiments',
    extra: 'Garnitures Supplémentaires',
    allCategories: 'Toutes les Catégories',
    
    // Cart
    cart: 'Panier',
    addToCart: 'Ajouter au Panier',
    removeFromCart: 'Retirer du Panier',
    cartEmpty: 'Votre panier est vide',
    proceedToCheckout: 'Passer à la Caisse',
    itemsInCart: 'articles dans le panier',
    clearCart: 'Vider le Panier',
    
    // Order Status
    orderStatus: 'Statut de la Commande',
    awaitingConfirmation: 'En Attente de Confirmation',
    confirmed: 'Confirmée',
    inPreparation: 'En Préparation',
    delivery: 'En Livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    updateStatus: 'Mettre à jour le Statut',
    deliveredOrders: 'Commandes Livrées',
    cancelledOrders: 'Commandes Annulées',
    deliveryTime: 'Heure de Livraison',
    cancelOrder: 'Annuler la Commande',
    uncancelOrder: 'Rétablir la Commande',
    
    // Image Management
    image: 'Image',
    uploadImage: 'Télécharger une Image',
    changeImage: 'Changer l\'Image',
    removeImage: 'Supprimer l\'Image',
    imagePreview: 'Aperçu de l\'Image',
    selectImage: 'Sélectionner une Image',
    imageUrl: 'URL de l\'Image',
    enterImageUrl: 'Entrez l\'URL de l\'image',
    
    // Cart Page
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    free: 'Gratuit',
    backToCart: 'Retour au Panier',
    
    // Loyalty Points
    loyaltyPoints: 'Points de Fidélité',
    availablePoints: 'Points Disponibles',
    payWithPoints: 'Payer avec les Points',
    pointsNeeded: 'Points Nécessaires',
    notEnoughPoints: 'Points insuffisants disponibles',
    pointsEarned: 'Points Gagnés',
    redeemPoints: 'Utiliser les Points',
    
    // Payment Method
    paymentMethod: 'Méthode de Paiement',
    paidWithPoints: 'Payé avec les Points',
    paidWithCash: 'Payé en Espèces',
    
    // User Activity / Rewards
    checkActivity: 'Consulter mon activité',
    myActivityTitle: 'Mon Activité',
    myActivitySubtitle: 'Suivez vos dépenses et vos points de fidélité.',
    viewMyActivity: 'Voir mon activité',

    // Customers
    customers: 'Clients',
    searchByPhone: 'Rechercher par numéro de téléphone',
    totalSpentCash: 'Total dépensé (Espèces)',
    pointsSpentLabel: 'Points dépensés',
    pointsBalance: 'Solde de points',
    pastOrders: 'Commandes passées',
    pointsHistory: 'Historique des points',
    loading: 'Chargement...',
    noOrders: 'Aucune commande',
    noTransactions: 'Aucune transaction',
    date: 'Date',
    breadLabel: 'Pain',
    totalLabel: 'Total',
    status: 'Statut',
    payment: 'Paiement',

    // Preloader
    preloadingTitle: 'On prépare votre sandwich...',
    preloadingSubtitle: 'Préchauffage du grill et chargement des images fraîches',
    preloadingTip: 'Astuce : Essayez de payer avec des points après quelques commandes !'
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
