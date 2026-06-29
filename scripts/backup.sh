#!/bin/bash
# =============================================================
# Script de sauvegarde — Base de données SQLite
# Usage  : bash /var/www/api/scripts/backup.sh
# Cron   : 0 2 * * * bash /var/www/api/scripts/backup.sh >> /var/log/backup.log 2>&1
# =============================================================
set -e

BACKUP_DIR="/var/backups/app"
DB_PATH="/var/www/api/prod.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/prod_$DATE.db"
RETENTION_DAYS=7

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Démarrage de la sauvegarde..."

# --- Vérifications préalables ---
if [ ! -f "$DB_PATH" ]; then
    echo "[ERREUR] Base de données introuvable : $DB_PATH"
    exit 1
fi

mkdir -p "$BACKUP_DIR"

# --- Copie de la base de données ---
cp "$DB_PATH" "$BACKUP_FILE"

# --- Vérification que le backup n'est pas vide ---
if [ ! -s "$BACKUP_FILE" ]; then
    echo "[ERREUR] Le fichier de backup est vide"
    rm -f "$BACKUP_FILE"
    exit 1
fi

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[OK] Backup créé : $BACKUP_FILE ($BACKUP_SIZE)"

# --- Nettoyage des anciens backups ---
DELETED=$(find "$BACKUP_DIR" -name "*.db" -mtime +$RETENTION_DAYS -print)
if [ -n "$DELETED" ]; then
    find "$BACKUP_DIR" -name "*.db" -mtime +$RETENTION_DAYS -delete
    echo "[OK] Anciens backups supprimés (> $RETENTION_DAYS jours)"
fi

# --- Résumé ---
TOTAL=$(ls "$BACKUP_DIR"/*.db 2>/dev/null | wc -l)
echo "[OK] Total backups conservés : $TOTAL"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sauvegarde terminée."
