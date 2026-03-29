import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const addToWishlist = async (product_id) => {
    try {
      await api.post('/wishlist', { product_id });
      await fetchWishlist();
      toast.success('Added to wishlist');
    } catch {
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (product_id) => {
    try {
      await api.delete(`/wishlist/${product_id}`);
      await fetchWishlist();
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (product_id) => wishlist.some((w) => w.product_id === product_id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
