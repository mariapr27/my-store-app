import { Router, Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { CreateOrderInput, UpdateOrderInput, ApiResponse } from '../types/database';

const router = Router();

// GET /api/orders - Obtener todas las órdenes
router.get('/', async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.json({
      success: true,
      data: orders,
      message: 'Órdenes obtenidas exitosamente',
    });
  } catch (error: any) {
    console.error('Error en GET /api/orders:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener órdenes',
    });
  }
});

// GET /api/orders/:id - Obtener una orden por ID
router.get('/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
      });
    }

    const order = await OrderService.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada',
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Orden obtenida exitosamente',
    });
  } catch (error: any) {
    console.error('Error en GET /api/orders/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener la orden',
    });
  }
});

// POST /api/orders - Crear una nueva orden
router.post('/', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const body = req.body;
    
    // Validación básica
    if (!body.orderNumber || !body.customer || !body.items || body.total === undefined) {
      return res.status(400).json({
        success: false,
        error: 'orderNumber, customer, items y total son requeridos',
      });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La orden debe tener al menos un item',
      });
    }

    if (body.total < 0) {
      return res.status(400).json({
        success: false,
        error: 'El total debe ser mayor o igual a 0',
      });
    }

    // Validar campos del cliente
    const customer = body.customer;
    if (!customer.fullName || !customer.cedula || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos del cliente son requeridos',
      });
    }

    // Mapear del formato frontend al formato del backend
    const input: CreateOrderInput = {
      order_number: body.orderNumber,
      date: body.date || new Date(),
      customer_full_name: customer.fullName,
      customer_cedula: customer.cedula,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customer.address,
      fecha_pago: customer.fechaPago || body.fechaPago,
      comprobante: customer.comprobante || body.comprobante,
      banco_emisor: customer.bancoEmisor || body.bancoEmisor,
      total: Number(body.total),
      payment_method: body.paymentMethod || 'Transferencia',
      items: body.items.map((item: any) => ({
        product_id: String(item.product?.id || item.productId),
        product_name: item.product?.name || item.productName,
        product_price: Number(item.product?.price || item.productPrice),
        quantity: Number(item.quantity),
      })),
    };

    const order = await OrderService.createOrder(input);
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Orden creada exitosamente',
    });
  } catch (error: any) {
    console.error('Error en POST /api/orders:', error);
    // Log detallado del error
    if (error.message) {
      console.error('Mensaje:', error.message);
    }
    if (error.code) {
      console.error('Código PostgreSQL:', error.code);
    }
    if (error.detail) {
      console.error('Detalle:', error.detail);
    }
    // Enviar mensaje de error más descriptivo al cliente
    const errorMessage = error.detail || error.message || 'Error al crear la orden';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// PUT /api/orders/:id/status - Actualizar estado de una orden
router.put('/:id/status', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
      });
    }

    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'El campo status es requerido',
      });
    }

    // Validar que el status sea uno de los valores permitidos
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status debe ser uno de: ${validStatuses.join(', ')}`,
      });
    }

    const input: UpdateOrderInput = { status };
    const order = await OrderService.updateOrderStatus(id, input);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada',
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Estado de orden actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error en PUT /api/orders/:id/status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar el estado de la orden',
    });
  }
});

export default router;

