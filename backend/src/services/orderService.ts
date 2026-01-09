import { pool, query } from '../config/database';
import { Order, OrderItem, CreateOrderInput, UpdateOrderInput } from '../types/database';

// Helper para parsear fechaPago que viene como string "dd/mm/yyyy" desde el frontend
const parseFechaPago = (value?: Date | string): Date | null => {
  if (!value) return null;
  
  // Si ya es un Date, retornarlo
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  
  // Si es string y viene en formato dd/mm/yyyy (por ejemplo "23/01/2025")
  if (typeof value === 'string' && value.includes('/')) {
    const parts = value.split('/');
    if (parts.length === 3) {
      const [dayStr, monthStr, yearStr] = parts;
      const day = Number(dayStr);
      const month = Number(monthStr);
      const year = Number(yearStr);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        // Mes en JS es 0-based, así que restamos 1
        const date = new Date(year, month - 1, day, 12, 0, 0);
        return isNaN(date.getTime()) ? null : date;
      }
    }
  }
  
  // Si no, intentar con el constructor normal de Date
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export class OrderService {
  // Obtener todas las órdenes con sus items
  static async getAllOrders(): Promise<Order[]> {
    try {
      // Primero obtener todas las órdenes
      const ordersResult = await query(
        'SELECT * FROM orders ORDER BY created_at DESC'
      );
      
      const orders = ordersResult.rows;
      
      // Si no hay órdenes, retornar array vacío
      if (orders.length === 0) {
        return [];
      }
      
      // Obtener todos los items de las órdenes
      const orderIds = orders.map(order => order.id);
      const itemsResult = await query(
        `SELECT * FROM order_items WHERE order_id = ANY($1::text[]) ORDER BY created_at ASC`,
        [orderIds]
      );
      
      const items = itemsResult.rows;
      
      // Agrupar items por order_id
      const itemsByOrderId: { [key: string]: OrderItem[] } = {};
      items.forEach(item => {
        if (!itemsByOrderId[item.order_id]) {
          itemsByOrderId[item.order_id] = [];
        }
        itemsByOrderId[item.order_id].push(item);
      });
      
      // Agregar items a cada orden
      return orders.map(order => ({
        ...order,
        items: itemsByOrderId[order.id] || []
      }));
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      throw error;
    }
  }

  // Obtener una orden por ID con sus items
  static async getOrderById(id: string): Promise<Order | null> {
    try {
      // Obtener la orden
      const orderResult = await query(
        'SELECT * FROM orders WHERE id = $1',
        [id]
      );
      
      if (orderResult.rows.length === 0) {
        return null;
      }
      
      const order = orderResult.rows[0];
      
      // Obtener los items de la orden
      const itemsResult = await query(
        'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
        [id]
      );
      
      return {
        ...order,
        items: itemsResult.rows
      };
    } catch (error) {
      console.error('Error obteniendo orden por ID:', error);
      throw error;
    }
  }

  // Crear una nueva orden con sus items (transacción)
  static async createOrder(input: CreateOrderInput): Promise<Order> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Convertir fecha si es string
      const orderDate = input.date instanceof Date 
        ? input.date 
        : new Date(input.date);
      
      // Parsear fecha_pago que puede venir como "dd/mm/yyyy"
      const fechaPago = parseFechaPago(input.fecha_pago);

      // Verificar si el cliente ya está registrado
      const cedula = input.customer_cedula;
      let customerRes = await client.query('SELECT * FROM customers WHERE cedula = $1', [cedula]);

      //Si no está registrado, registrarlo primero
      if (customerRes.rows.length === 0) {
        await client.query(
          `INSERT INTO customers (cedula, full_name, email, phone, address, created_at)
           VALUES ($1,$2,$3,$4,$5,NOW())`,
          [cedula, input.customer_full_name, input.customer_email, input.customer_phone, input.customer_address]
        );
      }

      // Insertar la orden
      const orderResult = await client.query(
        `INSERT INTO orders (
          order_number, date, customer_full_name, customer_cedula,
          customer_email, customer_phone, customer_address,
          fecha_pago, comprobante, banco_emisor,
          total, payment_method, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          input.order_number,
          orderDate,
          input.customer_full_name,
          input.customer_cedula,
          input.customer_email,
          input.customer_phone,
          input.customer_address,
          fechaPago,
          input.comprobante || null,
          input.banco_emisor || null,
          input.total,
          input.payment_method,
          'pending' // Estado inicial
        ]
      );
      
      const order = orderResult.rows[0];
      
      // Insertar los items de la orden
      if (input.items && input.items.length > 0) {
        for (const item of input.items) {
          await client.query(
            `INSERT INTO order_items (
              order_id, product_id, product_name, product_price, quantity
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [
              order.id,
              item.product_id,
              item.product_name,
              item.product_price,
              item.quantity
            ]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Obtener la orden completa con items
      const completeOrder = await this.getOrderById(order.id);
      return completeOrder!;
    }
     catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error creando orden:', error);
      // Log detallado para debugging
      if (error.message) {
        console.error('Mensaje de error:', error.message);
      }
      if (error.code) {
        console.error('Código de error PostgreSQL:', error.code);
      }
      if (error.detail) {
        console.error('Detalle del error:', error.detail);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar el estado de una orden
  static async updateOrderStatus(
    id: string,
    input: UpdateOrderInput
  ): Promise<Order | null> {
    try {
      if (!input.status) {
        return await this.getOrderById(id);
      }
      
      const result = await query(
        `UPDATE orders 
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [input.status, id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Obtener la orden completa con items
      return await this.getOrderById(id);
    } catch (error) {
      console.error('Error actualizando estado de orden:', error);
      throw error;
    }
  }
}

