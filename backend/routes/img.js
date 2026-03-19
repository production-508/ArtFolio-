const express = require('express');
const https = require('https');
const http = require('http');
const router = express.Router();

// Streaming proxy transparent pour les images externes — évite les restrictions CORS

/**
 * GET /api/img?url={encoded_url}
 * Proxy transparent pour les images externes — évite les restrictions CORS
 */
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url parameter');

  // Sécurité basique : limiter aux domaines autorisés
  const allowedHosts = [
    'upload.wikimedia.org',
    'www.artic.edu',
    'images.unsplash.com',
    'picsum.photos',
    'loremflickr.com',
    'live.staticflickr.com',
  ];

  let parsedUrl;
  try { parsedUrl = new URL(url); }
  catch { return res.status(400).send('Invalid URL'); }

  if (!allowedHosts.some(h => parsedUrl.hostname === h)) {
    return res.status(403).send('Domain not allowed');
  }

  // Télécharger l'image
  const protocol = parsedUrl.protocol === 'https:' ? https : http;
  const request = protocol.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ArtFolioBot/1.0)',
      'Accept': 'image/*',
    },
    timeout: 10000,
  }, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
      // Suivre les redirections
      const location = response.headers.location;
      if (location) {
        return res.redirect(`/api/img?url=${encodeURIComponent(location)}`);
      }
    }

    if (response.statusCode !== 200) {
      return res.status(response.statusCode).send('Image fetch failed');
    }

    const contentType = response.headers['content-type'] || 'image/jpeg';

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Access-Control-Allow-Origin', '*');
    
    // Utiliser les streams pour éviter la saturation mémoire (OOM)
    response.pipe(res);
  });

  request.on('error', err => {
    console.error('Image proxy error:', err.message);
    res.status(502).send('Image fetch error');
  });

  request.on('timeout', () => {
    request.destroy();
    res.status(504).send('Image fetch timeout');
  });
});

module.exports = router;
