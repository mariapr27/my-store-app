import { pool, query } from '../config/database';
import { Order, OrderItem, CreateOrderInput, UpdateOrderInput } from '../types/database';

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
      
      const fechaPago = input.fecha_pago 
        ? (input.fecha_pago instanceof Date 
            ? input.fecha_pago 
            : new Date(input.fecha_pago))
        : null;
      
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
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando orden:', error);
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

