import { Order } from '../types/product';
import * as Print from 'expo-print';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { CheckCircle, Download, Home } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';


const screenWidth = Dimensions.get('window').width;
const generateReceiptHTML = (order: Order): string => {
  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">${item.product.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">$${item.product.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600;">$${(item.product.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

   // Generar HTML para información de pago si existe
  const paymentInfoHTML = order.comprobante || order.fechaPago || order.bancoEmisor ? `
    <h2 class="section-title">Información del Pago</h2>
    <div class="info-section">
      ${order.comprobante ? `
        <div class="info-row">
          <span class="info-label">Nº de Comprobante:</span>
          <span class="info-value">${order.comprobante}</span>
        </div>
      ` : ''}
      ${order.fechaPago ? `
        <div class="info-row">
          <span class="info-label">Fecha del Pago:</span>
          <span class="info-value">${order.fechaPago}</span>
        </div>
      ` : ''}
      ${order.bancoEmisor ? `
        <div class="info-row">
          <span class="info-label">Banco Emisor:</span>
          <span class="info-value">${order.bancoEmisor}</span>
        </div>
      ` : ''}
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Comprobante de Compra</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #212529;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2d6a4f;
        }
        .header h1 {
          color: #2d6a4f;
          font-size: 32px;
          margin-bottom: 8px;
        }
        .header p {
          color: #6c757d;
          font-size: 16px;
        }
        .info-section {
          margin-bottom: 30px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: 600;
          color: #495057;
        }
        .info-value {
          color: #212529;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #2d6a4f;
          margin-bottom: 16px;
          margin-top: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background-color: #2d6a4f;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) {
          text-align: center;
        }
        th:last-child {
          text-align: right;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
        }
        .total-section {
          text-align: right;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #2d6a4f;
        }
        .total-label {
          font-size: 24px;
          font-weight: 700;
          color: #212529;
        }
        .total-amount {
          font-size: 32px;
          font-weight: 700;
          color: #2d6a4f;
          margin-top: 8px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Tienda Natural</h1>
        <p>Productos de Limpieza Ecológica y Alimentos Orgánicos</p>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Número de Orden:</span>
          <span class="info-value">${order.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha:</span>
          <span class="info-value">${new Date(order.date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}</span>
        </div>
      </div>

      <h2 class="section-title">Información del Cliente</h2>
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Cedula:</span>
          <span class="info-value">${order.customer.cedula}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nombre:</span>
          <span class="info-value">${order.customer.fullName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${order.customer.email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Teléfono:</span>
          <span class="info-value">${order.customer.phone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dirección:</span>
          <span class="info-value">${order.customer.address}</span>
        </div>
      </div>

      <h2 class="section-title">Productos</h2>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Método de Pago:</span>
          <span class="info-value">${order.paymentMethod}</span>
        </div>
      </div>
      ${paymentInfoHTML}

      <div class="total-section">
        <div class="total-label">Total Pagado</div>
        <div class="total-amount">$${order.total.toFixed(2)}</div>
      </div>

      <div class="footer">
        <p>Gracias por su compra</p>
        <p>Tienda Natural - Cuidando de ti y del planeta</p>
      </div>
    </body>
    </html>
  `;
};

export default function ReceiptScreen() {
  const params = useLocalSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const order: Order = JSON.parse(params.orderData as string);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const html = generateReceiptHTML(order);

      const { uri } = await Print.printToFileAsync({ html });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Descargar Comprobante',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(
          'Éxito',
          'El PDF se ha generado correctamente en: ' + uri
        );
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Comprobante',
          headerStyle: { backgroundColor: '#2d6a4f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' as const },
          headerLeft: () => null,
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.successIcon}>
          <CheckCircle size={80} color="#2d6a4f" strokeWidth={2} />
        </View>

        <Text style={styles.successTitle}>¡Compra Exitosa!</Text>
        <Text style={styles.successSubtitle}>
          Tu pedido ha sido procesado correctamente
        </Text>

        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.infoText}>{order.customer.cedula}</Text>
            <Text style={styles.infoText}>{order.customer.fullName}</Text>
            <Text style={styles.infoText}>{order.customer.phone}</Text>
            <Text style={styles.infoText}>{order.customer.address}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos</Text>
            {order.items.map((item) => (
              <View key={item.product.id} style={styles.productRow}>
                <Text style={styles.productName}>
                  {item.product.name} x{item.quantity}
                </Text>
                <Text style={styles.productPrice}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Pago</Text>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Método de Pago:</Text>
              <Text style={styles.paymentValue}>{order.paymentMethod}</Text>
            </View>

            
            {(order.comprobante || order.fechaPago || order.bancoEmisor) && (
              <>
                {order.comprobante && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Nº de Comprobante:</Text>
                    <Text style={styles.paymentValue}>{order.comprobante}</Text>
                  </View>
                )}
                
                {order.fechaPago && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Fecha del Pago:</Text>
                    <Text style={styles.paymentValue}>{order.fechaPago}</Text>
                  </View>
                )}
                
                {order.bancoEmisor && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Banco Emisor:</Text>
                    <Text style={styles.paymentValue}>{order.bancoEmisor}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Pagado</Text>
            <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        <Pressable
          onPress={handleDownloadPDF}
          style={styles.downloadButton}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Download size={20} color="#fff" />
              <Text style={styles.downloadButtonText}>Descargar PDF</Text>
            </>
          )}
        </Pressable>

        <Pressable onPress={handleGoHome} style={styles.homeButton}>
          <Home size={20} color="#2d6a4f" />
          <Text style={styles.homeButtonText}>Volver al Inicio</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    maxWidth: screenWidth > 490 ? 490 : '100%', // Limita el ancho en pantallas grandes
    marginHorizontal: screenWidth > 490 ? 'auto' : 0, // Centra en pantallas grandes
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    marginTop: 20,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  orderHeader: {
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2d6a4f',
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#2d6a4f',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2d6a4f',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 4,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 15,
    color: '#495057',
    flex: 1,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#212529',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#495057',
    flex: 1,
  },
  paymentValue: {
    fontSize: 15,
    color: '#212529',
    flex: 1,
    textAlign: 'right',
  },
  totalSection: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#2d6a4f',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#212529',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#2d6a4f',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d6a4f',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    gap: 8,
    borderWidth: 2,
    borderColor: '#2d6a4f',
  },
  homeButtonText: {
    color: '#2d6a4f',
    fontSize: 17,
    fontWeight: '700' as const,
  },

});
