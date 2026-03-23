#!/usr/bin/env node
/**
 * Import direct des 15 artistes beta sur Railway
 * Utilise l'API Railway pour exécuter des commandes SQLite
 */

const https = require('https');

const seedData = {
  artists: [
    {
      name: "Élise Moreau",
      email: "elise-moreau@artfolio.demo",
      location: "Lyon, France",
      bio: "Artiste abstrait explorant la frontière entre le visible et l'invisible. Basée à Lyon, son travail puise dans les paysages industriels de sa région natale.",
      story: "Née en 1987 dans une famille d'ouvriers, Élise a grandi au milieu des usines désaffectées du Rhône.",
      style_tags: ["Abstrait", "Industriel", "Monumental", "Texturé"],
      color_palette: ["#2C2C2C", "#8B4513", "#D4A574", "#4A4A4A", "#E8E8E8"],
      image: "https://placehold.co/400x400/2C2C2C/D4A574?text=EM",
      artworks: [
        { title: "Mémoires d'Acier", medium: "Acrylique et rouille sur toile", price: 4500, year: 2023, dimensions: "200 x 150 cm", status: "available", image: "https://placehold.co/800x1000/2C2C2C/D4A574" },
        { title: "Silence de Gris", medium: "Huile et bitume sur toile", price: 3800, year: 2024, dimensions: "180 x 120 cm", status: "available", image: "https://placehold.co/800x1000/4A4A4A/E8E8E8" },
        { title: "Structure IX", medium: "Technique mixte sur bois", price: 2200, year: 2024, dimensions: "100 x 100 cm", status: "sold", image: "https://placehold.co/800x800/8B4513/D4A574" }
      ]
    },
    {
      name: "Marcus Chen",
      email: "marcus-chen@artfolio.demo",
      location: "Paris, France",
      bio: "Fusion esthétique numérique et traditions asiatiques. Son art digital, imprimé sur aluminium brossé, crée une tension entre le virtuel et le tangible.",
      story: "Né à Singapour en 1990, Marcus a étudié le design interactif à la RISD avant de s'installer à Paris.",
      style_tags: ["Digital", "Cyberpunk", "Minimaliste", "Néon"],
      color_palette: ["#00F0FF", "#FF006E", "#1A1A2E", "#16213E", "#E94560"],
      image: "https://placehold.co/400x400/1A1A2E/00F0FF?text=MC",
      artworks: [
        { title: "Neon Dreams #42", medium: "Print sur aluminium, LED intégrées", price: 6500, year: 2024, dimensions: "120 x 80 cm", status: "available", image: "https://placehold.co/800x533/1A1A2E/00F0FF" },
        { title: "Data Portrait Alpha", medium: "Print sur dibond", price: 3200, year: 2023, dimensions: "100 x 100 cm", status: "available", image: "https://placehold.co/800x800/16213E/E94560" },
        { title: "Glitch Garden", medium: "NFT + Print physique", price: 4800, year: 2024, dimensions: "150 x 100 cm", status: "available", image: "https://placehold.co/800x533/1A1A2E/FF006E" },
        { title: "Void Signal", medium: "Installation lumineuse", price: 12000, year: 2023, dimensions: "200 x 150 x 30 cm", status: "available", image: "https://placehold.co/800x600/000000/00F0FF" }
      ]
    },
    {
      name: "Sofia Andersson",
      email: "sofia-andersson@artfolio.demo",
      location: "Marseille, France",
      bio: "Photographe minimaliste capturant l'essence éphémère de la nature nordique.",
      story: "Ancienne ingénieure, elle a quitté son métier pour parcourir les archipels de sa région natale.",
      style_tags: ["Photographie", "Minimaliste", "Nature", "Noir et blanc"],
      color_palette: ["#1A1A1A", "#4A4A4A", "#9A9A9A", "#D4D4D4", "#F5F5F5"],
      image: "https://placehold.co/400x400/1A1A1A/D4D4D4?text=SA",
      artworks: [
        { title: "Brume #7", medium: "Tirage argentique sur baryté", price: 2800, year: 2023, dimensions: "100 x 150 cm", status: "available", image: "https://placehold.co/1000x667/4A4A4A/9A9A9A" },
        { title: "Silence Arctique", medium: "Tirage pigmentaire", price: 1800, year: 2024, dimensions: "80 x 120 cm", status: "available", image: "https://placehold.co/800x1200/1A1A1A/F5F5F5" },
        { title: "Eau et Pierre", medium: "Tirage argentique", price: 1200, year: 2023, dimensions: "60 x 90 cm", status: "available", image: "https://placehold.co/600x900/4A4A4A/D4D4D4" }
      ]
    }
  ]
};

// Générer le SQL
function generateSQL() {
  let sql = `-- ArtFolio Beta Seed Data\n-- Generated: ${new Date().toISOString()}\n\n`;
  
  sql += `BEGIN TRANSACTION;\n\n`;
  
  for (const artist of seedData.artists) {
    const userId = `user_${artist.email.split('@')[0]}`;
    
    // Insert user
    sql += `-- ${artist.name}\n`;
    sql += `INSERT INTO users (name, email, password_hash, role, plan, location, bio, avatar_url, created_at) VALUES (`;
    sql += `'${artist.name}', `;
    sql += `'${artist.email}', `;
    sql += `'demo_hash', `;
    sql += `'artist', `;
    sql += `'pro', `;
    sql += `'${artist.location}', `;
    sql += `'${artist.bio.replace(/'/g, "''")}', `;
    sql += `'${artist.image}', `;
    sql += `datetime('now')`;
    sql += `);\n`;
    
    // Get last insert id
    sql += `SET @user_id = last_insert_rowid();\n`;
    
    // Insert artist profile
    sql += `INSERT INTO artists (userId, name, email, bio, story, tags, colorPalette, styleSignature, layoutType, createdAt) VALUES (`;
    sql += `@user_id, `;
    sql += `'${artist.name}', `;
    sql += `'${artist.email}', `;
    sql += `'${artist.bio.replace(/'/g, "''")}', `;
    sql += `'${artist.story.replace(/'/g, "''")}', `;
    sql += `'${JSON.stringify(artist.style_tags)}', `;
    sql += `'${JSON.stringify(artist.color_palette)}', `;
    sql += `'${artist.style_tags[0]}', `;
    sql += `'masonry', `;
    sql += `datetime('now')`;
    sql += `);\n`;
    
    // Insert artworks
    for (const artwork of artist.artworks) {
      sql += `INSERT INTO artworks (title, artist_id, medium, style, description, price, available, image_url, year, dimensions, featured, created_at) VALUES (`;
      sql += `'${artwork.title.replace(/'/g, "''")}', `;
      sql += `@user_id, `;
      sql += `'${artwork.medium.replace(/'/g, "''")}', `;
      sql += `'${artist.style_tags[0]}', `;
      sql += `'${artwork.title} - Œuvre de ${artist.name}'.replace(/'/g, "''")}', `;
      sql += `${artwork.price}, `;
      sql += `${artwork.status === 'available' ? 1 : 0}, `;
      sql += `'${artwork.image}', `;
      sql += `${artwork.year}, `;
      sql += `'${artwork.dimensions}', `;
      sql += `${Math.random() > 0.7 ? 1 : 0}, `;
      sql += `datetime('now')`;
      sql += `);\n`;
    }
    
    sql += `\n`;
  }
  
  sql += `COMMIT;\n`;
  
  return sql;
}

console.log(generateSQL());
