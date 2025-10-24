import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { CartItem, Product, CartDocument } from '../types/product';

export const [CartProvider, useCart] = createContextHook(() => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    const cartRef = doc(db, 'carts', auth.currentUser.uid);
    
    const unsubscribe = onSnapshot(cartRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const cartData = snapshot.data() as CartDocument;
          setItems(cartData.items || []);
        } else {
          setItems([]);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
        console.error('Error obteniendo carrito:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveCartToFirestore = useCallback(async (newItems: CartItem[]) => {
    if (!auth.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const cartRef = doc(db, 'carts', auth.currentUser.uid);
      const cartData: Omit<CartDocument, 'userId'> = {
        items: newItems,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(cartRef, {
        ...cartData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error guardando carrito:', error);
      throw error;
    }
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    if (!auth.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const newItems = [...items];
      const existingItemIndex = newItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
      } else {
        newItems.push({ product, quantity: 1 });
      }

      await saveCartToFirestore(newItems);
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    }
  }, [items, saveCartToFirestore]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!auth.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const newItems = items.filter((item) => item.product.id !== productId);
      await saveCartToFirestore(newItems);
    } catch (error) {
      console.error('Error removiendo del carrito:', error);
      throw error;
    }
  }, [items, saveCartToFirestore]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!auth.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const newItems = items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      await saveCartToFirestore(newItems);
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      throw error;
    }
  }, [items, removeFromCart, saveCartToFirestore]);

  const clearCart = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      await saveCartToFirestore([]);
    } catch (error) {
      console.error('Error limpiando carrito:', error);
      throw error;
    }
  }, [saveCartToFirestore]);

  const getTotal = useCallback(() => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return useMemo(
    () => ({
      items,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
    }),
    [
      items,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
    ]
  );
});
