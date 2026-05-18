"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getMe, syncCartWithDB, getSavedCart } from "@/lib/actions";


export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
  category?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => boolean;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => boolean;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  subTotal: number;
  discountAmount: number;
  totalPrice: number;
  totalItems: number;
  user: any;
  // Audio Notifications logic
  isSoundEnabled: boolean;
  setIsSoundEnabled: (val: boolean) => void;
  isAudioUnlocked: boolean;
  playNotification: () => void;
  refreshUser: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  initialUser = null
}: {
  children: ReactNode,
  initialUser?: any
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<any>(initialUser);

  // Sound States
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Load sound and cart from localStorage
  const initCartAndSound = async () => {
    // 1. Audio Prep
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio("/assets/notification.mp3");
      audioRef.current.load();
    }

    // 2. Load Sound Pref
    const savedSound = localStorage.getItem("admin_sound_enabled");
    if (savedSound === "true") {
      setIsSoundEnabled(true);
    }

    // 3. Load Cart
    const savedCart = localStorage.getItem("breadgift_cart");
    let initialItems: CartItem[] = [];
    if (savedCart) {
      try {
        initialItems = JSON.parse(savedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
      }
    }

    // 4. Sync user from server
    const currentUser = await getMe();
    setUser(currentUser);

    // FIX: Jika login sebagai admin, hapus keranjang localStorage agar tidak mengganggu
    if (currentUser?.role === 'admin') {
      localStorage.removeItem("breadgift_cart");
      setCartItems([]);
      setIsInitialized(true);
      return;
    }

    if (currentUser) {
      const dbItems = await getSavedCart();
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
    initCartAndSound();
  }, []);

  // Global Click Listener to "Unlock" Audio Context (SALAH SATU KALI SAJA)
  useEffect(() => {
    const handleGlobalClick = () => {
      // Hanya coba unlock jika SUARA AKTIF dan BELUM TERBUKA
      if (isSoundEnabled && !isAudioUnlocked && audioRef.current) {
        // Trick: Play sebentar saja dengan volume nol agar browser mengizinkan audio
        const originalVolume = audioRef.current.volume;
        audioRef.current.volume = 0;
        audioRef.current.play()
          .then(() => {
            // Langsung hentikan setelah sukses unlock
            audioRef.current?.pause();
            audioRef.current!.volume = originalVolume;
            setIsAudioUnlocked(true);
          })
          .catch(() => {
            audioRef.current!.volume = originalVolume;
          });
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [isAudioUnlocked, isSoundEnabled]);

  // Persist sound preference
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("admin_sound_enabled", isSoundEnabled.toString());
    }
  }, [isSoundEnabled, isInitialized]);

  const playNotification = () => {
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
  };

  // Sync with DB whenever cart changes and user is logged in
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem("breadgift_cart", JSON.stringify(cartItems));

    const timeoutId = setTimeout(async () => {
      if (user) {
        await syncCartWithDB(cartItems);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [cartItems, isInitialized, user]);

  const refreshCart = async () => {
    await initCartAndSound();
  };

  const refreshUser = async () => {
    const currentUser = await getMe();
    setUser(currentUser);
  };

  const addToCart = (product: any) => {
    // FIX: Admin tidak boleh nambah ke keranjang landing page
    if (user?.role === 'admin') return false;

    let success = true;
    setCartItems((prevItems: CartItem[]) => {
      const existingItem = prevItems.find((item: CartItem) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          success = false;
          return prevItems;
        }
        return prevItems.map((item: CartItem) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stock <= 0) {
        success = false;
        return prevItems;
      }
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
          stock: product.stock,
          category: product.category,
        },
      ];
    });
    return success;
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems: CartItem[]) => prevItems.filter((item: CartItem) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    let success = true;
    setCartItems((prevItems: CartItem[]) => {
      const item = prevItems.find(i => i.id === productId);
      if (item && quantity > item.quantity) {
        if (quantity > item.stock) {
          success = false;
          return prevItems;
        }
      }
      if (quantity <= 0) {
        return prevItems.filter(i => i.id !== productId);
      }
      return prevItems.map((item: CartItem) => (item.id === productId ? { ...item, quantity } : item));
    });
    return success;
  };

  const clearCart = () => {
    setCartItems([]);
    setIsCartOpen(false);
    localStorage.removeItem("breadgift_cart");
  };

  const subTotal = cartItems.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  
  const promoItems = cartItems.filter(item => item.category === 'Roti Isi' || item.category === 'Donat');
  const promoQuantity = promoItems.reduce((sum, item) => sum + item.quantity, 0);
  const discountAmount = (promoQuantity > 0 && promoQuantity % 3 === 0)
    ? (promoQuantity / 3) * 2000
    : 0;
  
  const totalPrice = subTotal - discountAmount;
  
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
        subTotal,
        discountAmount,
        totalPrice,
        totalItems,
        user,
        isSoundEnabled,
        setIsSoundEnabled,
        isAudioUnlocked,
        playNotification,
        refreshUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  // Jika di server, kita kembalikan context kosong agar tidak crash saat SSR
  // Tapi tetap berikan peringatan jika di client memang benar-benar hilang
  if (context === undefined) {
    if (typeof window !== "undefined") {
      console.warn("⚠️ useCart used outside of CartProvider!");
    }
    // Return full mock object to prevent destructuring & runtime errors (.map etc)
    return {
      cartItems: [],
      addToCart: () => false,
      removeFromCart: () => { },
      updateQuantity: () => false,
      clearCart: () => { },
      refreshCart: async () => { },
      isCartOpen: false,
      setIsCartOpen: () => { },
      subTotal: 0,
      discountAmount: 0,
      totalPrice: 0,
      totalItems: 0,
      user: null,
      isSoundEnabled: false,
      setIsSoundEnabled: () => { },
      isAudioUnlocked: false,
      playNotification: () => { },
      refreshUser: async () => { },
    } as CartContextType;
  }
  return context;
}
