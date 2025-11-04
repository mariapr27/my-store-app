import { useCart } from '../contexts/CartContext';
import { CustomerInfo } from '../types/product';
import { router, Stack } from 'expo-router';
import { CreditCard } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

export default function CheckoutScreen() {
  const { items, getTotal, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    cedula: '',
    email: '',
    phone: '',
    address: '',
    fechaPago: '',
    comprobante: '',
    bancoEmisor: '',
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

  // Validacion en formulario
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
      comprobante: customerInfo.comprobante,
      fechaPago: customerInfo.fechaPago,
      bancoEmisor: customerInfo.bancoEmisor,
    };
     console.log('Enviando orderData:', orderData); 

    router.push({
      pathname: '/receipt',
      params: { orderData: JSON.stringify(orderData) },
    });

    clearCart();
  };
// Función helper para obtener la fecha actual sin problemas de timezone
  const getTodayWithoutTime = (): Date => {
  const today = new Date();
  // Resetear la hora a mediodía para evitar desfases
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
};
  // fecha de pago para pago movil
  const DatePickerComponent = ({
    value,
    onDateChange,
    maximumDate,
    error
  }: {
    value: string;
    onDateChange: (dateString: string) => void;
    maximumDate?: Date;
    error?: string;
  }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateState, setSelectedDateState] = useState<Date>(
    getTodayWithoutTime()
  );

  const formatDateToString = (date: Date): string => { //Convierte un objeto Date a string en formato "dd/mm/yyyy"
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const normalizeToNoon = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  };

  const parseDateString = (dateString: string): Date => {  // Convierte un string en formato "dd/mm/yyyy" a objeto Date
    if (!dateString) return getTodayWithoutTime(); // ← Usar la función helper
    const [day, month, year] = dateString.split('/').map(Number);
    return normalizeToNoon(new Date(year, month - 1, day));
  };


  const handleDateChange = (event: any, pickedDate?: Date) => {
    // Normalize picked date to local noon to avoid timezone shifts
    if (pickedDate) {
      const normalized = normalizeToNoon(pickedDate);
      setSelectedDateState(normalized);
      const dateString = formatDateToString(normalized);
      onDateChange(dateString);
    }

    // En Android cerramos inmediatamente
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    // En iOS el evento puede venir con type 'set' o 'dismissed'
    if (Platform.OS === 'ios') {
      if (event?.type === 'set' || event?.type === 'dismissed') {
        setShowDatePicker(false);
      }
    }
  };
   // Render para web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.inputGroup}>
        <input
          type="date"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: '#f9f9f9',
            fontSize: '16px',
            color: '#333',
            outline: 'none'
          }}
          value={value ? (() => {
            const d = parseDateString(value);
            const yyyy = d.getFullYear();
            const mm = (d.getMonth() + 1).toString().padStart(2, '0');
            const dd = d.getDate().toString().padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          })() : ''}
          onChange={(e) => {
            if (e.target.value) {
              const [yyyy, mm, dd] = e.target.value.split('-').map(Number);
              const local = normalizeToNoon(new Date(yyyy, mm - 1, dd));
              onDateChange(formatDateToString(local));
            }
          }}
          max={
            maximumDate
              ? (() => {
                  const d = maximumDate;
                  const yyyy = d.getFullYear();
                  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
                  const dd = d.getDate().toString().padStart(2, '0');
                  return `${yyyy}-${mm}-${dd}`;
                })()
              : undefined
          }
        />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }

  // Render para móvil (iOS/Android)
  return (
    <View style={styles.inputGroup}>
      <View style={[styles.pickerContainer, error && styles.inputError]}>
        <TouchableOpacity
          style={[styles.dateInput]}
          onPress={() => {
            // Al abrir el selector inicializamos la fecha mostrada al valor actual o hoy
            setSelectedDateState(value ? parseDateString(value) : getTodayWithoutTime());
            setShowDatePicker(true);
          }}
        >
          <Text style={value ? styles.dateText : styles.placeholderText}>
            {value || 'DD/MM/AAAA'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDateState}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={maximumDate}
          locale="es-ES"
        />
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};
const [showBancoModal, setShowBancoModal] = useState(false);
    // Define la interfaz para los bancos
    interface Banco {
      id: string;
      nombre: string;
    }

    // Lista de bancos (puedes expandirla)
    const BANCOS: Banco[] = [
      { id: '1', nombre: 'Banco de Chile' },
      { id: '2', nombre: 'Banco Estado' },
      { id: '3', nombre: 'Banco Santander' },
      { id: '4', nombre: 'Banco BCI' },
      { id: '5', nombre: 'Banco Itaú' },
      { id: '6', nombre: 'Scotiabank' },
      { id: '7', nombre: 'Banco Security' },
      { id: '8', nombre: 'Banco Falabella' },
      { id: '9', nombre: 'Banco Ripley' },
      { id: '10', nombre: 'Banco Internacional' },
      { id: '11', nombre: 'BBVA' },
      { id: '12', nombre: 'HSBC' },
      { id: '0', nombre: 'Otro' },
    ];

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
          <Text style={styles.sectionTitle}>Información del Pago</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nº de Comprobante</Text>
            <TextInput
              style={[styles.input, errors.comprobante && styles.inputError]}
              value={customerInfo.comprobante}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, comprobante: text })
              }
              placeholder="Ingrese los ultimos 4 dígitos"
              placeholderTextColor="#adb5bd"
            />
            {errors.comprobante && (
              <Text style={styles.errorText}>{errors.comprobante}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha del Pago</Text>
            
            {/* Botón/Input para abrir el selector */}
            <DatePickerComponent
            value={customerInfo.fechaPago || ''}
            onDateChange={(dateString) => 
              setCustomerInfo({ ...customerInfo, fechaPago: dateString })
            }  maximumDate={new Date(new Date().setHours(23, 59, 59, 999))}
              />
            
            {errors.fechaPago && (
              <Text style={styles.errorText}>{errors.fechaPago}</Text>
            )}
          </View>
        

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Banco Emisor</Text>
          <TouchableOpacity
              style={[styles.input, errors.bancoEmisor && styles.inputError]}
              onPress={() => setShowBancoModal(true)}
            >
              <Text style={customerInfo.bancoEmisor ? styles.dateText : styles.placeholderText}>
                {customerInfo.bancoEmisor || 'Seleccione un banco...'}
              </Text>
            </TouchableOpacity>
            <Modal
              isVisible={showBancoModal}
              onBackdropPress={() => setShowBancoModal(false)}
              style={{ justifyContent: 'flex-end', margin: 0 }}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Selecciona un banco</Text>
                <ScrollView style={{ maxHeight: 320 }}>
                  {BANCOS.map((banco) => (
                    <TouchableOpacity
                      key={banco.id}
                      style={styles.modalItem}
                      onPress={() => {
                        setCustomerInfo({ ...customerInfo, bancoEmisor: banco.nombre });
                        setShowBancoModal(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{banco.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
          {errors.bancoEmisor && (
            <Text style={styles.errorText}>{errors.bancoEmisor}</Text>
          )}
        </View>
      </View>
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
  dateInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Estilos añadidos para el Picker y selector de fecha
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    color: '#212529',
  }, 
  dateText: {
    color: '#212529',
    fontSize: 16,
  },
  placeholderText: {
    color: '#adb5bd',
    fontSize: 16,
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
  pickerPlaceholder: {
  color: '#adb5bd',
  fontSize: 16,
},
  pickerItem: {
    fontSize: 16,
    color: '#212529',
  },
  modalContainer: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
},
modalTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#212529',
  marginBottom: 16,
  textAlign: 'center',
},
modalItem: {
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#dee2e6',
},
modalItemText: {
  fontSize: 16,
  color: '#212529',
  textAlign: 'center',
},
});

