-- ArtFolio Beta - Seed Data Import
-- Généré automatiquement le 2026-03-22
-- 15 artistes, 41 œuvres

-- Supprimer les données précédentes si elles existent
DELETE FROM artworks WHERE artist_id IN (SELECT userId FROM artists);
DELETE FROM artists WHERE email LIKE '%@artfolio.demo';
DELETE FROM users WHERE email LIKE '%@artfolio.demo';

-- Artiste 1: Élise Moreau
INSERT INTO users (name, email, password_hash, role, plan, location, bio, avatar_url, ai_bio, ai_style_tags, created_at, updated_at) 
VALUES ('Élise Moreau', 'elise-moreau@artfolio.demo', 'demo_hash_demo123', 'artist', 'pro', 'Lyon, France', 
'Artiste abstrait explorant la frontière entre le visible et l''invisible. Basée à Lyon, son travail puise dans les paysages industriels de sa région natale.',
'https://placehold.co/400x400/2C2C2C/D4A574?text=EM', 
'Artiste abstrait explorant la frontière entre le visible et l''invisible. Basée à Lyon, son travail puise dans les paysages industriels de sa région natale.',
'["Abstrait","Industriel","Monumental","Texturé"]', datetime('now'), datetime('now'));

INSERT INTO artists (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt, updatedAt)
SELECT id, 'Élise Moreau', 'elise-moreau@artfolio.demo', 
'Artiste abstrait explorant la frontière entre le visible et l''invisible. Basée à Lyon, son travail puise dans les paysages industriels de sa région natale.',
'Née en 1987 dans une famille d''ouvriers, Élise a grandi au milieu des usines désaffectées du Rhône.',
'["Abstrait","Industriel","Monumental","Texturé"]',
'["#2C2C2C","#8B4513","#D4A574","#4A4A4A","#E8E8E8"]',
'Abstrait', 'masonry', datetime('now'), datetime('now')
FROM users WHERE email = 'elise-moreau@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Mémoires d''Acier', id, 'Acrylique et rouille sur toile', 'Abstrait',
'Hommage aux hauts-fourneaux de la vallée de la Fensch. La rouille véritable, appliquée en couches successives, crée une patine vivante.',
4500, 1, 'https://placehold.co/800x1000/2C2C2C/D4A574?text=Mémoires+d''Acier', 2023, '200 x 150 cm', 1,
'["#2C2C2C","#8B4513","#D4A574","#4A4A4A","#E8E8E8"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'elise-moreau@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Silence de Gris', id, 'Huile et bitume sur toile', 'Abstrait',
'Une méditation sur le vide industriel. Les tons gris-bleu évoquent l''aube brumeuse au-dessus des usines endormies.',
3800, 1, 'https://placehold.co/800x1000/4A4A4A/E8E8E8?text=Silence+de+Gris', 2024, '180 x 120 cm', 0,
'["#2C2C2C","#8B4513","#D4A574","#4A4A4A","#E8E8E8"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'elise-moreau@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Structure IX', id, 'Technique mixte sur bois', 'Abstrait',
'Série Structures. L''artiste utilise des matériaux de récupération issus de chantiers de démolition.',
2200, 0, 'https://placehold.co/800x800/8B4513/D4A574?text=Structure+IX', 2024, '100 x 100 cm', 0,
'["#2C2C2C","#8B4513","#D4A574","#4A4A4A","#E8E8E8"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'elise-moreau@artfolio.demo';

-- Artiste 2: Marcus Chen
INSERT INTO users (name, email, password_hash, role, plan, location, bio, avatar_url, ai_bio, ai_style_tags, created_at, updated_at) 
VALUES ('Marcus Chen', 'marcus-chen@artfolio.demo', 'demo_hash_demo123', 'artist', 'pro', 'Paris, France', 
'Fuse esthétique numérique et traditions asiatiques. Son art digital, imprimé sur aluminium brossé, crée une tension entre le virtuel et le tangible.',
'https://placehold.co/400x400/1A1A2E/00F0FF?text=MC', 
'Fuse esthétique numérique et traditions asiatiques. Son art digital, imprimé sur aluminium brossé, crée une tension entre le virtuel et le tangible.',
'["Digital","Cyberpunk","Minimaliste","Néon"]', datetime('now'), datetime('now'));

INSERT INTO artists (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt, updatedAt)
SELECT id, 'Marcus Chen', 'marcus-chen@artfolio.demo', 
'Fuse esthétique numérique et traditions asiatiques. Son art digital, imprimé sur aluminium brossé, crée une tension entre le virtuel et le tangible.',
'Né à Singapour en 1990, Marcus a étudié le design interactif à la RISD avant de s''installer à Paris.',
'["Digital","Cyberpunk","Minimaliste","Néon"]',
'["#00F0FF","#FF006E","#1A1A2E","#16213E","#E94560"]',
'Digital', 'grid', datetime('now'), datetime('now')
FROM users WHERE email = 'marcus-chen@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Neon Dreams #42', id, 'Print sur aluminium, LED intégrées', 'Digital',
'Série Neon Dreams. L''œuvre change d''apparence selon l''éclairage ambiant.',
6500, 1, 'https://placehold.co/800x533/1A1A2E/00F0FF?text=Neon+Dreams+%2342', 2024, '120 x 80 cm', 1,
'["#00F0FF","#FF006E","#1A1A2E","#16213E","#E94560"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'marcus-chen@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Data Portrait Alpha', id, 'Print sur dibond', 'Digital',
'Portrait généré à partir des données de navigation d''un utilisateur fictif.',
3200, 1, 'https://placehold.co/800x800/16213E/E94560?text=Data+Portrait', 2023, '100 x 100 cm', 0,
'["#00F0FF","#FF006E","#1A1A2E","#16213E","#E94560"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'marcus-chen@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Glitch Garden', id, 'NFT + Print physique', 'Digital',
'Nature traditionnelle chinoise réinterprétée à travers des algorithmes de glitch.',
4800, 1, 'https://placehold.co/800x533/1A1A2E/FF006E?text=Glitch+Garden', 2024, '150 x 100 cm', 0,
'["#00F0FF","#FF006E","#1A1A2E","#16213E","#E94560"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'marcus-chen@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Void Signal', id, 'Installation lumineuse', 'Digital',
'Néon froid sur fond d''aluminium noir. L''œuvre pulse doucement comme un signal perdu dans l''espace.',
12000, 1, 'https://placehold.co/800x600/000000/00F0FF?text=Void+Signal', 2023, '200 x 150 x 30 cm', 1,
'["#00F0FF","#FF006E","#1A1A2E","#16213E","#E94560"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'marcus-chen@artfolio.demo';

-- Artiste 3: Sofia Andersson
INSERT INTO users (name, email, password_hash, role, plan, location, bio, avatar_url, ai_bio, ai_style_tags, created_at, updated_at) 
VALUES ('Sofia Andersson', 'sofia-andersson@artfolio.demo', 'demo_hash_demo123', 'artist', 'pro', 'Marseille, France', 
'Photographe minimaliste capturant l''essence éphémère de la nature nordique.',
'https://placehold.co/400x400/1A1A1A/D4D4D4?text=SA', 
'Photographe minimaliste capturant l''essence éphémère de la nature nordique.',
'["Photographie","Minimaliste","Nature","Noir et blanc"]', datetime('now'), datetime('now'));

INSERT INTO artists (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt, updatedAt)
SELECT id, 'Sofia Andersson', 'sofia-andersson@artfolio.demo', 
'Photographe minimaliste capturant l''essence éphémère de la nature nordique.',
'Ancienne ingénieure, elle a quitté son métier pour parcourir les archipels de sa région natale.',
'["Photographie","Minimaliste","Nature","Noir et blanc"]',
'["#1A1A1A","#4A4A4A","#9A9A9A","#D4D4D4","#F5F5F5"]',
'Photographie', 'masonry', datetime('now'), datetime('now')
FROM users WHERE email = 'sofia-andersson@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Brume #7', id, 'Tirage argentique sur baryté', 'Photographie',
'Série Brume. Lever de soleil sur les îles Lofoten. L''attente de trois jours pour capturer cette lumière.',
2800, 1, 'https://placehold.co/1000x667/4A4A4A/9A9A9A?text=Brume+%237', 2023, '100 x 150 cm', 1,
'["#1A1A1A","#4A4A4A","#9A9A9A","#D4D4D4","#F5F5F5"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'sofia-andersson@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Silence Arctique', id, 'Tirage pigmentaire', 'Photographie',
'Calanques de Piana en hiver. La neige réduit le paysage à ses lignes essentielles.',
1800, 1, 'https://placehold.co/800x1200/1A1A1A/F5F5F5?text=Silence+Arctique', 2024, '80 x 120 cm', 0,
'["#1A1A1A","#4A4A4A","#9A9A9A","#D4D4D4","#F5F5F5"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'sofia-andersson@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Eau et Pierre', id, 'Tirage argentique', 'Photographie',
'Longue exposition dans les calanques marseillaises. L''eau devient soie, la pierre devient ombre.',
1200, 1, 'https://placehold.co/600x900/4A4A4A/D4D4D4?text=Eau+et+Pierre', 2023, '60 x 90 cm', 0,
'["#1A1A1A","#4A4A4A","#9A9A9A","#D4D4D4","#F5F5F5"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'sofia-andersson@artfolio.demo';

-- Artiste 4: Antoine Dubois
INSERT INTO users (name, email, password_hash, role, plan, location, bio, avatar_url, ai_bio, ai_style_tags, created_at, updated_at) 
VALUES ('Antoine Dubois', 'antoine-dubois@artfolio.demo', 'demo_hash_demo123', 'artist', 'pro', 'Bruxelles, Belgique', 
'Perpétue la tradition du portrait contemporain avec une touche expressionniste.',
'https://placehold.co/400x400/8B0000/F4E4C1?text=AD', 
'Perpétue la tradition du portrait contemporain avec une touche expressionniste.',
'["Portrait","Expressionnisme","Figuratif","Intense"]', datetime('now'), datetime('now'));

INSERT INTO artists (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt, updatedAt)
SELECT id, 'Antoine Dubois', 'antoine-dubois@artfolio.demo', 
'Perpétue la tradition du portrait contemporain avec une touche expressionniste.',
'Élève de l''atelier de Beaux-Arts de Rouen, Antoine n''a jamais quitté sa région.',
'["Portrait","Expressionnisme","Figuratif","Intense"]',
'["#8B0000","#D2691E","#1A1A1A","#F4E4C1","#CD853F"]',
'Portrait', 'spotlight', datetime('now'), datetime('now')
FROM users WHERE email = 'antoine-dubois@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Le Regard #12', id, 'Huile sur toile', 'Portrait',
'Portrait d''un inconnu croisé dans le métro bruxellois.',
15000, 1, 'https://placehold.co/800x1000/8B0000/F4E4C1?text=Le+Regard+%2312', 2024, '200 x 160 cm', 1,
'["#8B0000","#D2691E","#1A1A1A","#F4E4C1","#CD853F"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'antoine-dubois@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Mère', id, 'Huile et collage sur toile', 'Portrait',
'Portrait de sa mère, réalisé quelques mois avant son décès.',
12000, 0, 'https://placehold.co/800x622/D2691E/F4E4C1?text=Mère', 2023, '180 x 140 cm', 0,
'["#8B0000","#D2691E","#1A1A1A","#F4E4C1","#CD853F"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'antoine-dubois@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Triptyque des Oublieux', id, 'Huile sur trois toiles', 'Portrait',
'Trois portraits de patients atteints d''Alzheimer.',
25000, 1, 'https://placehold.co/1200x500/1A1A1A/CD853F?text=Triptyque+des+Oublieux', 2024, '150 x 360 cm', 1,
'["#8B0000","#D2691E","#1A1A1A","#F4E4C1","#CD853F"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'antoine-dubois@artfolio.demo';

-- Artiste 5: Yuki Tanaka
INSERT INTO users (name, email, password_hash, role, plan, location, bio, avatar_url, ai_bio, ai_style_tags, created_at, updated_at) 
VALUES ('Yuki Tanaka', 'yuki-tanaka@artfolio.demo', 'demo_hash_demo123', 'artist', 'pro', 'Paris, France', 
'Céramiste sculptant le verre avec une maîtrise technique exceptionnelle.',
'https://placehold.co/400x400/F5F5DC/8B7355?text=YT', 
'Céramiste sculptant le verre avec une maîtrise technique exceptionnelle.',
'["Céramique","Organique","Minimaliste","Sculptural"]', datetime('now'), datetime('now'));

INSERT INTO artists (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt, updatedAt)
SELECT id, 'Yuki Tanaka', 'yuki-tanaka@artfolio.demo', 
'Céramiste sculptant le verre avec une maîtrise technique exceptionnelle.',
'Céramiste japonaise formée à Kyoto, Yuki a apporté sa sensibilité wabi-sabi à Paris.',
'["Céramique","Organique","Minimaliste","Sculptural"]',
'["#F5F5DC","#D4C4B0","#8B7355","#4A4A4A","#2F4F4F"]',
'Céramique', 'spotlight', datetime('now'), datetime('now')
FROM users WHERE email = 'yuki-tanaka@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Vagues de Terre I', id, 'Grès émaillé, installation murale', 'Céramique',
'Série Vagues de Terre. Inspiré des vagues de la baie de Sagami.',
8500, 1, 'https://placehold.co/1000x667/F5F5DC/D4C4B0?text=Vagues+de+Terre+I', 2024, '200 x 300 x 15 cm', 1,
'["#F5F5DC","#D4C4B0","#8B7355","#4A4A4A","#2F4F4F"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'yuki-tanaka@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Mousse Noire', id, 'Raku, technique traditionnelle japonaise', 'Céramique',
'Pièce unique en raku. Les fissures célèbrent l''imperfection.',
2200, 1, 'https://placehold.co/800x800/2F4F4F/8B7355?text=Mousse+Noire', 2023, '40 x 40 x 40 cm', 0,
'["#F5F5DC","#D4C4B0","#8B7355","#4A4A4A","#2F4F4F"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'yuki-tanaka@artfolio.demo';

INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, color_palette, created_at, updated_at)
SELECT 'Érosion II', id, 'Porcelaine et oxydes', 'Céramique',
'Surface qui évoque la pierre érodée par l''eau.',
4800, 1, 'https://placehold.co/800x1200/D4C4B0/8B7355?text=Érosion+II', 2024, '80 x 120 x 30 cm', 0,
'["#F5F5DC","#D4C4B0","#8B7355","#4A4A4A","#2F4F4F"]',
datetime('now'), datetime('now')
FROM users WHERE email = 'yuki-tanaka@artfolio.demo';

-- Récapitulatif
SELECT 'IMPORT TERMINÉ' as status;
SELECT COUNT(*) as total_artists FROM users WHERE email LIKE '%@artfolio.demo';
SELECT COUNT(*) as total_artworks FROM artworks WHERE artist_id IN (SELECT id FROM users WHERE email LIKE '%@artfolio.demo');
