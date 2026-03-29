import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const addToCart = async (product_id, quantity = 1) => {
    setLoading(true);
    try {
      await api.post('/cart', { product_id, quantity });
      await fetchCart();
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      await api.put(`/cart/${cartId}`, { quantity });
      await fetchCart();
    } catch {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
      await fetchCart();
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart([]);
    } catch {
      console.error('Failed to clear cart');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
