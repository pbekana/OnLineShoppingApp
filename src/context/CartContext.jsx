import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  apiGetCart,
  apiAddToCart,
  apiUpdateCartItem,
  apiRemoveCartItem,
  apiClearCart,
  apiMergeCart
} from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper to calculate totals from item list
  const updateTotals = (itemList) => {
    let qty = 0;
    let sum = 0;
    itemList.forEach((it) => {
      const q = it.quantity || 1;
      const price = it.product ? it.product.price : (it.price || 0);
      qty += q;
      sum += price * q;
    });
    setTotalQuantity(qty);
    setSubtotal(sum);
  };

  // Load backend cart
  const fetchBackendCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGetCart();
      setItems(res.items || []);
      setTotalQuantity(res.total_quantity || 0);
      setSubtotal(res.subtotal || 0);
    } catch {
      // Ignore or empty
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync cart when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      // Check for guest cart to merge
      const guestCartRaw = localStorage.getItem('guest_cart');
      if (guestCartRaw) {
        try {
          const guestItems = JSON.parse(guestCartRaw);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const mergePayload = guestItems.map((gi) => ({
              product_id: gi.product_id || gi.id,
              quantity: gi.quantity || 1,
            }));
            apiMergeCart(mergePayload)
              .then((res) => {
                setItems(res.items || []);
                setTotalQuantity(res.total_quantity || 0);
                setSubtotal(res.subtotal || 0);
                localStorage.removeItem('guest_cart');
              })
              .catch(() => {
                fetchBackendCart();
              });
            return;
          }
        } catch {
          localStorage.removeItem('guest_cart');
        }
      }
      fetchBackendCart();
    } else {
      // Load from localStorage for guest
      try {
        const raw = localStorage.getItem('guest_cart');
        const parsed = raw ? JSON.parse(raw) : [];
        setItems(parsed);
        updateTotals(parsed);
      } catch {
        setItems([]);
        setTotalQuantity(0);
        setSubtotal(0);
      }
    }
  }, [isAuthenticated, fetchBackendCart]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await apiAddToCart(product.id, quantity);
        setItems(res.items || []);
        setTotalQuantity(res.total_quantity || 0);
        setSubtotal(res.subtotal || 0);
        return true;
      } catch (err) {
        alert(err.message);
        return false;
      }
    } else {
      // Guest cart
      const existing = [...items];
      const idx = existing.findIndex((it) => (it.product_id === product.id) || (it.id === product.id));
      if (idx >= 0) {
        existing[idx].quantity = (existing[idx].quantity || 1) + quantity;
      } else {
        existing.push({
          id: product.id,
          product_id: product.id,
          quantity,
          product: { ...product },
          name: product.name,
          price: product.price,
          image: product.image_url || product.image,
          description: product.description,
        });
      }
      setItems(existing);
      updateTotals(existing);
      localStorage.setItem('guest_cart', JSON.stringify(existing));
      return true;
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (isAuthenticated) {
      try {
        const res = await apiUpdateCartItem(cartItemId, newQty);
        setItems(res.items || []);
        setTotalQuantity(res.total_quantity || 0);
        setSubtotal(res.subtotal || 0);
      } catch (err) {
        alert(err.message);
      }
    } else {
      let updated = items.map((it) => {
        if (it.id === cartItemId || it.product_id === cartItemId) {
          return { ...it, quantity: newQty };
        }
        return it;
      }).filter((it) => it.quantity > 0);
      setItems(updated);
      updateTotals(updated);
      localStorage.setItem('guest_cart', JSON.stringify(updated));
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (isAuthenticated) {
      try {
        const res = await apiRemoveCartItem(cartItemId);
        setItems(res.items || []);
        setTotalQuantity(res.total_quantity || 0);
        setSubtotal(res.subtotal || 0);
      } catch (err) {
        alert(err.message);
      }
    } else {
      const updated = items.filter((it) => it.id !== cartItemId && it.product_id !== cartItemId);
      setItems(updated);
      updateTotals(updated);
      localStorage.setItem('guest_cart', JSON.stringify(updated));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await apiClearCart();
      } catch {
        // ignore
      }
    }
    setItems([]);
    setTotalQuantity(0);
    setSubtotal(0);
    localStorage.removeItem('guest_cart');
  };

  const value = {
    items,
    totalQuantity,
    subtotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchBackendCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
