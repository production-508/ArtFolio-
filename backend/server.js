require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Healthcheck immédiat (avant tout le reste)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Désactiver les ETags pour éviter les 304 côté client
app.disable('etag');
app.set('etag', false);

// Middlewares
app.use(helmet()); // Basic security headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to be requested from frontend
// CORS - permettre toutes les origines en production ou configurer spécifiquement
const corsOrigins = process.env.CORS_ORIGIN 
  ? [process.env.CORS_ORIGIN, 'http://localhost:8080', 'http://localhost:5173']
  : ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());

// Servir les images d'art téléchargées localement
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  maxAge: '7d',
  setHeaders: (res) => { res.set('Access-Control-Allow-Origin', '*'); },
}));

// Initialiser la BDD (crée et seede si nécessaire)
initDb();

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/gallery',  require('./routes/gallery'));   // alias frontend
app.use('/api/artists',  require('./routes/artists'));
app.use('/api/artist',   require('./routes/artist'));    // dashboard artiste
app.use('/api/stats',    require('./routes/stats'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/img',      require('./routes/img'));        // proxy images
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/chat',     require('./routes/chat'));      // Chatbot expert d'art

// Initialiser la BDD (async, ne bloque pas le démarrage)
const { initDb } = require('./db/init');
initDb().then(() => console.log('✅ Base de données initialisée')).catch(console.error);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON invalide' });
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : err.message || 'Erreur interne',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎨 ArtFolio API démarrée sur http://0.0.0.0:${PORT}`);
  console.log(`   • GET  /api/health`);
  console.log(`   • POST /api/auth/login`);
  console.log(`   • GET  /api/artworks`);
  console.log(`   • GET  /api/artists`);
  console.log(`   • GET  /api/stats`);
  console.log(`   • POST /api/ai/generate-profile`);
  console.log(`   • POST /api/chat/art-advisor`);
});
