const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();

// Configurations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Middleware
app.use(cors({
  origin: [
    'https://hilfe-entreprise-frontend-8o7w.vercel.app',
    'https://hilfe-entreprise-frontend-8o7w-68fcnuw1j-karim2305s-projects.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// === ROUTES PUBLIQUES ===

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hilfe Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }

    res.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || 'Utilisateur'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: data.user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
});

// === ROUTES PROTÉGÉES ===

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erreur d authentification' });
  }
};

// Profile utilisateur
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.user_metadata?.name,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
});

// Route OpenAI (Assistant AI)
app.post('/api/ai/assist', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false,
        message: 'Message requis' 
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant helpful pour l'application Hilfe Entreprise. Réponds de manière professionnelle et utile."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      response: aiResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur avec le service AI' 
    });
  }
});

// Dashboard data
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // Récupérer des données de Supabase
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({
      success: true,
      dashboard: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.user_metadata?.name
        },
        stats: {
          projects: 12,
          tasks: 45,
          completed: 38,
          revenue: 2540
        },
        profiles: profiles || []
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Supabase: ${supabaseUrl ? 'Connected' : 'Not configured'}`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
});
