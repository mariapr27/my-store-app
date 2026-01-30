import { useCart } from '../../contexts/CartContext';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function CartScreen() {
  const { items, updateQuantity, removeFromCart, getTotal, isLoading, error } = useCart();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    const product = items.find((item) => item.product.id === productId)?.product;
    if (!product) return;

    if (quantity > (product.stock || 0)) {
      setAlertMessage('No hay suficiente stock disponible para este producto.');
      setTimeout(() => setAlertMessage(null), 3000); // Desvanece el mensaje después de 3 segundos
      return;
    }

    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removiendo del carrito:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Carrito',
            headerStyle: { backgroundColor: '#2d6a4f' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' as const },
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando carrito...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Carrito',
            headerStyle: { backgroundColor: '#2d6a4f' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' as const },
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Carrito',
            headerStyle: { backgroundColor: '#2d6a4f' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' as const },
          }}
        />
        <View style={styles.emptyContainer}>
          <ShoppingCart size={80} color="#adb5bd" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>
            Agrega productos para comenzar tu compra
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Carrito',
          headerStyle: { backgroundColor: '#2d6a4f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />

      {alertMessage && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>{alertMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.itemsContainer}
        contentContainerStyle={styles.itemsContent}
      >
        {items.map((item) => (
          <View key={item.product.id} style={styles.cartItem}>
            <Image
              source={{ uri: item.product.image }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                ${item.product.price.toFixed(2)}
              </Text>
              <View style={styles.itemActions}>
                <View style={styles.quantityControl}>
                  <Pressable
                    onPress={() =>
                      handleUpdateQuantity(item.product.id, item.quantity - 1)
                    }
                    style={styles.quantityButton}
                  >
                    <Minus size={16} color="#2d6a4f" />
                  </Pressable>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Pressable
                    onPress={() =>
                      handleUpdateQuantity(item.product.id, item.quantity + 1)
                    }
                    style={styles.quantityButton}
                  >
                    <Plus size={16} color="#2d6a4f" />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => handleRemoveFromCart(item.product.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={18} color="#dc3545" />
                </Pressable>
              </View>
            </View>
            <View style={styles.itemSubtotal}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalAmount}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${getTotal().toFixed(2)}</Text>
        </View>
        <Pressable onPress={handleCheckout} style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
        </Pressable>
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#212529',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  itemsContainer: {
    flex: 1,
  },
  itemsContent: {
    padding: 16,
    gap: 16,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#212529',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#212529',
    minWidth: 32,
    textAlign: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  itemSubtotal: {
    alignItems: 'flex-end',
  },
  subtotalLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  subtotalAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2d6a4f',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#495057',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#2d6a4f',
  },
  checkoutButton: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  alertContainer: { //mensaje de alerta de stock insuficiente
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffc107',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  alertText: {
    color: '#212529',
    fontSize: 16,
    fontWeight: '600',
  },
});
