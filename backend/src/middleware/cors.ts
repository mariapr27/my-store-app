import { Request, Response, NextFunction } from 'express';

// Configuración CORS para React Native
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Permitir origen desde React Native (puedes especificar IPs o usar * para desarrollo)
  const allowedOrigins = [
    'http://localhost:8081',
    'http://localhost:19006', // Puerto común de Expo
    'exp://localhost:19000', // Expo Go
  ];

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // En desarrollo, permitir todos los orígenes
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

