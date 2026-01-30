import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/Productscontext'; 
import { Product, ProductCategory } from '../../types/product';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Check, ShoppingBag } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const CategoryButton = ({
  category,
  label,
  isActive,
  onPress,
}: {
  category: ProductCategory | 'all';
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
  >
    <Text
      style={[
        styles.categoryButtonText,
        isActive && styles.categoryButtonTextActive,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { reduceProductStock } = useProducts(); // Importar la nueva función
  const [showAdded, setShowAdded] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handleAddToCart = async () => {
    try {
      await addToCart(product);
      reduceProductStock(product.id, 1); // Reducir el stock en el contexto
      setShowAdded(true);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => setShowAdded(false), 2000);
    } catch (err: any) {
      console.error('No se pudo agregar al carrito:', err);
      // Si falla por no estar autenticado, sugerimos iniciar sesión
      if (err?.message?.toLowerCase?.().includes('no autenticado') || err === 'Usuario no autenticado') {
        Alert.alert('Inicia sesión', 'Debes iniciar sesión para sincronizar tu carrito en la nube. Se guardará localmente.');
      } else {
        Alert.alert('Error', 'No se pudo agregar el producto al carrito. Intenta nuevamente.');
      }
    }
  };

  return (
    <Animated.View
      style={[styles.productCard, { transform: [{ scale: scaleAnim }] }]}
    >
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
        <Text style={styles.productStock}>Cantidad disponible: {product.stock}</Text>
        <Pressable
          onPress={handleAddToCart}
          style={[
            styles.addButton,
            showAdded && styles.addButtonSuccess,
            product.stock === 0 && { backgroundColor: '#adb5bd' }, // Cambiar color si no hay stock
          ]}
          disabled={product.stock === 0} // Deshabilitar si el stock es 0
        >
          {showAdded ? (
            <Check size={18} color="#fff" />
          ) : (
            <ShoppingBag size={18} color="#fff" />
          )}
          <Text style={styles.addButtonText}>
            {product.stock === 0 ? 'Sin stock' : showAdded ? 'Agregado' : 'Agregar'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default function CatalogScreen() {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'all'
  >('all');
  const [saleFilter, setSaleFilter] = useState<'all' | 'detal' | 'mayor'>('all');
  const filteredProducts = products
    .filter((p) => (selectedCategory === 'all' ? true : p.category === selectedCategory))
    .filter((p) => (saleFilter === 'all' ? true : (p.saleType || 'detal') === saleFilter));

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Tienda Natural',
          headerStyle: { backgroundColor: '#2d6a4f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Yayita Tienda</Text>
        <Text style={styles.headerSubtitle}>
          Limpieza eficaz y productos orgánicos
        </Text>
      </View>

      {/* Botones adicionales encima de las categorías */}
      <View style={styles.topButtonsContainer}>
        <Pressable
          onPress={() => { setSaleFilter('detal'); }}
          style={({ pressed }) => [
            styles.topButton,
            saleFilter === 'detal' && styles.topButtonActive,
            pressed && styles.topButtonPressed,
          ]}
        >
          <Text style={[styles.topButtonText, saleFilter === 'detal' && styles.topButtonTextActive]}>Detal</Text>
        </Pressable>

        <Pressable
          onPress={() => { setSaleFilter('mayor'); }}
          style={({ pressed }) => [
            styles.topButton,
            saleFilter === 'mayor' && styles.topButtonActive,
            pressed && styles.topButtonPressed,
          ]}
        >
          <Text style={[styles.topButtonText, saleFilter === 'mayor' && styles.topButtonTextActive]}>Mayor</Text>
        </Pressable>
      </View>

      <View
        // horizontal
        // centerContent
        //showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        //style={[styles.categoriesContainer, {height: 290}]} // ← Aquí cambias la altura
      >
        <CategoryButton
          category="all"
          label="Todos"
          isActive={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
        />
        <CategoryButton
          category="cleaning"
          label="Limpieza"
          isActive={selectedCategory === 'cleaning'}
          onPress={() => setSelectedCategory('cleaning')}
        />
        <CategoryButton
          category="organic"
          label="Orgánicos"
          isActive={selectedCategory === 'organic'}
          onPress={() => setSelectedCategory('organic')}
        />
      </View>

      <ScrollView
        //style={styles.productsContainer}
        contentContainerStyle={styles.productsContent}
      >
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    maxWidth: screenWidth > 460 ? 460 : '100%', // Limita el ancho en pantallas grandes
    marginHorizontal: screenWidth > 460 ? 'auto' : 0, // Centra en pantallas grandes
  
  },
  header: {
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#b7e4c7',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 10,
    paddingHorizontal: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryButton: {
    height: 50,
    minWidth: 110,            // iguala ancho visual entre textos distintos
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    },
  categoryButtonActive: {
    backgroundColor: '#2d6a4f',
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#495057',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  productsContainer: {
    flex: 1,
  },
  productsContent: {
    padding: 16,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    // width: 600,
    // height: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    // alignSelf: 'center',
    // marginHorizontal: 10,

  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1f3f5',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#212529',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#2d6a4f',
  },
  productStock: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonSuccess: {
    backgroundColor: '#40916c',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  topButtonsContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  topButton: {
    paddingHorizontal: 60,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
    marginRight: 8,
  },
  topButtonPressed: {
    opacity: 0.8,
  },
  topButtonActive: {
    backgroundColor: '#2d6a4f',
  },
  topButtonTextActive: {
    color: '#fff',
  },
  topButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#495057',
  },
});
