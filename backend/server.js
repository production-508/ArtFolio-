// Serveur Express pour Railway - Version debug static files
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting server...');
console.log('📡 process.env.PORT =', process.env.PORT);
console.log('📡 Final PORT =', PORT);
console.log('📁 __dirname =', __dirname);

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Healthcheck
app.get('/health', (req, res) => res.send('OK'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Debug: voir où on cherche les fichiers
const distPath = path.join(__dirname, '..', 'dist');
const absoluteDistPath = path.resolve(distPath);
console.log('📂 Looking for dist at:', distPath);
console.log('📂 Absolute path:', absoluteDistPath);
console.log('📂 Exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log('📂 Dist contents:', files);
  
  if (fs.existsSync(path.join(distPath, 'assets'))) {
    const assets = fs.readdirSync(path.join(distPath, 'assets'));
    console.log('📂 Assets:', assets);
  }
  
  // Servir les assets avec bon content-type
  app.use('/assets', express.static(path.join(distPath, 'assets')));
  
  // Servir le reste (racine)
  app.use(express.static(distPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  
  console.log('✅ Static files configured');
}

// API Routes
const routes = [
  ['/api/auth', './routes/auth'],
  ['/api/artworks', './routes/artworks'],
  ['/api/artists', './routes/artists'],
  ['/api/artist', './routes/artist'],
  ['/api/stats', './routes/stats'],
  ['/api/ai', './routes/ai'],
  ['/api/chat', './routes/chat'],
];

routes.forEach(([routePath, mod]) => {
  try {
    app.use(routePath, require(mod));
    console.log('✅ API:', routePath);
  } catch (e) {
    console.log('⚠️ API failed:', routePath, e.message.split('\n')[0]);
  }
});

// SPA fallback - doit être DERNIER
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  console.log('🔄 Serving index.html for:', req.path);
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('ArtFolio API Server - No frontend built');
  }
});

// Start
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server listening on port', PORT);
});

// DB init
setTimeout(() => {
  try {
    const { initDb } = require('./db/init');
    initDb().then(() => console.log('✅ DB ready')).catch(e => console.log('DB error:', e.message));
  } catch (e) {
    console.log('DB not available:', e.message);
  }
}, 100);

module.exports = { app, server };
