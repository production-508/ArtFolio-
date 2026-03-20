CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'artist' CHECK(role IN ('artist', 'admin', 'collector')),
  plan TEXT NOT NULL DEFAULT 'starter' CHECK(plan IN ('starter', 'pro', 'galerie')),
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  instagram TEXT,
  -- Champs génénérés par l'IA
  ai_bio TEXT,
  ai_statement TEXT,
  ai_style_tags TEXT, -- JSON array stocké en texte: ["Abstrait","Minimaliste","Contemporain"]
  ai_tokens_used INTEGER DEFAULT 0,
  ai_generated_at TEXT,
  saved_themes TEXT, -- JSON array de thèmes sauvegardés
  -- Champs Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'none' CHECK(subscription_status IN ('none', 'incomplete', 'active', 'past_due', 'canceled')),
  subscription_price_id TEXT,
  subscription_current_period_start TEXT,
  subscription_current_period_end TEXT,
  stripe_account_id TEXT, -- Pour les vendeurs (Connect)
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medium TEXT NOT NULL,
  style TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  available INTEGER NOT NULL DEFAULT 1 CHECK(available IN (0, 1)),
  image_url TEXT,
  year INTEGER,
  dimensions TEXT,
  featured INTEGER DEFAULT 0 CHECK(featured IN (0, 1)),
  view_count INTEGER DEFAULT 0,
  -- Champs d'analyse IA (legacy)
  analyzed_at TEXT,
  analysis_data TEXT,
  suggested_tags TEXT,
  suggested_price_min INTEGER,
  suggested_price_max INTEGER,
  -- NOUVEAU: Rich Document complet
  rich_document TEXT,              -- JSON complet avec Vision + OCR + Contexte
  searchable_text TEXT,            -- Texte pour recherche sémantique
  enriched_tags TEXT,              -- JSON array des tags enrichis
  chatbot_summary TEXT,            -- Résumé pour le chatbot
  color_palette TEXT,              -- JSON palette de couleurs
  emotion_tags TEXT,               -- JSON array des émotions
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Table pour les chunks de recherche (préparation LanceDB)
CREATE TABLE IF NOT EXISTS artwork_search_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  chunk_type TEXT NOT NULL,        -- 'full_description', 'visual_only', 'artist_context', etc.
  content TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  embedding BLOB,                  -- Pour futur stockage vectoriel
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chunks_artwork ON artwork_search_chunks(artwork_id);
CREATE INDEX IF NOT EXISTS idx_chunks_type ON artwork_search_chunks(chunk_type);

CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS artwork_collections (
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, collection_id)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_medium ON artworks(medium);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_available ON artworks(available);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON artworks(price);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(featured);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- Table pour les transactions (achats/ventes)
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL, -- Montant total en EUR
  commission REAL NOT NULL, -- Commission ArtFolio (7%)
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  refunded_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artwork ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
