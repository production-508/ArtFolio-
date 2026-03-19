# 🚀 Déploiement ArtFolio — Guide Complet

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   Frontend      │────▶│     Backend      │
│  (Netlify)      │     │    (Railway)     │
│  React + Vite   │     │ Node + Express   │
└─────────────────┘     │   + SQLite       │
                        └──────────────────┘
```

---

## 1. Backend — Railway

### Prérequis
- Compte Railway : https://railway.app
- GitHub avec le repo ArtFolio

### Étapes

1. **Créer un projet Railway**
   ```bash
   # Via CLI (optionnel)
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Deploy depuis GitHub**
   - Dashboard Railway → "New Project" → "Deploy from GitHub repo"
   - Sélectionner `Paz5008/ArtFolio`
   - Railway détecte automatiquement `railway.json`

3. **Variables d'environnement**
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=votre-super-secret-min-32-caracteres
   OPENAI_API_KEY=sk-votre-cle-openai
   CORS_ORIGIN=https://votre-frontend.netlify.app
   ```

4. **Volume persistant (SQLite)**
   - Railway Dashboard → Service → "Volumes"
   - Ajouter un volume : `/app/data`
   - Modifier `DATABASE_PATH=./data/artfolio.db`

5. **Vérifier le déploiement**
   ```bash
   curl https://votre-app.railway.app/api/health
   # Doit retourner : {"status":"ok"}
   ```

---

## 2. Frontend — Netlify

### Étapes

1. **Connecter le repo**
   - Netlify Dashboard → "Add new site" → "Import from Git"
   - Sélectionner `Paz5008/ArtFolio`

2. **Configuration build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Variables d'environnement**
   ```
   VITE_API_URL=https://votre-app.railway.app
   ```

4. **Deploy**
   - Push sur `main` → déploiement auto
   - Ou déploiement manuel : `netlify deploy --prod`

---

## 3. Configuration post-déploiement

### Mettre à jour les URLs

1. **Frontend env** (Netlify)
   ```
   VITE_API_URL=https://artfolio-api.up.railway.app
   ```

2. **Backend env** (Railway)
   ```
   CORS_ORIGIN=https://artfolio-gallery.netlify.app
   ```

3. **Redeploy** les deux services

---

## 4. Vérification finale

| Check | Commande/URL |
|-------|--------------|
| Backend health | `GET /api/health` |
| Liste œuvres | `GET /api/artworks` |
| Chatbot | `POST /api/chat/art-advisor` |
| Frontend | Charger la page d'accueil |
| Upload image | Tester upload œuvre |

---

## 5. Coûts estimés

| Service | Niveau gratuit | Coût mensuel |
|---------|----------------|--------------|
| Railway | 500h/mois, 1GB RAM | $5+ si dépassement |
| Netlify | 100GB bandwidth | Gratuit pour usage normal |
| OpenAI API | ~$0.005/appel | Variable selon usage |

---

## Troubleshooting

### CORS errors
- Vérifier `CORS_ORIGIN` correspond bien à l'URL Netlify
- Redeploy backend après modif

### Database locked (SQLite)
- Vérifier que le volume Railway est bien monté
- Vérifier `DATABASE_PATH` pointe vers `/app/data/`

### Images non affichées
- Vérifier que `public/images` existe sur Railway
- Les images uploadées sont dans le volume persistant

---

## URLs de production (à remplir après déploiement)

```
Frontend: https://______________.netlify.app
Backend:  https://______________.railway.app
```
