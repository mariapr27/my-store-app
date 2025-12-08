import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { testConnection, closePool } from './config/database';
import { corsMiddleware } from './middleware/cors';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parsear JSON en el body
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded
app.use(corsMiddleware); // CORS para React Native

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const dbConnected = await testConnection();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API del Store App',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      orders: '/api/orders',
    },
  });
});

// Manejo de rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

// Manejo de errores global
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Iniciar servidor
const server = app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Verificando conexión a PostgreSQL...`);
  
  // Probar conexión a la base de datos
  await testConnection();
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(async () => {
    console.log('Servidor cerrado');
    await closePool();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando servidor...');
  server.close(async () => {
    console.log('Servidor cerrado');
    await closePool();
    process.exit(0);
  });
});

export default app;

