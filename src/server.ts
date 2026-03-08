import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { connectDB } from '../dbconfig';
import { userRoutes } from './routes/userRoutes';
import { authRoutes } from './routes/authRoutes';
import { sanitRoutes } from './routes/sanitizeJSONDB';
import cardRoutes from './routes/cardRoutes';
import cardsByUserRoutes from './routes/cardsByUserRoutes';
import deckByUserRoutes from './routes/deckByUserRoutes';
import { friendInviteRoutes } from './routes/friendInviteRoutes';
import { friendRoutes } from './routes/friendRoutes';

import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente baseadas no NODE_ENV (padrão: development)
const environment = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${environment}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Fallback para .env genérico se .env.development não existir
}

const app = express();
const PORT = process.env.PORT || 4000;

// Conectar ao Banco de Dados
connectDB();

// Middlewares globais
app.use(helmet()); // Segurança
app.use(cors()); // CORS
app.use(morgan('combined')); // Logs
app.use(express.json({ limit: '10mb' })); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL encoded

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', sanitRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/cards-by-user', cardsByUserRoutes);
app.use('/api/decks-by-user', deckByUserRoutes);
app.use('/api/friend-invites', friendInviteRoutes);
app.use('/api/friends', friendRoutes);

// Rota 404
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});