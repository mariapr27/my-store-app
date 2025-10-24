import { useCart } from '../contexts/CartContext';
import { CustomerInfo } from '../types/product';
import { router, Stack } from 'expo-router';
import { CreditCard } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function CheckoutScreen() {
  const { items, getTotal, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    cedula: '',
    email: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  
  // Datos bancarios para transferencia
  const bankData = {
    accountNumber: '0102-1234-5678-9012',
    bank: 'Banco de Venezuela',
    rif: 'J-12345678-9'
  };

  // Datos bancarios para Pago Movil
  const mobilePaymentData = {
    phoneNumber: '+58 412-123-4567',
    bank: 'Banco de Venezuela',
    rif: 'J-12345678-9'
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};

    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }
    if (!customerInfo.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmPurchase = () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    const orderNumber = `ORD-${Date.now()}`;
    const orderDate = new Date().toISOString();

    const orderData = {
      orderNumber,
      date: orderDate,
      customer: customerInfo,
      items,
      total: getTotal(),
      paymentMethod:
        paymentMethod === 'transferencia' ? 'Transferencia' : 'Pago Movil',
    };

    router.push({
      pathname: '/receipt',
      params: { orderData: JSON.stringify(orderData) },
    });

    clearCart();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Checkout',
          headerStyle: { backgroundColor: '#2d6a4f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={customerInfo.fullName}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, fullName: text })
              }
              placeholder="Juan Pérez"
              placeholderTextColor="#adb5bd"
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cedula</Text>
            <TextInput
              style={[styles.input, errors.cedula && styles.inputError]}
              value={customerInfo.cedula}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, cedula: text })
              }
              placeholder="12345678"
              placeholderTextColor="#adb5bd"
              keyboardType="phone-pad"
            />
            {errors.cedula && (
              <Text style={styles.errorText}>{errors.cedula}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={customerInfo.email}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, email: text })
              }
              placeholder="juan@ejemplo.com"
              placeholderTextColor="#adb5bd"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={customerInfo.phone}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, phone: text })
              }
              placeholder="+58 2345678900"
              placeholderTextColor="#adb5bd"
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección de Envío</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.address && styles.inputError,
              ]}
              value={customerInfo.address}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, address: text })
              }
              placeholder="Calle, número, ciudad, código postal"
              placeholderTextColor="#adb5bd"
              multiline
              numberOfLines={3}
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>

          <Pressable
            onPress={() => setPaymentMethod('transferencia')}
            style={[
              styles.paymentOption,
              paymentMethod === 'transferencia' && styles.paymentOptionActive,
            ]}
          >
            <View style={styles.paymentOptionContent}>
              <CreditCard size={24} color="#2d6a4f" />
              <Text style={styles.paymentOptionText}>Transferencia</Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === 'transferencia' && styles.radioActive,
              ]}
            >
              {paymentMethod === 'transferencia' && (
                <View style={styles.radioInner} />
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={() => setPaymentMethod('cash')}
            style={[
              styles.paymentOption,
              paymentMethod === 'cash' && styles.paymentOptionActive,
            ]}
          >
            <View style={styles.paymentOptionContent}>
              <Text style={styles.cashIcon}>💵</Text>
              <Text style={styles.paymentOptionText}>Pago Movil</Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === 'cash' && styles.radioActive,
              ]}
            >
              {paymentMethod === 'cash' && <View style={styles.radioInner} />}
            </View>
          </Pressable>
        </View>

        {/* Datos bancarios para transferencia */}
        {paymentMethod === 'transferencia' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos para Transferencia</Text>
            <View style={styles.bankDataContainer}>
              <View style={styles.bankDataItem}>
                <Text style={styles.bankDataLabel}>Número de Cuenta:</Text>
                <Text style={styles.bankDataValue}>{bankData.accountNumber}</Text>
              </View>
              <View style={styles.bankDataItem}>
                <Text style={styles.bankDataLabel}>Banco:</Text>
                <Text style={styles.bankDataValue}>{bankData.bank}</Text>
              </View>
              <View style={styles.bankDataItem}>
                <Text style={styles.bankDataLabel}>RIF:</Text>
                <Text style={styles.bankDataValue}>{bankData.rif}</Text>
              </View>
            </View>
            <View style={styles.bankDataNote}>
              <Text style={styles.bankDataNoteText}>
                Realiza la transferencia por el monto exacto del pedido y envía el comprobante al email registrado.
              </Text>
            </View>
          </View>
        )}

        {/* Datos bancarios para Pago Movil */}
        {paymentMethod === 'cash' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos para Pago Movil</Text>
            <View style={styles.bankDataContainer}>
              <View style={styles.bankDataItem}>
                <Text style={styles.bankDataLabel}>Número de Teléfono:</Text>
                <Text style={styles.bankDataValue}>{mobilePaymentData.phoneNumber}</Text>
              </View>
              <View style={styles.bankDataItem}>
                <Text style={styles.bankDataLabel}>Banco:</Text>
                <Text style={styles.bankDataValue}>{mobilePaymentData.bank}</Text>
              </View>
              <View style={styles.bankDataItem}>
                <Text style={styles.bankDataLabel}>RIF:</Text>
                <Text style={styles.bankDataValue}>{mobilePaymentData.rif}</Text>
              </View>
            </View>
            <View style={styles.bankDataNote}>
              <Text style={styles.bankDataNoteText}>
                Realiza el pago móvil por el monto exacto del pedido y envía el comprobante al email registrado.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          <View style={styles.summaryContainer}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>
                  {item.product.name} x{item.quantity}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalAmount}>
                ${getTotal().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleConfirmPurchase}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmButtonText}>Confirmar Compra</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#212529',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentOptionActive: {
    borderColor: '#2d6a4f',
    backgroundColor: '#f1f8f5',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#212529',
  },
  cashIcon: {
    fontSize: 24,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#2d6a4f',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2d6a4f',
  },
  summaryContainer: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemName: {
    fontSize: 15,
    color: '#495057',
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#212529',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginVertical: 8,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#212529',
  },
  summaryTotalAmount: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#2d6a4f',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  // Estilos para datos bancarios
  bankDataContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bankDataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankDataLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#495057',
    flex: 1,
  },
  bankDataValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2d6a4f',
    textAlign: 'right',
    flex: 1,
  },
  bankDataNote: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  bankDataNoteText: {
    fontSize: 13,
    color: '#1565c0',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
