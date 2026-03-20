// DEBUG: Log de démarrage immédiat
console.log('🚀 server.js chargé');
console.log('📁 Répertoire courant:', __dirname);
console.log('📁 Répertoire parent:', require('path').join(__dirname, '..'));

try {
  console.log('⏳ Chargement des dépendances...');
  require('dotenv').config();
  console.log('✅ dotenv chargé');
  
  const express = require('express');
  console.log('✅ express chargé');
  
  const cors = require('cors');
  console.log('✅ cors chargé');
  
  const helmet = require('helmet');
  console.log('✅ helmet chargé');
  
  const path = require('path');
  console.log('✅ path chargé');

  const app = express();
  const PORT = process.env.PORT || 3001;
  console.log('📡 Port configuré:', PORT);
  console.log('🔍 ENV PORT:', process.env.PORT);
  console.log('🌐 Railway environnement:', process.env.RAILWAY_ENVIRONMENT || 'non-Railway');

  // ============================================
  // 1. HEALTHCHECK IMMÉDIAT (plusieurs routes pour compatibilité)
  // ============================================
  app.get('/api/health', (req, res) => {
    console.log('💓 Healthcheck /api/health appelé');
    res.status(200).json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
  });

  app.get('/health', (req, res) => {
    console.log('💓 Healthcheck /health appelé');
    res.status(200).json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
  });

  // Healthcheck ultra-simple pour Railway (répond immédiatement)
  app.get('/', (req, res) => {
    if (req.query.health === '1' || req.path === '/') {
      console.log('💓 Root healthcheck appelé');
      return res.status(200).send('OK');
    }
    res.redirect('/api/health');
  });

  // ============================================
  // 2. CONFIGURATION
  // ============================================
  app.disable('etag');
  app.set('etag', false);

  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

  const corsOrigins = process.env.CORS_ORIGIN 
    ? [process.env.CORS_ORIGIN, 'http://localhost:8080', 'http://localhost:5173']
    : ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'];

  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json());

  console.log('✅ Middlewares configurés');

  // ============================================
  // 3. ROUTES API (avec try-catch pour chaque require)
  // ============================================
  const routes = [
    ['/api/auth', './routes/auth'],
    ['/api/artworks', './routes/artworks'],
    ['/api/gallery', './routes/gallery'],
    ['/api/artists', './routes/artists'],
    ['/api/artist', './routes/artist'],
    ['/api/stats', './routes/stats'],
    ['/api/ai', './routes/ai'],
    ['/api/img', './routes/img'],
    ['/api/admin', './routes/admin'],
    ['/api/chat', './routes/chat'],
    ['/api/stripe', './routes/stripe'],
  ];

  for (const [path, modulePath] of routes) {
    try {
      app.use(path, require(modulePath));
      console.log(`✅ Route ${path} chargée`);
    } catch (err) {
      console.warn(`⚠️ Route ${path} non chargée:`, err.message);
      // Route de fallback
      app.use(path, (req, res) => res.status(503).json({ error: 'Service temporairement indisponible' }));
    }
  }

  // ============================================
  // 4. FRONTEND
  // ============================================
  const frontendDistPath = path.join(__dirname, '..', 'dist');
  console.log('📂 Chemin frontend:', frontendDistPath);
  
  if (require('fs').existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    console.log('✅ Frontend statique servi');
  } else {
    console.warn('⚠️ Dossier dist non trouvé');
  }

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: `Route API introuvable : ${req.method} ${req.path}` });
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(503).send('Frontend en cours de déploiement...');
    }
  });

  // ============================================
  // 5. ERROR HANDLER
  // ============================================
  app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' ? 'Erreur interne' : err.message 
    });
  });

  // ============================================
  // 6. DÉMARRAGE
  // ============================================
  console.log('⏳ Démarrage du serveur sur port', PORT, '...');
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎨 ArtFolio démarré sur http://0.0.0.0:${PORT}`);
    console.log(`   • API Health: /api/health`);
    console.log(`✅ Serveur prêt et en écoute`);
  });

  server.on('listening', () => {
    console.log(`🔊 Server listening event fired on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('❌ Erreur serveur:', err);
    process.exit(1);
  });

  // ============================================
  // 7. DB INITIALIZATION (background)
  // ============================================
  setTimeout(() => {
    try {
      const { initDb } = require('./db/init');
      initDb().then(() => console.log('✅ DB initialisée')).catch(err => {
        console.warn('⚠️ DB erreur:', err.message);
      });
    } catch (err) {
      console.warn('⚠️ DB non disponible:', err.message);
    }
  }, 100);

} catch (startupErr) {
  console.error('💥 ERREUR CRITIQUE AU DÉMARRAGE:', startupErr);
  console.error(startupErr.stack);
  process.exit(1);
}
