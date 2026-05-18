"use client";

import React, { useState, useMemo } from "react";
import ProductGrid, { Product } from "@/component/admin/dashboard/ProductGrid";
import CartSummary, { CartItem } from "@/component/admin/dashboard/CartSummary";
import PaymentModal from "@/component/admin/dashboard/PaymentModal";
import Toast from "@/component/ui/Toast";
import { createTransaction } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface DashboardContainerProps {
  initialProducts: Product[];
}

export default function DashboardContainer({ 
  initialProducts 
}: DashboardContainerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "QRIS">("Tunai");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // UI State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const router = useRouter();

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleAddToCart = (product: Product) => {
    // 1. Check if product itself has stock
    if (product.stock <= 0) return;

    // 2. Check if adding one more would exceed stock
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem && cartItem.quantity >= product.stock) {
      setToastMessage("Waduh bebs, stok roti ini sudah habis!");
      setShowToast(true);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, category: product.category }];
    });

    setToastMessage("Produk berhasil ditambahkan");
    setShowToast(true);
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          
          // Prevent increasing beyond stock
          if (delta > 0 && newQty > product.stock) {
            setToastMessage("Waduh bebs, stok roti ini sudah habis!");
            setShowToast(true);
            return item;
          }

          if (newQty <= 0) return null; // Logic to handle removal will be in filter
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const handleSetQuantity = (id: number, quantity: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          let newQty = quantity;
          
          // Prevent exceeding stock
          if (newQty > product.stock) {
            setToastMessage(`Stok cuma ada ${product.stock} bebs!`);
            setShowToast(true);
            newQty = product.stock;
          }

          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => setCart([]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const onConfirmPayment = async (amountPaid: number) => {
    setIsProcessing(true);
    const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const promoItems = cart.filter(item => item.category === 'Roti Isi' || item.category === 'Donat');
    const promoQty = promoItems.reduce((sum, item) => sum + item.quantity, 0);
    const discount = (promoQty > 0 && promoQty % 3 === 0) ? (promoQty / 3) * 2000 : 0;
    const transactionTotal = cartSubtotal - discount;

    const result = await createTransaction({
      total_amount: transactionTotal,
      payment_method: paymentMethod,
      source: 'POS',
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    if (result.success) {
      setToastMessage("Transaksi Berhasil!");
      setShowToast(true);

      // Update local products state immediately for instant UI feedback
      setProducts((prev) => 
        prev.map((p: any) => {
          const cartItem = cart.find((item: any) => item.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        })
      );

      setCart([]);
      setIsPaymentModalOpen(false);
      router.refresh(); // Refresh server data as a backup
    } else {
      alert("Transaksi Gagal: " + result.error);
    }
    setIsProcessing(false);
  };

  const cartSubtotalUi = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const promoItemsUi = cart.filter((item: any) => item.category === 'Roti Isi' || item.category === 'Donat');
  const promoQtyUi = promoItemsUi.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const discountUi = (promoQtyUi > 0 && promoQtyUi % 3 === 0) ? (promoQtyUi / 3) * 2000 : 0;
  const totalAmount = cartSubtotalUi - discountUi;

  return (
    <div className="flex flex-col lg:flex-row w-full h-full lg:overflow-hidden gap-6 lg:gap-8">
      {/* Product List Section */}
      <ProductGrid 
        products={filteredProducts} 
        onAddToCart={handleAddToCart} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Cart Summary Section */}
      <CartSummary
        items={cart}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onUpdateQuantity={handleUpdateQuantity}
        onSetQuantity={handleSetQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
      />

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onConfirm={onConfirmPayment}
      />

      {/* Notifications */}
      {showToast && (
        <Toast 
          message={toastMessage}
          type="info"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
