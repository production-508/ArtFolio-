// Serveur Express ultra-minimal pour Railway
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting server on port', PORT);

// Healthcheck immédiat
app.get('/health', (req, res) => res.send('OK'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Middleware basique (SANS helmet pour debug)
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Test route
app.get('/test', (req, res) => res.json({ msg: 'Server is running', time: Date.now() }));

// Routes API (chargées une par une avec try-catch)
const routes = [
  ['/api/auth', './routes/auth'],
  ['/api/artworks', './routes/artworks'],
  ['/api/artists', './routes/artists'],
  ['/api/artist', './routes/artist'],
  ['/api/stats', './routes/stats'],
  ['/api/ai', './routes/ai'],
  ['/api/chat', './routes/chat'],
];

routes.forEach(([path, mod]) => {
  try {
    app.use(path, require(mod));
    console.log('✅ Route:', path);
  } catch (e) {
    console.log('⚠️ Route failed:', path, e.message);
    app.use(path, (req, res) => res.status(503).json({ error: 'Service unavailable' }));
  }
});

// Stripe (optionnel)
try {
  app.use('/api/stripe', require('./routes/stripe'));
  console.log('✅ Stripe route');
} catch (e) {
  console.log('⚠️ Stripe not available');
}

// Frontend static
try {
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('✅ Static files from:', distPath);
    
    // SPA fallback
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.send('ArtFolio Server - Frontend not built');
      }
    });
  } else {
    console.log('⚠️ No dist folder');
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      res.send('ArtFolio API Server is running');
    });
  }
} catch (e) {
  console.error('Static files error:', e);
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server listening on port', PORT);
});

// DB init (background)
setTimeout(() => {
  try {
    const { initDb } = require('./db/init');
    initDb().then(() => console.log('✅ DB ready')).catch(e => console.log('DB error:', e.message));
  } catch (e) {
    console.log('DB not available:', e.message);
  }
}, 100);

module.exports = { app, server };
