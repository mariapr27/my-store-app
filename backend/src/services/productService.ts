import { query } from '../config/database';
import { Product, CreateProductInput, UpdateProductInput } from '../types/database';

const API_URL = 'http://localhost:3000';

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export class ProductService {
  // Obtener todos los productos
  static async getAllProducts(): Promise<Product[]> {
    try {
      const result = await query(
        'SELECT id, name, description, price, stock, image_url, category, sale_type, created_at, updated_at FROM products ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  }

  
  // Obtener un producto por ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const result = await query( 
        'SELECT * FROM products WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo producto por ID:', error);
      throw error;
    }
  }

  // Crear un nuevo producto
  static async createProduct(input: CreateProductInput): Promise<Product> {
    try {
      const result = await query(
        `INSERT INTO products (name, description, price, stock, image_url, category, sale_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          input.name,
          input.description || null,
          input.price,
          input.stock || 0,
          input.image_url || null,
          input.category || null,
          input.saleType || null,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  }

  // Actualizar un producto
  static async updateProduct(
    id: string,
    input: UpdateProductInput
  ): Promise<Product | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(input.name);
      }
      if (input.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(input.description);
      }
      if (input.price !== undefined) {
        fields.push(`price = $${paramIndex++}`);
        values.push(input.price);
      }
      if (input.stock !== undefined) {
        fields.push(`stock = $${paramIndex++}`);
        values.push(input.stock);
      }
      if (input.image_url !== undefined) {
        fields.push(`image_url = $${paramIndex++}`);
        values.push(input.image_url);
      }
      if (input.category !== undefined) {
        fields.push(`category = $${paramIndex++}`);
        values.push(input.category);
      }
      if (input.saleType !== undefined) {
        fields.push(`sale_type = $${paramIndex++}`);
        values.push(input.saleType);
      }

      if (fields.length === 0) {
        return await this.getProductById(id);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await query(
        `UPDATE products 
         SET ${fields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  }

  // Eliminar un producto
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  }
}

