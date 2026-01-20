import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    // Si no hay usuario autenticado, cargamos carrito local (guest) desde AsyncStorage
    if (!auth.currentUser) {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('guest_cart');
          if (raw) {
            const data = JSON.parse(raw) as { items: CartItem[] };
            setItems(data.items || []);
          } else {
            setItems([]);
          }
        } catch (err) {
          console.error('Error cargando carrito local:', err);
          setItems([]);
        } finally {
          setIsLoading(false);
        }
      })();

      return;
    }

    const cartRef = doc(db, 'carts', auth.currentUser.uid);

    const unsubscribe = onSnapshot(
      cartRef,
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
    // Si hay usuario autenticado, guardamos en Firestore
    if (auth.currentUser) {
      try {
        const cartRef = doc(db, 'carts', auth.currentUser.uid);
        const cartData: Omit<CartDocument, 'userId'> = {
          items: newItems,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(
          cartRef,
          {
            ...cartData,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error guardando carrito en Firestore:', error);
        throw error;
      }
    } else {
      // Si no hay usuario, guardamos localmente en AsyncStorage (guest)
      try {
        await AsyncStorage.setItem('guest_cart', JSON.stringify({ items: newItems }));
        // Actualizar estado local inmediatamente
        setItems(newItems);
      } catch (err) {
        console.error('Error guardando carrito local:', err);
        throw err;
      }
    }
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    try {
      const newItems = [...items];
      const existingItemIndex = newItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        const currentQuantity = newItems[existingItemIndex].quantity;
        const availableStock = product.stock || 0;

        if (currentQuantity < availableStock) {
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: currentQuantity + 1,
          };
        } else {
          throw new Error('No hay suficiente stock disponible');
        }
      } else {
        if ((product.stock || 0) > 0) {
          newItems.push({ product, quantity: 1 });
        } else {
          throw new Error('No hay suficiente stock disponible');
        }
      }

      await saveCartToFirestore(newItems);
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    }
  }, [items, saveCartToFirestore]);

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      const newItems = items.filter((item) => item.product.id !== productId);
      await saveCartToFirestore(newItems);
    } catch (error) {
      console.error('Error removiendo del carrito:', error);
      throw error;
    }
  }, [items, saveCartToFirestore]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      const product = items.find((item) => item.product.id === productId)?.product;
      if (!product) throw new Error('Producto no encontrado');

      if (quantity > (product.stock || 0)) {
        throw new Error('Stock insuficiente');
      }

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
    try {
      await saveCartToFirestore([]);
      // Si es guest, también eliminamos la clave local
      if (!auth.currentUser) {
        await AsyncStorage.removeItem('guest_cart');
      }
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
