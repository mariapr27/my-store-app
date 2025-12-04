-- Script SQL para crear la tabla de productos
-- Ejecuta este script en tu base de datos PostgreSQL antes de usar la API

-- Crear la tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    image_url VARCHAR(500),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Crear índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en cada UPDATE
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos productos de ejemplo (opcional)
INSERT INTO products (name, description, price, stock, category) VALUES
    ('Producto Ejemplo 1', 'Descripción del producto ejemplo 1', 29.99, 10, 'Electrónica'),
    ('Producto Ejemplo 2', 'Descripción del producto ejemplo 2', 49.99, 5, 'Ropa'),
    ('Producto Ejemplo 3', 'Descripción del producto ejemplo 3', 19.99, 20, 'Hogar')
ON CONFLICT DO NOTHING;

