'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Bread, Topping, ToppingCategory } from '@/types';

type ToppingQuantityMap = Record<string, number>; // toppingId -> quantity

interface BuilderState {
  selectedBread: Bread | null;
  isDoubleBread: boolean;
  toppingQuantities: ToppingQuantityMap;
}

interface BuilderContextType extends BuilderState {
  setBread: (bread: Bread) => void;
  toggleDoubleBread: () => void;
  incrementTopping: (topping: Topping) => void;
  decrementTopping: (topping: Topping) => void;
  clearBuilder: () => void;
  getSelectedToppingsArray: (allToppings: Topping[]) => Topping[];
  getCategoryQuantity: (category: ToppingCategory, allToppings: Topping[]) => number;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [selectedBread, setSelectedBread] = useState<Bread | null>(null);
  const [isDoubleBread, setIsDoubleBread] = useState<boolean>(false);
  const [toppingQuantities, setToppingQuantities] = useState<ToppingQuantityMap>({});

  const setBread = (bread: Bread) => {
    setSelectedBread(bread);
    // default to single
    setIsDoubleBread(false);
  };

  const toggleDoubleBread = () => {
    if (!selectedBread) return;
    setIsDoubleBread(prev => !prev);
  };

  const incrementTopping = (topping: Topping) => {
    setToppingQuantities(prev => ({
      ...prev,
      [topping.id]: (prev[topping.id] || 0) + 1,
    }));
  };

  const decrementTopping = (topping: Topping) => {
    setToppingQuantities(prev => {
      const current = prev[topping.id] || 0;
      const next = Math.max(0, current - 1);
      if (next === 0) {
        const clone = { ...prev };
        delete clone[topping.id];
        return clone;
      }
      return { ...prev, [topping.id]: next };
    });
  };

  const clearBuilder = () => {
    setSelectedBread(null);
    setIsDoubleBread(false);
    setToppingQuantities({});
  };

  const getSelectedToppingsArray = (allToppings: Topping[]) => {
    // Expand quantities into repeated toppings
    const expanded: Topping[] = [];
    for (const topping of allToppings) {
      const qty = toppingQuantities[topping.id] || 0;
      for (let i = 0; i < qty; i++) expanded.push(topping);
    }
    return expanded;
  };

  const getCategoryQuantity = (category: ToppingCategory, allToppings: Topping[]) => {
    return allToppings.reduce((sum, topping) => {
      if (topping.category === category) return sum + (toppingQuantities[topping.id] || 0);
      return sum;
    }, 0);
  };

  const value: BuilderContextType = useMemo(() => ({
    selectedBread,
    isDoubleBread,
    toppingQuantities,
    setBread,
    toggleDoubleBread,
    incrementTopping,
    decrementTopping,
    clearBuilder,
    getSelectedToppingsArray,
    getCategoryQuantity,
  }), [selectedBread, isDoubleBread, toppingQuantities, getSelectedToppingsArray, getCategoryQuantity, setBread, toggleDoubleBread, incrementTopping, decrementTopping, clearBuilder]);

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within a BuilderProvider');
  return ctx;
}


