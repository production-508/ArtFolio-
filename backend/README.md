# ArtFolio — Backend API

Serveur Express + SQLite pour la plateforme ArtFolio.

## Démarrage

```bash
cd backend/
npm install
npm start     # Lance sur http://localhost:3001
```

> Optionnel : ajouter votre clé OpenAI dans `.env` pour activer la génération de profil IA réelle.

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Santé du serveur |
| GET | `/api/stats` | Chiffres clés (artistes, œuvres, collectionneurs) |
| POST | `/api/auth/login` | Connexion → JWT |
| GET | `/api/auth/me` | Profil utilisateur connecté |
| GET | `/api/artworks` | Liste des œuvres (filtres : medium, style, available, maxPrice, search) |
| GET | `/api/artworks/featured` | 6 œuvres à la une |
| GET | `/api/artworks/:id` | Détail d'une œuvre |
| GET | `/api/artists` | Liste des artistes |
| GET | `/api/artists/featured` | Artistes en vedette |
| GET | `/api/artists/:id` | Profil artiste + œuvres |
| POST | `/api/ai/generate-profile` | 🤖 Génère bio/statement/tags IA (auth requise) |
| GET | `/api/ai/tokens` | Solde tokens IA (auth requise) |

## Comptes de démo

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| marie@artfolio.art | demo1234 | Artiste (Pro) |
| thomas@artfolio.art | demo1234 | Artiste (Pro) |
| admin@artfolio.art | demo1234 | Admin (Galerie) |

## Configuration `.env`

```
OPENAI_API_KEY=sk-...    # Pour la génération IA réelle
JWT_SECRET=...           # Clé secrète JWT
PORT=3001
```

## Limites tokens IA par plan

| Plan | Tokens |
|------|--------|
| Starter | 500 |
| Pro | 5 000 |
| Galerie | 20 000 |
