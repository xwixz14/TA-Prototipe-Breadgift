"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getMe, syncCartWithDB, getSavedCart } from "@/lib/actions";


export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalPrice: number;
  totalItems: number;
  user: any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load cart from localStorage and DB on mount
  const initCart = async () => {
    // 1. Load from localStorage
    const savedCart = localStorage.getItem("breadgift_cart");
    let initialItems: CartItem[] = [];
    if (savedCart) {
      try {
        initialItems = JSON.parse(savedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
      }
    }

    // 2. Check user and load from DB
    const userData = await getMe();
    setUser(userData);

    if (userData) {
      const dbItems = await getSavedCart();
      // Merge: DB items take priority, but keep unique local items
      const merged = [...dbItems];
      initialItems.forEach(li => {
        if (!merged.find(mi => mi.id === li.id)) {
          merged.push(li);
        }
      });
      setCartItems(merged);
    } else {
      setCartItems(initialItems);
    }
    
    setIsInitialized(true);
  };

  useEffect(() => {
    initCart();
  }, []);

  // Sync with DB whenever cart changes and user is logged in (DEBOUNCED for performance)
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem("breadgift_cart", JSON.stringify(cartItems));

    // Debounce sync to DB
    const timeoutId = setTimeout(async () => {
      if (user) {
        await syncCartWithDB(cartItems);
        console.log("🛒 Cart synced to database");
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [cartItems, isInitialized, user]);

  const refreshCart = async () => {
    await initCart();
  };

  const addToCart = (product: any) => {
    setCartItems((prevItems: CartItem[]) => {
      const existingItem = prevItems.find((item: CartItem) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item: CartItem) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems: CartItem[]) => prevItems.filter((item: CartItem) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems: CartItem[]) =>
      prevItems.map((item: CartItem) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("breadgift_cart");
  };

  const totalPrice = cartItems.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((total: number, item: CartItem) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        isCartOpen,
        setIsCartOpen,
        totalPrice,
        totalItems,
        user,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
