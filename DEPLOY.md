# 🚀 Déploiement Railway

## Méthode 1 : Déploiement automatique (GitHub Actions)

1. Va sur Railway Dashboard → Settings → Tokens
2. Crée un token et copie-le
3. Sur GitHub → Settings → Secrets → Actions
4. Ajoute `RAILWAY_TOKEN` avec la valeur du token
5. Le déploiement se fera automatiquement à chaque push sur main

## Méthode 2 : Déploiement manuel via CLI

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Lier le projet
railway link

# Déployer
railway deploy
```

## Configuration requise

Variables d'environnement à configurer sur Railway :

```bash
# Base de données
DATABASE_URL=sqlite:./artfolio.db

# JWT
JWT_SECRET=votre_secret_jwt_ici

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (pour l'analyse d'œuvres)
OPENAI_API_KEY=sk-...

# CORS (domaine frontend)
CORS_ORIGIN=https://votre-domaine.railway.app
```

## Healthcheck

Le serveur expose `/api/health` pour vérifier qu'il fonctionne :
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-03-21T..."
}
```

## Troubleshooting

Si le healthcheck échoue :
1. Vérifier les logs Railway : `railway logs`
2. S'assurer que toutes les env vars sont configurées
3. Vérifier que le backend a bien démarré sur le port `$PORT`
