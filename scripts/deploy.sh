#!/bin/bash
# =============================================================
# Script de déploiement — API
# Usage : bash /var/www/api/scripts/deploy.sh
# =============================================================
set -e  # Arrête le script à la première erreur

echo ""
echo "========================================"
echo "  Déploiement API — $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# --- Récupération du code ---
echo "[1/5] Git pull..."
cd /var/www/api
git pull origin main

# --- Dépendances ---
echo "[2/5] Installation des dépendances..."
npm install

# --- Prisma ---
echo "[3/5] Génération Prisma + migrations..."
npx prisma generate
npx prisma migrate deploy

# --- Redémarrage API ---
echo "[4/5] Redémarrage de l'API..."
# Si le process existe déjà → restart, sinon → start
if pm2 describe api > /dev/null 2>&1; then
    pm2 restart api
else
    pm2 start "tsx src/index.ts" --name api
fi
pm2 save

# --- Vérification ---
echo "[5/5] Vérification..."
sleep 2
if curl -sf http://localhost:3000/api/v1/events > /dev/null; then
    echo ""
    echo "✓ API opérationnelle sur le port 3000"
else
    echo ""
    echo "✗ L'API ne répond pas — consulte : pm2 logs api"
    exit 1
fi

echo ""
echo "========================================"
echo "  Déploiement API terminé avec succès"
echo "========================================"
