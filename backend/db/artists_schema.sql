-- ============================================================
-- TABLE: artists - Profils artistes générés automatiquement
-- ============================================================

CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,                           -- Bio générée par IA (150 mots max)
  story TEXT,                         -- Pourquoi il/elle crée (100 mots max)
  tags TEXT,                          -- JSON array: ["Abstrait", "Contemporain", ...] (5 max)
  colorPalette TEXT,                  -- JSON array: ["#1a1a2e", "#e94560", ...] (6 couleurs)
  styleSignature TEXT,                -- Nom du style (ex: "Abstraction Lyrique")
  layoutType TEXT CHECK(layoutType IN ('grid', 'masonry', 'spotlight', 'timeline')),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_artists_userId ON artists(userId);
CREATE INDEX IF NOT EXISTS idx_artists_style ON artists(styleSignature);
CREATE INDEX IF NOT EXISTS idx_artists_layout ON artists(layoutType);

-- ============================================================
-- MIGRATION: Remplir la table depuis les données existantes
-- (à exécuter après création de la table)
-- ============================================================

-- Insérer les artistes existants qui ont des œuvres
INSERT OR IGNORE INTO artists (
  userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt, updatedAt
)
SELECT 
  u.id,
  u.name,
  u.email,
  COALESCE(u.ai_bio, ''),
  COALESCE(u.ai_statement, ''),
  COALESCE(u.ai_style_tags, '[]'),
  '[]',  -- palette vide par défaut
  'Non défini',
  'grid', -- layout par défaut
  u.created_at,
  u.updated_at
FROM users u
WHERE u.role = 'artist'
  AND EXISTS (SELECT 1 FROM artworks a WHERE a.artist_id = u.id);

-- ============================================================
-- TRIGGER: Mettre à jour updatedAt automatiquement
-- ============================================================

CREATE TRIGGER IF NOT EXISTS artists_update_timestamp
AFTER UPDATE ON artists
BEGIN
  UPDATE artists SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================
-- VUE: Artistes enrichis avec métadonnées
-- ============================================================

CREATE VIEW IF NOT EXISTS v_artists_enriched AS
SELECT 
  a.id,
  a.userId,
  a.name,
  a.email,
  a.bio,
  a.story,
  a.tags,
  a.colorPalette,
  a.styleSignature,
  a.layoutType,
  a.createdAt,
  a.updatedAt,
  u.avatar_url,
  u.location,
  u.website,
  u.instagram,
  u.plan,
  COUNT(aw.id) as artwork_count,
  GROUP_CONCAT(DISTINCT aw.medium) as mediums_used,
  GROUP_CONCAT(DISTINCT aw.style) as styles_used
FROM artists a
JOIN users u ON u.id = a.userId
LEFT JOIN artworks aw ON aw.artist_id = a.userId
GROUP BY a.id;

-- ============================================================
-- REQUÊTES UTILES
-- ============================================================

-- Rechercher par tag
-- SELECT * FROM artists WHERE json_array_contains(tags, 'Abstrait');

-- Rechercher par couleur dominante
-- SELECT * FROM artists WHERE colorPalette LIKE '%#e94560%';

-- Liste des styles signatures uniques
-- SELECT DISTINCT styleSignature FROM artists WHERE styleSignature IS NOT NULL;

-- Artistes sans profil généré (à traiter)
-- SELECT u.* FROM users u 
-- LEFT JOIN artists a ON a.userId = u.id 
-- WHERE u.role = 'artist' AND a.id IS NULL;
