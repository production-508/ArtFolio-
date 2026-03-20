# 🚀 Déploiement Render (alternative à Railway)

## Configuration

1. Va sur [render.com](https://render.com)
2. New → Web Service
3. Connecte ton repo GitHub `ArtFolio-`
4. Configuration :

```yaml
Name: artfolio
Environment: Node
Build Command: npm install && npm run build && cd backend && npm install
Start Command: cd backend && npm start
Plan: Free
```

5. Ajoute les variables d'environnement :

```bash
NODE_ENV=production
PORT=10000  # Render attribue automatiquement
DATABASE_URL=sqlite:./artfolio.db
JWT_SECRET=votre_secret_jwt
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
OPENAI_API_KEY=sk-...
```

6. Deploy 🚀

## Avantages Render vs Railway

| Feature | Railway | Render |
|---------|---------|--------|
| SQLite | ❌ Problèmes de compilation | ✅ Natif |
| Healthcheck | Strict (120s timeout) | Flexible |
| Logs | Dashboard uniquement | CLI + Dashboard |
| Prix gratuit | Limité | Généreux |

## Si tu veux rester sur Railway

Le problème vient probablement de sqlite3 qui ne compile pas sur leur infra. Solutions :

1. **Utiliser PostgreSQL** à la place de SQLite
2. **Utiliser better-sqlite3** (plus stable)
3. **Augmenter le timeout** dans `railway.toml` :

```toml
[deploy]
healthcheckTimeout = 300  # 5 minutes
```

4. **Vérifier les logs** :
```bash
railway logs
```

## Migration Railway → Render

Le code est prêt — tu peux déployer sur Render sans modification. Juste changer les env vars.
