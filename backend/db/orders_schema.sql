-- ============================================================
-- ArtFolio — Schéma des tables pour le système de commandes
-- À exécuter après le schéma principal
-- ============================================================

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'payment_failed', 'refunded')),
  total REAL NOT NULL,
  shipping_cost REAL NOT NULL DEFAULT 15,
  commission REAL NOT NULL,
  shipping_address TEXT, -- JSON: { fullName, addressLine1, addressLine2, city, postalCode, country, phone }
  tracking_number TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT,
  shipped_at TEXT,
  delivered_at TEXT
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Table des items de commande
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price REAL NOT NULL, -- Prix au moment de la commande
  commission REAL NOT NULL, -- Commission calculée sur ce prix
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_artwork ON order_items(artwork_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'succeeded', 'failed', 'refunded')),
  failure_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT,
  refunded_at TEXT
);

-- Index
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Table des remboursements (optionnel, pour traçabilité)
CREATE TABLE IF NOT EXISTS refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  stripe_refund_id TEXT UNIQUE,
  amount REAL NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'succeeded', 'failed')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- Vues utiles pour le dashboard
-- ============================================================

-- Vue des ventes par artiste
CREATE VIEW IF NOT EXISTS artist_sales AS
SELECT 
  u.id as artist_id,
  u.name as artist_name,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(oi.id) as total_artworks_sold,
  SUM(oi.price) as total_revenue,
  SUM(oi.commission) as total_commissions,
  SUM(oi.price - oi.commission) as net_revenue
FROM users u
LEFT JOIN order_items oi ON oi.seller_id = u.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'paid'
WHERE u.role = 'artist'
GROUP BY u.id, u.name;

-- Vue des commandes avec détails
CREATE VIEW IF NOT EXISTS order_details AS
SELECT 
  o.id,
  o.user_id,
  u.name as buyer_name,
  o.status,
  o.total,
  o.shipping_cost,
  o.commission,
  o.created_at,
  o.paid_at,
  COUNT(oi.id) as item_count,
  GROUP_CONCAT(a.title, ' | ') as artwork_titles
FROM orders o
JOIN users u ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN artworks a ON a.id = oi.artwork_id
GROUP BY o.id
ORDER BY o.created_at DESC;
