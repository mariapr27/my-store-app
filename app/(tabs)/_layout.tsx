import { useCart } from '../../contexts/CartContext';
import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Settings } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2d6a4f',
        tabBarInactiveTintColor: '#6c757d',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color }) => (
            <View>
              <ShoppingCart size={24} color={color} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
<Tabs.Screen
  name="admin"
  options={{
    title: 'Opciones',
    tabBarIcon: ({ color }) => <Settings size={24} color={color} />, // Cambiar el ícono
  }}
/>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
