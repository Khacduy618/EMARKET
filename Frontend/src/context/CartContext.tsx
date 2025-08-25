// src/context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { API_URL } from '@/lib/config';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItemCount: number;
  isLoading: boolean;
  fetchCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  const fetchCartCount = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItemCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/cart/count`, { withCredentials: true });
      setCartItemCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setCartItemCount(0); // Reset on error
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  const value = { cartItemCount, isLoading, fetchCartCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};