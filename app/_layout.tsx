import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { CartProvider } from '../contexts/CartContext';
import { ProductsProvider } from '../contexts/Productscontext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, Linking, StyleSheet } from 'react-native';
import { auth } from '../firebaseConfig';

SplashScreen.preventAutoHideAsync();

const screenWidth = Math.min(Platform.OS === 'web' ? window.innerWidth : 0, 460);
const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    const completeSignIn = async (url: string) => {
      try {
        if (!url) return;
        if (!isSignInWithEmailLink(auth, url)) return;

        let email = '';
        if (Platform.OS === 'web') {
          email = localStorage.getItem('emailForSignIn') ?? '';
        }
        if (!email) {
          // Pide el email si no lo tienes guardado
          email = prompt('Ingresa tu correo para completar el acceso') ?? '';
        }
        await signInWithEmailLink(auth, email, url);
        if (Platform.OS === 'web') localStorage.removeItem('emailForSignIn');
      } catch (e) {
        console.log('Email link sign-in error:', e);
      }
    };

    // Web
    if (Platform.OS === 'web') {
      completeSignIn(window.location.href);
      return;
    }

    // Nativo: URL inicial y eventos
    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) await completeSignIn(initial);
    })();
    const sub = Linking.addEventListener('url', ({ url }) => completeSignIn(url));
    return () => sub.remove();
  }, []);



  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ProductsProvider>
          <CartProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </CartProvider>
        </ProductsProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    maxWidth: Platform.OS === 'web' ? 460 : '100%', // Limita el ancho en web
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0, // Centra en pantallas grandes
  },
});