//archivo principal App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Tabs } from 'expo-router';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Welcome Mi Yayita!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
    maxWidth: Platform.OS === 'web' ? 430 : '100%', // Limita el ancho en web
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0, // Centra en web
    backgroundColor: '#fff', // Fondo blanco
  },
});