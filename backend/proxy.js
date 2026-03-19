/**
 * Serveur proxy ArtFolio
 * Analyse du bundle compilé :
 * - /api/gallery & /api/gallery/featured → le front accède à S.artworks → NE PAS transformer (garder {artworks:[...]})
 * - /api/artists & /api/artists/featured  → le front fait t.slice(0,6) → retourner tableau direct [...]
 * - /api/artist/artworks → le front fait t?.filter() → retourner tableau direct [...]
 */
const express = require('express');
const path    = require('path');
const http    = require('http');

const app          = express();
const FRONTEND_DIR = path.join(__dirname, '..');
const API_PORT     = 3001;
const PORT         = 8080;

// Routes qui doivent être transformées en tableau direct
const TO_ARRAY = {
  '/api/gallery/featured': d => d.artworks ?? d,  // homepage: (e||[]).slice(0,6)
  '/api/artists':          d => d.artists  ?? d,  // homepage: t.slice(0,6)
  '/api/artist/artworks':  d => d.artworks ?? d,  // dashboard artiste
  '/api/artist/leads':     d => d.leads    ?? d,  // dashboard artiste
  // NOTE: /api/gallery (sans /featured) NE doit PAS être transformé —
  // la page Galerie accède à S?.artworks.map() ie elle attend {artworks:[...]}
};

// Alias de routes (frontend → backend)
const ALIASES = {
  '/api/auth/signin': '/api/auth/login',
};

app.use('/port/5000/api', (req, res) => {
  const originalPath = `/api${req.url.split('?')[0]}`;
  const queryString  = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';

  // Appliquer les alias
  const targetPath = ALIASES[originalPath] ?? `/api${req.url}`;
  console.log(`→ [PROXY] ${req.method} ${originalPath} → ${targetPath}`);

  // Supprimer les headers conditionnels pour forcer 200 (pas de 304)
  const forwardHeaders = { ...req.headers, host: `localhost:${API_PORT}` };
  delete forwardHeaders['if-none-match'];
  delete forwardHeaders['if-modified-since'];
  delete forwardHeaders['if-unmodified-since'];
  delete forwardHeaders['if-match'];

  const options = {
    hostname: 'localhost',
    port: API_PORT,
    path: targetPath,
    method: req.method,
    headers: forwardHeaders,
  };

  const proxy = http.request(options, apiRes => {
    let raw = '';
    apiRes.on('data', c => raw += c);
    apiRes.on('end', () => {
      const transformKey = Object.keys(TO_ARRAY).find(k => originalPath.startsWith(k));
      if (!transformKey) {
        // Pas de transformation → passer tel quel avec no-cache
        const headers = {
          ...apiRes.headers,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        };
        res.writeHead(apiRes.statusCode, headers);
        return res.end(raw);
      }
      try {
        const parsed      = JSON.parse(raw);
        const transformed = TO_ARRAY[transformKey](parsed);
        const out         = JSON.stringify(transformed);
        res.writeHead(apiRes.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Length': Buffer.byteLength(out),
        });
        res.end(out);

      } catch {
        res.writeHead(apiRes.statusCode, apiRes.headers);
        res.end(raw);
      }
    });
  });

  proxy.on('error', err => {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Backend inaccessible' });
  });

  req.pipe(proxy, { end: true });
});

// Forward /images/* et /api/* vers le backend (port 3001)
function proxyToBackend(req, res, backendPath) {
  const options = {
    hostname: 'localhost',
    port: API_PORT,
    path: backendPath + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''),
    method: req.method,
    headers: { ...req.headers, host: `localhost:${API_PORT}` },
  };
  const proxy = http.request(options, apiRes => {
    res.writeHead(apiRes.statusCode, { ...apiRes.headers, 'Access-Control-Allow-Origin': '*' });
    apiRes.pipe(res, { end: true });
  });
  proxy.on('error', () => res.status(502).send('Backend error'));
  req.pipe(proxy, { end: true });
}

// Images locales depuis le backend
app.use('/images', (req, res) => proxyToBackend(req, res, '/images' + req.url));

// Fichiers statiques
app.use(express.static(FRONTEND_DIR));
app.get('*', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

app.listen(PORT, () => {
  console.log(`🌐 Proxy ArtFolio sur http://localhost:${PORT}`);
  console.log(`   → /port/5000/api/* → http://localhost:${API_PORT}/api/*`);
  console.log(`   → Transformations : artists → array, artworks → array, leads → array`);
  console.log(`   → Alias : /api/auth/signin → /api/auth/login`);
});
