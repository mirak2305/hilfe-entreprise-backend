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
import { adminRoutes } from './routes/admin.routes';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
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
app.use('/api/admin', adminRoutes);

// Routes de base
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'HILFE Enterprise Backend',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 HILFE Enterprise Platform API',
    version: '2.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-company', (companyId) => {
    socket.join(`company-${companyId}`);
    console.log(`User ${socket.id} joined company ${companyId}`);
  });
  
  socket.on('chat-message', (data) => {
    // Broadcast message to company room
    io.to(`company-${data.companyId}`).emit('new-message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    available_endpoints: {
      auth: ['POST /api/auth/login', 'GET /api/auth/me', 'POST /api/auth/change-password'],
      admin: ['GET /api/admin/companies', 'POST /api/admin/companies', 'GET /api/admin/companies/:companyId/users', 'POST /api/admin/users'],
      health: 'GET /health'
    }
  });
});

// Gestion des erreurs globales
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 HILFE Enterprise Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`👑 Admin routes: http://localhost:${PORT}/api/admin`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Vérification des variables d'environnement
  const requiredEnvVars = [
    'SUPABASE_URL',
    'OPENAI_API_KEY',
    'JWT_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Variables d\'environnement manquantes:', missingVars);
  } else {
    console.log('✅ Toutes les variables d\'environnement requises sont configurées');
  }
  
  if (!process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY === 'votre_service_role_key_ici') {
    console.warn('⚠️  SUPABASE_SERVICE_KEY non configuré ou valeur par défaut détectée');
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Mode production activé');
  } else {
    console.log('🐛 Mode développement - débogage activé');
  }
});
