// Serveur Express minimal pour Railway - Version debug
console.log('🚀 DémARRAGE server.js');

try {
  require('dotenv').config();
  const express = require('express');
  const path = require('path');
  const fs = require('fs');

  const app = express();
  const PORT = process.env.PORT || 3001;

  console.log('📡 PORT=', PORT);
  console.log('🌐 RAILWAY_ENVIRONMENT=', process.env.RAILWAY_ENVIRONMENT || 'undefined');
  console.log('📁 __dirname=', __dirname);

  // Vérifier si dist existe
  const distPath = path.join(__dirname, '..', 'dist');
  console.log('📂 distPath=', distPath);
  console.log('📂 dist exists=', fs.existsSync(distPath));
  if (fs.existsSync(distPath)) {
    console.log('📂 dist contents=', fs.readdirSync(distPath));
  }

  // ============================================
  // HEALTHCHECK - ABSOLUMENT EN PREMIER
  // ============================================
  
  // Route racine explicite
  app.get('/', (req, res) => {
    console.log('💓 / appelé');
    res.status(200).send('<h1>ArtFolio API OK</h1><p><a href="/api/health">Health</a></p>');
  });

  // Healthcheck Railway (doit répondre immédiatement)
  app.get('/health', (req, res) => {
    console.log('💓 /health appelé');
    res.status(200).send('OK');
  });

  app.get('/api/health', (req, res) => {
    console.log('💓 /api/health appelé');
    res.status(200).json({ status: 'ok', time: Date.now() });
  });

  // ============================================
  // MIDDLEWARES
  // ============================================
  app.use(require('helmet')());
  app.use(require('cors')({ origin: '*', credentials: true }));
  app.use(express.json());

  // ============================================
  // ROUTES API (avec try-catch)
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

  for (const [routePath, modulePath] of routes) {
    try {
      app.use(routePath, require(modulePath));
      console.log(`✅ ${routePath}`);
    } catch (err) {
      console.warn(`⚠️ ${routePath} failed:`, err.message.split('\n')[0]);
      app.use(routePath, (req, res) => res.status(503).json({ error: 'Unavailable' }));
    }
  }

  // ============================================
  // FRONTEND (dossier dist) - APRÈS les routes API
  // ============================================
  
  if (fs.existsSync(distPath)) {
    // Servir les fichiers statiques sauf index.html
    app.use(express.static(distPath, { index: false }));
    console.log('📂 Frontend static servi depuis:', distPath);
    
    // SPA fallback pour les routes non-API (sauf la racine déjà définie)
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api') || req.path === '/') {
        return res.status(404).json({ error: 'Not found' });
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('ArtFolio - Frontend en cours de construction');
      }
    });
  } else {
    console.warn('⚠️ dist/ not found - mode API uniquement');
  }

  // ============================================
  // DÉMARRAGE
  // ============================================
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });

  // DB init en arrière-plan (non bloquant)
  setTimeout(() => {
    try {
      const { initDb } = require('./db/init');
      initDb().then(() => console.log('✅ DB OK')).catch(e => console.log('⚠️ DB:', e.message));
    } catch (e) {
      console.log('⚠️ DB init failed:', e.message);
    }
  }, 100);

} catch (err) {
  console.error('💥 FATAL:', err);
  process.exit(1);
}
