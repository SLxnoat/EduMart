import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      savedForLater: [],
      appliedCoupon: null,
      loading: false,
      cartCount: 0,
      subtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      hasPhysicalItems: false,
      addToCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      toggleSaveForLater: () => {},
      removeFromSavedForLater: () => {},
      applyCoupon: () => {},
      removeCoupon: () => {},
    };
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const local = localStorage.getItem('edumart_cart_items');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacy = localStorage.getItem('cart');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          return parsedLegacy.map((item) => ({
            product_id: item.id || item.product_id,
            title: item.title,
            price: parseFloat(item.price) || 0,
            quantity: item.quantity || 1,
            is_digital: item.format !== 'physical',
            is_physical: item.format === 'physical' || item.format === 'both',
            subject: item.subject,
            grade_level: item.grade_level,
          }));
        }
      }
      return [];
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
      const legacyCart = cartItems.map((item) => ({
        id: item.product_id,
        product_id: item.product_id,
        title: item.title,
        price: parseFloat(item.price) || 0,
        format: item.is_physical ? (item.is_digital ? 'both' : 'physical') : 'digital',
        subject: item.subject,
        grade_level: item.grade_level,
        quantity: item.quantity,
      }));
      localStorage.setItem('cart', JSON.stringify(legacyCart));
    } catch (e) {
      // storage unavailable
    }
  }, [cartItems]);

  // Synchronize cart across components and windows via native storage event
  useEffect(() => {
    const handleStorage = (e) => {
      // Do not process intra-window synthetic events that lack a key
      if (!e.key) return;

      if (e.key === 'edumart_cart_items') {
        try {
          const edumartLocal = localStorage.getItem('edumart_cart_items');
          if (edumartLocal) {
            const parsed = JSON.parse(edumartLocal);
            if (Array.isArray(parsed)) {
              setCartItems(parsed);
              return;
            }
          }
        } catch (_) {}
      } else if (e.key === 'cart') {
        try {
          const legacy = localStorage.getItem('cart');
          if (legacy) {
            const parsed = JSON.parse(legacy);
            if (Array.isArray(parsed)) {
              setCartItems(
                parsed.map((item) => ({
                  id: item.id || item.product_id,
                  product_id: item.id || item.product_id,
                  title: item.title,
                  price: parseFloat(item.price) || 0,
                  quantity: item.quantity || 1,
                  is_digital: item.format !== 'physical',
                  is_physical: item.format === 'physical' || item.format === 'both',
                  subject: item.subject,
                  grade_level: item.grade_level,
                }))
              );
            }
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
        (i) => (productId && (i.product_id === productId || i.id === productId)) || i.title === title
      );
      let updated;
      if (existingIdx > -1) {
        const copy = [...prevItems];
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: copy[existingIdx].quantity + qtyToAdd,
        };
        updated = copy;
      } else {
        updated = [
          ...prevItems,
          {
            id: productId || `item-${Date.now()}`,
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

      try {
        localStorage.setItem('edumart_cart_items', JSON.stringify(updated));
        const legacyCart = updated.map((item) => ({
          id: item.product_id || item.id,
          product_id: item.product_id || item.id,
          title: item.title,
          price: parseFloat(item.price) || 0,
          format: item.is_physical ? (item.is_digital ? 'both' : 'physical') : 'digital',
          subject: item.subject,
          grade_level: item.grade_level,
          quantity: item.quantity,
        }));
        localStorage.setItem('cart', JSON.stringify(legacyCart));
      } catch (e) {}

      return updated;
    });

    if (user) {
      try {
        const res = await cartService.addItem({
          product_id: productId,
          productId: productId,
          title,
          price,
          quantity: qtyToAdd,
          is_digital: isDigital,
          is_physical: isPhysical,
          subject: product.subject,
          grade_level: product.grade_level,
        });
        if (res && res.data && Array.isArray(res.data.items)) {
          setCartItems(res.data.items);
        }
      } catch (err) {
        // Local state already updated
      }
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    setCartItems((prevItems) => {
      let updated;
      if (qty <= 0 || isNaN(qty)) {
        updated = prevItems.filter((i) => i.product_id !== productId && i.id !== productId && i.title !== productId);
      } else {
        updated = prevItems.map((i) =>
          (i.product_id === productId || i.id === productId || i.title === productId) ? { ...i, quantity: qty } : i
        );
      }

      try {
        localStorage.setItem('edumart_cart_items', JSON.stringify(updated));
        const legacyCart = updated.map((item) => ({
          id: item.product_id || item.id,
          product_id: item.product_id || item.id,
          title: item.title,
          price: parseFloat(item.price) || 0,
          format: item.is_physical ? (item.is_digital ? 'both' : 'physical') : 'digital',
          subject: item.subject,
          grade_level: item.grade_level,
          quantity: item.quantity,
        }));
        localStorage.setItem('cart', JSON.stringify(legacyCart));
      } catch (e) {}

      return updated;
    });

    if (user) {
      try {
        const res = await cartService.updateQuantity(productId, qty);
        if (res && res.data && Array.isArray(res.data.items)) {
          setCartItems(res.data.items);
        }
      } catch (err) {
        // Fallback
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems((prevItems) => {
      const updated = prevItems.filter((i) => i.product_id !== productId && i.id !== productId && i.title !== productId);

      try {
        localStorage.setItem('edumart_cart_items', JSON.stringify(updated));
        const legacyCart = updated.map((item) => ({
          id: item.product_id || item.id,
          product_id: item.product_id || item.id,
          title: item.title,
          price: parseFloat(item.price) || 0,
          format: item.is_physical ? (item.is_digital ? 'both' : 'physical') : 'digital',
          subject: item.subject,
          grade_level: item.grade_level,
          quantity: item.quantity,
        }));
        localStorage.setItem('cart', JSON.stringify(legacyCart));
      } catch (e) {}

      return updated;
    });

    if (user) {
      try {
        const res = await cartService.removeItem(productId);
        if (res && res.data && Array.isArray(res.data.items)) {
          setCartItems(res.data.items);
        }
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
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('storage'));

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

  const removeFromSavedForLater = async (productId) => {
    setSavedForLater((prev) =>
      prev.filter((i) => i.product_id !== productId && i.title !== productId)
    );

    if (user) {
      try {
        await cartService.removeItem(productId);
      } catch (err) {
        // Fallback
      }
    }
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
