-- Migration: Profils utilisateurs personnalisables
-- Crée une table pour stocker les préférences de personnalisation des artistes

CREATE TABLE IF NOT EXISTS user_profile_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  
  -- Thème et apparence
  theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('dark', 'light', 'auto')),
  primary_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#D4AF37',
  font_heading TEXT DEFAULT 'Cormorant Garamond',
  font_body TEXT DEFAULT 'Inter',
  
  -- Layout de la page
  layout_type TEXT DEFAULT 'grid' CHECK (layout_type IN ('grid', 'masonry', 'spotlight', 'minimal', 'timeline')),
  hero_style TEXT DEFAULT 'carousel' CHECK (hero_style IN ('carousel', 'static', 'video', 'none')),
  
  -- Sections affichables
  show_bio BOOLEAN DEFAULT 1,
  show_story BOOLEAN DEFAULT 1,
  show_stats BOOLEAN DEFAULT 1,
  show_social_links BOOLEAN DEFAULT 1,
  show_contact_form BOOLEAN DEFAULT 1,
  show_cv BOOLEAN DEFAULT 0,
  show_exhibitions BOOLEAN DEFAULT 1,
  show_press BOOLEAN DEFAULT 0,
  
  -- Bannière et médias
  banner_image_url TEXT,
  banner_overlay_opacity REAL DEFAULT 0.4 CHECK (banner_overlay_opacity BETWEEN 0 AND 1),
  profile_image_shape TEXT DEFAULT 'circle' CHECK (profile_image_shape IN ('circle', 'square', 'rounded')),
  
  -- Contenu dynamique
  custom_slug TEXT UNIQUE,
  page_title TEXT,
  meta_description TEXT,
  custom_css TEXT,
  custom_js TEXT,
  
  -- Widgets et modules
  featured_artwork_id INTEGER,
  widget_order TEXT DEFAULT 'bio,works,exhibitions,contact', -- JSON array as string
  
  -- SEO et partage
  og_image_url TEXT,
  twitter_handle TEXT,
  
  -- Préférences de contact
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  
  -- Statistiques et analytics
  profile_views INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Sécurité
  is_public BOOLEAN DEFAULT 1,
  allow_messages BOOLEAN DEFAULT 1,
  require_approval_for_comments BOOLEAN DEFAULT 1,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (featured_artwork_id) REFERENCES artworks(id) ON DELETE SET NULL
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_profile_settings_user_id ON user_profile_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_settings_custom_slug ON user_profile_settings(custom_slug);
CREATE INDEX IF NOT EXISTS idx_user_profile_settings_public ON user_profile_settings(is_public) WHERE is_public = 1;

-- Table pour les liens sociaux dynamiques
CREATE TABLE IF NOT EXISTS user_social_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  platform TEXT NOT NULL, -- instagram, twitter, facebook, linkedin, behance, dribbble, youtube, tiktok, website, etc.
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT 1,
  custom_icon TEXT, -- URL ou nom d'icône custom
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_social_links_user_id ON user_social_links(user_id);

-- Table pour les sections custom additionnelles
CREATE TABLE IF NOT EXISTS user_custom_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('text', 'gallery', 'video', 'embed', 'quote', 'cv_entry', 'exhibition')),
  title TEXT NOT NULL,
  content TEXT, -- HTML ou texte selon le type
  metadata TEXT, -- JSON avec config additionnelle
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_custom_sections_user_id ON user_custom_sections(user_id);

-- Table pour les widgets du dashboard artiste
CREATE TABLE IF NOT EXISTS user_dashboard_widgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  widget_type TEXT NOT NULL, -- 'stats', 'recent_views', 'sales', 'messages', 'quick_upload', 'analytics'
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1, -- en colonnes (grid de 12)
  height INTEGER DEFAULT 1,
  config TEXT, -- JSON avec config spécifique au widget
  is_visible BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_dashboard_widgets_user_id ON user_dashboard_widgets(user_id);

-- Trigger pour mettre à jour last_updated automatiquement
CREATE TRIGGER IF NOT EXISTS update_profile_settings_timestamp 
AFTER UPDATE ON user_profile_settings
BEGIN
  UPDATE user_profile_settings SET last_updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Vue combinée pour récupérer le profil complet facilement
CREATE VIEW IF NOT EXISTS v_user_complete_profiles AS
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  u.plan,
  u.avatar_url,
  u.location,
  u.bio,
  u.website,
  u.instagram,
  ups.*,
  (SELECT COUNT(*) FROM artworks WHERE artist_id = u.id AND status = 'available') as artwork_count,
  (SELECT COUNT(*) FROM artworks WHERE artist_id = u.id AND status = 'sold') as sold_count
FROM users u
LEFT JOIN user_profile_settings ups ON u.id = ups.user_id;
