import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { CartProvider } from '../contexts/CartContext';
import { ProductsProvider } from '../contexts/Productscontext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => console.log('user?', !!u));
    return unsub;
  }, []);
  return (
    <Stack screenOptions={{ headerBackTitle: 'Atrás' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="checkout"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="receipt"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ProductsProvider>
          <CartProvider>
            <RootLayoutNav />
          </CartProvider>
        </ProductsProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
