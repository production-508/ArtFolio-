#!/bin/bash
# Deploy ArtFolio Backend to Railway
# Usage: ./deploy-railway.sh

set -e

echo "🚀 Déploiement ArtFolio sur Railway"
echo "===================================="

# Vérifier les variables d'environnement
if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ Erreur: RAILWAY_TOKEN non défini"
  echo "Obtenez votre token sur https://railway.app/account/tokens"
  exit 1
fi

# Installer Railway CLI si nécessaire
if ! command -v railway &> /dev/null; then
  echo "📦 Installation Railway CLI..."
  npm install -g @railway/cli
fi

# Login
railway login --token "$RAILWAY_TOKEN"

# Link project (créer si n'existe pas)
echo "🔗 Configuration du projet..."
railway link || railway init

# Set environment variables
echo "⚙️ Configuration des variables..."
railway variables set PORT=3001
railway variables set NODE_ENV=production

if [ -f .env ]; then
  echo "Chargement des variables depuis .env..."
  export $(grep -v '^#' .env | xargs)
  railway variables set JWT_SECRET="$JWT_SECRET"
  railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
fi

# Deploy
echo "🚀 Déploiement..."
railway up

# Get URL
URL=$(railway domain)
echo ""
echo "✅ Déploiement terminé!"
echo "URL: https://$URL"
echo ""
echo "Testez: curl https://$URL/api/health"
