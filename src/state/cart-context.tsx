'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
} from '@/services';
import type { CartDto } from '@/types/api';

export interface CartContextValue {
  cart: CartDto;
  isLoading: boolean;
  errorMessage: string | null;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  clearAll: () => Promise<boolean>;
}

const EMPTY_CART: CartDto = {
  items: [],
  item_count: 0,
  subtotal_vnd: 0,
  updated_at: '',
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartDto>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    const res = await getCart();
    setIsLoading(false);
    if (res.ok) {
      setCart(res.data);
      setErrorMessage(null);
    } else {
      setErrorMessage(res.error.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getCart().then((res) => {
      if (active && res.ok) {
        setCart(res.data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await addToCart({ product_id: productId, quantity });
    setIsLoading(false);
    if (!res.ok) {
      setErrorMessage(res.error.message);
      return false;
    }
    setCart(res.data);
    return true;
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await removeFromCart({ product_id: productId });
    setIsLoading(false);
    if (!res.ok) {
      setErrorMessage(res.error.message);
      return false;
    }
    setCart(res.data);
    return true;
  }, []);

  const clearAll = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await clearCart();
    setIsLoading(false);
    if (!res.ok) {
      setErrorMessage(res.error.message);
      return false;
    }
    setCart(res.data);
    return true;
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      errorMessage,
      refreshCart,
      addItem,
      removeItem,
      clearAll,
    }),
    [cart, isLoading, errorMessage, refreshCart, addItem, removeItem, clearAll]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
