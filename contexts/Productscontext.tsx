import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Product, ProductCategory } from '../types/product';

export const [ProductsProvider, useProducts] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productsQuery = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(productsQuery, 
      (snapshot) => {
        const productsData: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            image: data.image,
            category: data.category as ProductCategory,
            saleType: (data.saleType as any) || 'detal',
            createdAt: data.createdAt?.toDate(),
          });
        });
        setProducts(productsData);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
        console.error('Error obteniendo productos:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date(),
      });
      console.log('Producto agregado con ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('Error agregando producto:', err);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, productData: Partial<Omit<Product, 'id'>>) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, productData);
      console.log('Producto actualizado:', productId);
    } catch (err) {
      console.error('Error actualizando producto:', err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      console.log('=== INICIANDO ELIMINACIÓN DE PRODUCTO ===');
      console.log('ID del producto:', productId);
      console.log('Usuario autenticado:', auth.currentUser?.email);
      console.log('UID del usuario:', auth.currentUser?.uid);
      console.log('Estado de autenticación:', !!auth.currentUser);
      
      // Verificar si el usuario está autenticado
      if (!auth.currentUser) {
        throw new Error('Usuario no autenticado');
      }
      
      // Actualizar estado local inmediatamente para feedback visual
      setProducts(prevProducts => {
        console.log('Actualizando estado local...');
        const filteredProducts = prevProducts.filter(product => product.id !== productId);
        console.log('Productos antes:', prevProducts.length);
        console.log('Productos después:', filteredProducts.length);
        return filteredProducts;
      });
      
      // Intentar eliminar de Firebase
      console.log('Intentando eliminar de Firebase...');
      const productRef = doc(db, 'products', productId);
      console.log('Referencia del documento:', productRef.path);
      
      await deleteDoc(productRef);
      console.log('✅ Producto eliminado exitosamente de Firebase');
      
    } catch (err: any) {
      console.error('❌ Error eliminando producto:', err);
      console.error('Tipo de error:', typeof err);
      console.error('Código de error:', err?.code);
      console.error('Mensaje de error:', err?.message);
      console.error('Stack trace:', err?.stack);
      
      // Revertir cambios en estado local si falla
      console.log('Revirtiendo cambios en estado local...');
      // Recargar productos desde Firebase para sincronizar
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
      
      try {
        const snapshot = await getDocs(productsQuery);
        const productsData: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            image: data.image,
            category: data.category as ProductCategory,
            createdAt: data.createdAt?.toDate(),
          });
        });
        setProducts(productsData);
        console.log('Estado local sincronizado con Firebase');
      } catch (syncError) {
        console.error('Error sincronizando estado local:', syncError);
      }
      
      throw err;
    }
  }, []);

  const getProductById = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
});