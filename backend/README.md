# Backend API - Store App

Backend desarrollado con Node.js, Express, TypeScript y PostgreSQL.

## Requisitos Previos

1. **PostgreSQL instalado y corriendo** en tu máquina local
2. **Node.js** (versión 20 o superior recomendada)
3. **npm** o **yarn**

## Configuración Inicial

### 1. Crear la Base de Datos

Conéctate a PostgreSQL y crea la base de datos:

```sql
CREATE DATABASE my_store_db;
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_store_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_SSL=false

# Server Configuration
PORT=3000
```

**Nota:** Asegúrate de que `.env` esté en tu `.gitignore` para no versionar credenciales.

### 3. Crear las Tablas

Ejecuta el script SQL para crear las tablas necesarias:

```bash
psql -U postgres -d my_store_db -f backend/database/schema.sql
```

O desde la línea de comandos de PostgreSQL:

```sql
\i backend/database/schema.sql
```

## Ejecutar el Servidor

### Modo Desarrollo (con hot reload)

```bash
npm run dev:server
```

### Compilar TypeScript

```bash
npm run build:server
```

### Ejecutar versión compilada

```bash
npm run start:server
```

## Endpoints de la API

### Health Check
- **GET** `/health` - Verifica el estado del servidor y la conexión a la base de datos

### Productos
- **GET** `/api/products` - Obtener todos los productos
- **GET** `/api/products/:id` - Obtener un producto por ID
- **POST** `/api/products` - Crear un nuevo producto
- **PUT** `/api/products/:id` - Actualizar un producto
- **DELETE** `/api/products/:id` - Eliminar un producto

## Ejemplos de Uso

### Crear un producto

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Producto",
    "description": "Descripción del producto",
    "price": 99.99,
    "stock": 10,
    "category": "Electrónica"
  }'
```

### Obtener todos los productos

```bash
curl http://localhost:3000/api/products
```

### Obtener un producto por ID

```bash
curl http://localhost:3000/api/products/1
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts      # Configuración de PostgreSQL
│   ├── middleware/
│   │   └── cors.ts           # Configuración CORS
│   ├── routes/
│   │   └── productRoutes.ts  # Rutas de productos
│   ├── services/
│   │   └── productService.ts # Lógica de negocio
│   ├── types/
│   │   └── database.ts       # Tipos TypeScript
│   └── server.ts             # Servidor Express
├── database/
│   └── schema.sql            # Script SQL para crear tablas
├── dist/                     # Código compilado (generado)
└── tsconfig.json             # Configuración TypeScript
```

## Conectar desde React Native

Desde tu aplicación React Native, puedes hacer requests al backend usando `fetch` o `axios`:

```typescript
const API_URL = 'http://localhost:3000'; // Cambiar por la IP de tu máquina en desarrollo móvil

// Ejemplo: Obtener productos
const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};
```

**Nota importante para React Native:** En desarrollo móvil, usa la IP de tu máquina en lugar de `localhost`. Por ejemplo: `http://192.168.1.100:3000`

## Próximos Pasos

1. Implementar autenticación con Firebase Auth
2. Agregar más endpoints según tus necesidades
3. Implementar validación más robusta
4. Agregar tests
5. Configurar deployment en producción

