import { Link, Stack } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Página no encontrada',
          headerStyle: { backgroundColor: '#2d6a4f' },
          headerTintColor: '#fff',
        }}
      />
      <View style={styles.container}>
        <AlertCircle size={80} color="#adb5bd" strokeWidth={1.5} />
        <Text style={styles.title}>Página no encontrada</Text>
        <Text style={styles.subtitle}>
          Lo sentimos, esta página no existe
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#212529',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 32,
  },
  link: {
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
