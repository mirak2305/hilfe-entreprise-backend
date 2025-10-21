import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Import des routes
import { authRoutes } from './routes/auth.routes';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});
app.use(limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));

// Routes de l'API
app.use('/api/auth', authRoutes);

// Routes de base
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'HILFE Enterprise Backend',
    version: '2.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🚀 HILFE Enterprise Platform API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs globales
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
 
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 HILFE Enterprise Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
 
  // Vérification des variables d'environnement
  if (!process.env.SUPABASE_URL) {
    console.warn('⚠️  SUPABASE_URL non configuré');
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY non configuré');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET non configuré');
  }
});
