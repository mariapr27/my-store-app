import { Router, Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { CreateProductInput, UpdateProductInput, ApiResponse } from '../types/database';

const router = Router();

// GET /api/products - Obtener todos los productos
router.get('/', async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json({
      success: true,
      data: products,
      message: 'Productos obtenidos exitosamente',
    });
  } catch (error: any) {
    console.error('Error en GET /api/products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener productos',
    });
  }
});

// GET /api/products/:id - Obtener un producto por ID
router.get('/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
      });
    }

    const product = await ProductService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Producto obtenido exitosamente',
    });
  } catch (error: any) {
    console.error('Error en GET /api/products/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener el producto',
    });
  }
});

// POST /api/products - Crear un nuevo producto
router.post('/', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    // Mapear sale_type (del frontend) a saleType (tipo interno)
    const input: CreateProductInput = {
      ...req.body,
      saleType: req.body.sale_type || req.body.saleType,
    };

    // Validación básica
    if (!input.name || input.price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y precio son requeridos',
      });
    }

    if (input.price < 0) {
      return res.status(400).json({
        success: false,
        error: 'El precio debe ser mayor o igual a 0',
      });
    }

    const product = await ProductService.createProduct(input);
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Producto creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error en POST /api/products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear el producto',
    });
  }
});

// PUT /api/products/:id - Actualizar un producto
router.put('/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
      });
    }

    // Mapear sale_type (del frontend) a saleType (tipo interno)
    const input: UpdateProductInput = {
      ...req.body,
      ...(req.body.sale_type !== undefined && { saleType: req.body.sale_type }),
    };

    // Validación de precio si se proporciona
    if (input.price !== undefined && input.price < 0) {
      return res.status(400).json({
        success: false,
        error: 'El precio debe ser mayor o igual a 0',
      });
    }

    const product = await ProductService.updateProduct(id, input);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Producto actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error en PUT /api/products/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar el producto',
    });
  }
});

// DELETE /api/products/:id - Eliminar un producto
router.delete('/:id', async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
      });
    }

    const deleted = await ProductService.deleteProduct(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error en DELETE /api/products/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al eliminar el producto',
    });
  }
});

export default router;

