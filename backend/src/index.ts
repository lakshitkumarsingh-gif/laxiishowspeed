import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import logger from './utils/logger';

// Routes
import authRoutes from './routes/auth';
import memoryRoutes from './routes/memory';
import chatRoutes from './routes/chat';
import settingsRoutes from './routes/settings';
import documentRoutes from './routes/documents';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(','),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API version
app.get('/api/version', (req, res) => {
  res.json({ 
    version: '1.0.0', 
    name: 'Neural Tutor Hub',
    features: ['Google OAuth', 'Dual AI (Claude + GPT)', 'Persistent Memory', 'Chat History']
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Neural Tutor Hub Backend v1.0.0`);
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🔌 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  logger.info(`🤖 AI Models: Claude Sonnet + GPT-4`);
  logger.info(`📊 Database: PostgreSQL`);
  logger.info(`💾 Cache: Redis`);
  logger.info(``);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API Docs: http://localhost:${PORT}/api/version`);
});

export default app;
