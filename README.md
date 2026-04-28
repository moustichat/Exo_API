# Exo_API

API légère pour la gestion d'événements, utilisateurs et authentification.

Description
- Projet TypeScript/Node.js utilisant Prisma pour la gestion de la base de données.
- Fournit des endpoints REST pour les utilisateurs, l'authentification et les événements.


Principales fonctionnalités
- Authentification (login / refresh token)
- Gestion des utilisateurs
- Gestion des événements et des tickets
- Logging et middlewares pour validation et erreurs

Stack technique
- Node.js + TypeScript
- Prisma (ORM) avec migrations dans `prisma/migrations/`
- Base de données configurée via Prisma (voir `prisma/schema.prisma`)
- Dossier `src/` pour le code serveur

Structure du projet (extraits)
- `src/` : code serveur (routes, services, middlewares, utils)
- `prisma/` : schéma Prisma et migrations
- `auto_generated/` : code généré (Prisma client)

Installation
1. Installer les dépendances :

```bash
npm install
```

Base de données et Prisma
- Créer la base de données et appliquer les migrations :

```bash
npx prisma migrate deploy
# ou en dev
npx prisma migrate dev
```

- Générer le client Prisma (si nécessaire) :

```bash
npx prisma generate
```

Scripts usuels (package.json)
- `npm run dev` : démarre le serveur en mode développement
- `npm start` : démarre le serveur en production
- `npm run prisma` : (si défini) utilitaires Prisma

Points d'entrée et routes
- Serveur : `src/index.ts`
- Routes principales :
  - `src/routes/auth.routes.ts` — endpoints d'authentification
  - `src/routes/user.route.ts` — gestion utilisateurs
  - `src/routes/event.route.ts` — gestion événements

Middlewares utiles
- `src/middleware/auth.middleware.ts` — protection des routes
- `src/middleware/validate.middleware.ts` — validation des entrées
- `src/middleware/error.middleware.ts` — gestion centralisée des erreurs

Développement
- Lancer en dev (exemple avec nodemon/ts-node) :

```bash
npm run dev
```

- Pour tester l'API, utiliser Postman