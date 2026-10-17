import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const local = localStorage.getItem('edumart_cart_items');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedForLater, setSavedForLater] = useState(() => {
    try {
      const local = localStorage.getItem('edumart_cart_saved');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const local = localStorage.getItem('edumart_cart_coupon');
      return local ? JSON.parse(local) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edumart_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      // storage unavailable
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('edumart_cart_saved', JSON.stringify(savedForLater));
    } catch (e) {
      // storage unavailable
    }
  }, [savedForLater]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('edumart_cart_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('edumart_cart_coupon');
      }
    } catch (e) {
      // storage unavailable
    }
  }, [appliedCoupon]);

  // Sync with backend API when user logs in
  const syncWithServer = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.data) {
        if (res.data.items && res.data.items.length > 0) {
          setCartItems(res.data.items);
        }
        if (res.data.saved_for_later) {
          setSavedForLater(res.data.saved_for_later);
        }
      }
    } catch (err) {
      console.warn('Backend cart sync note:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      syncWithServer();
    }
  }, [user, syncWithServer]);

  // Financial Calculations
  const subtotal = parseFloat(
    cartItems
      .reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1), 0)
      .toFixed(2)
  );

  const cartCount = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 1), 0);
  const hasPhysicalItems = cartItems.some((item) => item.is_physical);
  const shippingCost = hasPhysicalItems ? 4.5 : 0.0;
  const taxAmount = parseFloat((subtotal * 0.05).toFixed(2));

  // Calculate coupon discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * parseFloat(appliedCoupon.discount_value)) / 100;
      if (appliedCoupon.max_discount && discountAmount > parseFloat(appliedCoupon.max_discount)) {
        discountAmount = parseFloat(appliedCoupon.max_discount);
      }
    } else {
      discountAmount = Math.min(subtotal, parseFloat(appliedCoupon.discount_value) || 0);
    }
    discountAmount = parseFloat(discountAmount.toFixed(2));
  }

  const totalAmount = parseFloat(
    Math.max(0, subtotal + shippingCost + taxAmount - discountAmount).toFixed(2)
  );

  // Cart operations
  const addToCart = async (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
    const productId = product.id || product.product_id;
    const title = product.title || product.product_title || 'Educational Resource';
    const price = parseFloat(product.price || product.unit_price) || 0.0;
    const isDigital = product.is_digital !== undefined ? product.is_digital : (product.format !== 'physical');
    const isPhysical = product.is_physical !== undefined ? product.is_physical : (product.format === 'physical' || product.format === 'both');

    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (i) => (productId && i.product_id === productId) || i.title === title
      );
      if (existingIdx > -1) {
        const copy = [...prevItems];
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: copy[existingIdx].quantity + qtyToAdd,
        };
        return copy;
      } else {
        return [
          ...prevItems,
          {
            product_id: productId || `item-${Date.now()}`,
            title,
            price,
            quantity: qtyToAdd,
            is_digital: isDigital,
            is_physical: isPhysical,
            subject: product.subject || 'General Education',
            grade_level: product.grade_level || 'All Grades',
          },
        ];
      }
    });

    if (user) {
      try {
        await cartService.addItem({
          product_id: productId,
          title,
          price,
          quantity: qtyToAdd,
          is_digital: isDigital,
          is_physical: isPhysical,
          subject: product.subject,
          grade_level: product.grade_level,
        });
      } catch (err) {
        // Local state already updated
      }
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    setCartItems((prevItems) => {
      if (qty <= 0 || isNaN(qty)) {
        return prevItems.filter((i) => i.product_id !== productId && i.title !== productId);
      }
      return prevItems.map((i) =>
        i.product_id === productId || i.title === productId ? { ...i, quantity: qty } : i
      );
    });

    if (user) {
      try {
        await cartService.updateQuantity(productId, qty);
      } catch (err) {
        // Fallback
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((i) => i.product_id !== productId && i.title !== productId)
    );

    if (user) {
      try {
        await cartService.removeItem(productId);
      } catch (err) {
        // Fallback
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('edumart_cart_items');
    localStorage.removeItem('edumart_cart_coupon');

    if (user) {
      try {
        await cartService.clearCart();
      } catch (err) {
        // Fallback
      }
    }
  };

  const toggleSaveForLater = async (productId) => {
    const inCart = cartItems.find((i) => i.product_id === productId || i.title === productId);
    if (inCart) {
      setCartItems((prev) => prev.filter((i) => i.product_id !== productId && i.title !== productId));
      setSavedForLater((prev) => [...prev, inCart]);
    } else {
      const inSaved = savedForLater.find((i) => i.product_id === productId || i.title === productId);
      if (inSaved) {
        setSavedForLater((prev) => prev.filter((i) => i.product_id !== productId && i.title !== productId));
        setCartItems((prev) => [...prev, inSaved]);
      }
    }

    if (user) {
      try {
        await cartService.toggleSaveForLater(productId);
      } catch (err) {
        // Fallback
      }
    }
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      throw new Error('Please enter a coupon code');
    }
    const res = await cartService.validateCoupon(code, subtotal);
    if (res.valid && res.data) {
      setAppliedCoupon(res.data);
      return res.data;
    }
    throw new Error('Invalid coupon code');
  };

  const removeFromSavedForLater = (productId) => {
    setSavedForLater((prev) =>
      prev.filter((i) => i.product_id !== productId && i.title !== productId)
    );
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('edumart_cart_coupon');
  };

  const value = {
    cartItems,
    savedForLater,
    appliedCoupon,
    loading,
    cartCount,
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    totalAmount,
    hasPhysicalItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleSaveForLater,
    removeFromSavedForLater,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
