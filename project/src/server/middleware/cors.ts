import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:5173', // No trailing slash
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
  exposedHeaders: ['Content-Length', 'Content-Type'],
};

export const corsMiddleware = cors(corsOptions);
