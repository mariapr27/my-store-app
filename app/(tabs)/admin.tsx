import { useProducts } from '../../contexts/Productscontext';
import { Product, ProductCategory } from '../../types/product';
import { Stack } from 'expo-router';
import { Edit2, LogOut, Plus, Trash2 } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

const ADMIN_EMAIL = 'miyayitastore@gmail.com'; //  email de admin

export default function AdminScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'cleaning' as ProductCategory,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleLogin = async () => {
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
    } catch (error: any) {
      setLoginError('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm('¿Estás seguro de cerrar sesión?')
        : true;
      if (!confirmed) return;
      (async () => {
        try {
          await signOut(auth);
          setUser(null);
        } catch (error) {
          // En web, usa alert simple
          if (typeof window !== 'undefined' && typeof window.alert === 'function') {
            window.alert('No se pudo cerrar sesión. Inténtalo de nuevo.');
          }
        }
      })();
      return;
    }

    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              setUser(null);
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'cleaning',
    });
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'El precio debe ser un número válido mayor a 0');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        price,
        image: formData.image || 'https://via.placeholder.com/400',
        category: formData.category,
      });
    } else {
      addProduct({
        name: formData.name,
        description: formData.description,
        price,
        image: formData.image || 'https://via.placeholder.com/400',
        category: formData.category,
        stock: 0
      });
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteProduct(product.id),
        },
      ]
    );
  };

  if (isLoading || isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Iniciar Sesión',
            headerStyle: { backgroundColor: '#2d6a4f' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' as const },
          }}
        />
        <View style={styles.loginContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Acceso Administrador</Text>
            <Text style={styles.loginSubtitle}>
              Ingresa tus credenciales para continuar
            </Text>

            <View style={styles.loginForm}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={loginForm.email}
                onChangeText={(text) =>
                  setLoginForm({ ...loginForm, email: text })
                }
                placeholder="admin@tutienda.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={loginForm.password}
                onChangeText={(text) =>
                  setLoginForm({ ...loginForm, password: text })
                }
                placeholder="Ingresa tu contraseña"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />

              {loginError ? (
                <Text style={styles.errorText}>{loginError}</Text>
              ) : null}

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              <View style={styles.credentialsHint}>
                <Text style={styles.hintText}>Solo el administrador puede acceder</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
//return hacia vista de los producto agregar, eliminar, editar
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Administración',
          headerStyle: { backgroundColor: '#2d6a4f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Administrar Productos</Text>
          <Text style={styles.welcomeText}>Bienvenido, {user?.email}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDescription} numberOfLines={2}>
                {product.description}
              </Text>
              <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
              <Text style={styles.productCategory}>
                {product.category === 'cleaning' ? 'Limpieza' : 'Orgánico'}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(product)}
              >
                <Edit2 size={20} color="#2d6a4f" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(product)}
              >
                <Trash2 size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </Text>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nombre del producto"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Descripción del producto"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Precio *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) => setFormData({ ...formData, image: text })}
                placeholder="https://..."
                autoCapitalize="none"
              />

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    formData.category === 'cleaning' && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: 'cleaning' })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === 'cleaning' &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    Limpieza
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    formData.category === 'organic' && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: 'organic' })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === 'organic' &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    Orgánico
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#2d6a4f',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#2d6a4f',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 32,
  },
  loginForm: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#2d6a4f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
  },
  credentialsHint: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#e7f5f0',
    borderRadius: 8,
    gap: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#2d6a4f',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#212529',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2d6a4f',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic' as const,
  },
  actions: {
    justifyContent: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#e7f5f0',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#2d6a4f',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#495057',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#495057',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#495057',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});