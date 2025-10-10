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
} from 'react-native';

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
  const [showAdded, setShowAdded] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handleAddToCart = () => {
    addToCart(product);
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
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Pressable
            onPress={handleAddToCart}
            style={[
              styles.addButton,
              showAdded && styles.addButtonSuccess,
            ]}
          >
            {showAdded ? (
              <Check size={18} color="#fff" />
            ) : (
              <ShoppingBag size={18} color="#fff" />
            )}
            <Text style={styles.addButtonText}>
              {showAdded ? 'Agregado' : 'Agregar'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

export default function CatalogScreen() {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'all'
  >('all');

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

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
        <Text style={styles.headerTitle}>Productos Naturales</Text>
        <Text style={styles.headerSubtitle}>
          Limpieza ecológica y alimentos orgánicos
        </Text>
      </View>

      <ScrollView
        horizontal
        centerContent
        showsHorizontalScrollIndicator={false}
        //style={styles.categoriesContainer}
        style={[styles.categoriesContainer, {height: 230}]} // ← Aquí cambias la altura
        contentContainerStyle={styles.categoriesContent}
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
      </ScrollView>

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
    fontSize: 15,
    color: '#b7e4c7',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    height: 10,
    marginVertical: 15,  
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoriesContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 12,
    alignItems: 'center'
  },
  // categoryButton: {
  //   paddingHorizontal: 20,
  //   paddingVertical: 10,
  //   borderRadius: 18,
  //   backgroundColor: '#f1f3f5',
  //   marginRight: 8,
  // },
  categoryButton: {
      height: 40,
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
    width: 600,
    height: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center',
    marginHorizontal: 10,

  },
  productImage: {
    width: '100%',
    height: 150,
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
});
