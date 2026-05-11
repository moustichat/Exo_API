# Exo_API

API légère pour la gestion d'événements, d'utilisateurs et d'authentification.

Résumé
- Projet TypeScript / Node.js
- ORM : Prisma (migrations dans `prisma/migrations/`)
- Base de données : configurée via `DATABASE_URL` (par défaut SQLite en développement)
- Code serveur : dossier `src/`

Prérequis
- Node.js 18+ (recommandé)
- npm 8+ (ou yarn/pnpm)
- Git

Installation et configuration (sur une nouvelle machine)
1. Cloner le dépôt et aller dans le dossier backend :

```bash
git clone <repo-url>
cd Exo_API
```

2. Installer les dépendances :

```bash
npm install
```

3. Copier l'exemple d'environnement et adapter les valeurs :

```bash
cp .env.example .env
```

Éditez `.env` pour mettre vos secrets : `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, et `DATABASE_URL`.

Configuration de la base de données (Prisma)
- Si vous utilisez la configuration par défaut (SQLite), le fichier de base apparaîtra automatiquement.
- Pour Postgres/MySQL, mettez la bonne `DATABASE_URL` dans `.env`.

Appliquer les migrations et générer le client Prisma (développement) :

```bash
npx prisma generate
npx prisma migrate dev --name init
```

En production (appliquer les migrations sans prompt) :

```bash
npx prisma migrate deploy
```

Scripts utiles
- `npm run dev` : démarre le serveur en mode développement (`tsx src/index.ts`)
- `npm start` : démarre le serveur en production (lit `dist/index.js`)
- `npm test` : lance la suite de tests (Jest)
- `npm run seed:test-events` : lance le script de seed des événements de test

Lancer le serveur en développement

```bash
npm run dev
```

Tests
- Lancer les tests unitaires / d'intégration :

```bash
npm test
```

Fichier d'exemple d'environnement
- Voir [Exo_API/.env.example](Exo_API/.env.example) pour les variables requises (PORT, DATABASE_URL, JWT_*, FRONTEND_URL).

Démarrer le frontend (projet séparé)
1. Ouvrir un nouveau terminal et aller dans le dossier frontend :

```bash
cd ../Exo_React
npm install
npm run dev
```

2. Par défaut Vite démarre sur `http://localhost:5173`. Assurez-vous que `FRONTEND_URL` dans le backend `.env` contient cette URL pour les CORS/redirections.

Déploiement rapide (notes)
- Construire le frontend : `npm run build` dans `Exo_React` puis servir les fichiers statiques.
- En production, configurez une base de données distante et mettez `NODE_ENV=production` et `DATABASE_URL` appropriée.

Dépannage
- Si Prisma se plaint, exécutez `npx prisma generate` puis `npx prisma migrate dev`.
- Pour les problèmes de dépendances, supprimez `node_modules` et `package-lock.json` puis `npm install`.

Fichiers importants
- Entrée serveur : `src/index.ts`
- Schéma Prisma : `prisma/schema.prisma`
