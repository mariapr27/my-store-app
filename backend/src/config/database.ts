import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la base de datos
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'my_store_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo de espera para establecer conexión
};

// Crear pool de conexiones
export const pool = new Pool(dbConfig);

// Manejar errores del pool
pool.on('error', (err, client) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    return false;
  }
};

// Función para cerrar el pool correctamente
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('Pool de PostgreSQL cerrado correctamente');
  } catch (error) {
    console.error('Error cerrando el pool de PostgreSQL:', error);
  }
};

// Función helper para ejecutar queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error ejecutando query:', { text, error });
    throw error;
  }
};

export default pool;

