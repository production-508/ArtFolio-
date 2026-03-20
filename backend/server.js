// Serveur Express minimal pour Railway - Version debug
console.log('🚀 DémARRAGE server.js');

try {
  require('dotenv').config();
  const express = require('express');
  const path = require('path');

  const app = express();
  const PORT = process.env.PORT || 3001;

  console.log('📡 PORT=', PORT);
  console.log('🌐 RAILWAY_ENVIRONMENT=', process.env.RAILWAY_ENVIRONMENT || 'undefined');

  // ============================================
  // HEALTHCHECK - ABSOLUMENT EN PREMIER
  // ============================================
  
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
  // FRONTEND (dossier dist)
  // ============================================
  const distPath = path.join(__dirname, '..', 'dist');
  const fs = require('fs');
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('📂 Frontend static:', distPath);
    
    // SPA fallback (toutes les routes non-API)
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('ArtFolio API Server - Frontend building...');
      }
    });
  } else {
    console.warn('⚠️ dist/ not found');
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(200).send('ArtFolio API Server');
    });
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
