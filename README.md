# Projet JS — Gestion de bibliothèque

Application web complète pour gérer une bibliothèque : **catalogue de livres**, **catégories**, **membres**, **emprunts** et **tableau de bord statistique**. Le projet est découpé en une **API REST** (Node.js) et une **interface React** (Vite).

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Variables d’environnement](#variables-denvironnement)
- [API (aperçu)](#api-apercu)
- [Structure des dossiers](#structure-des-dossiers)

## Fonctionnalités

- **Authentification** : inscription, connexion, profil utilisateur avec **JWT** (`Authorization: Bearer <token>`).
- **Catégories** : CRUD, liste avec les identifiants des livres rattachés.
- **Livres** : CRUD, recherche et pagination, filtre par catégorie, upload d’image de couverture (multipart).
- **Membres** : CRUD, recherche, filtre par statut (actif / inactif), pagination.
- **Emprunts** : liste paginée et filtrable (en cours, retournés, en retard), création avec décrément du stock disponible, retour de livre avec réincrémentation.
- **Statistiques** : agrégats livres / membres / emprunts pour le dashboard (dont répartition par catégorie, emprunts en retard calculés par date d’échéance).

## Architecture

| Partie | Technologies |
|--------|----------------|
| **Backend** | Node.js, Express 5, Sequelize 6, MySQL (`mysql2`), JWT (`jsonwebtoken`), validation (Joi), upload (Multer), bcryptjs |
| **Frontend** | React 18, React Router 6, Vite, Axios, React Toastify, Bootstrap (classes utilitaires) |

La logique métier côté serveur est organisée en **controllers** (`Backend_bibliotheque/controllers/`), les **routes** ne font que brancher les URL sur ces handlers.

## Prérequis

- [Node.js](https://nodejs.org/) (LTS recommandé)
- [MySQL](https://dev.mysql.com/) avec une base de données créée (ex. `library_db`)

## Installation et lancement

### 1. Backend

```bash
cd Backend_bibliotheque
npm install
```

Créer un fichier `.env` à la racine de `Backend_bibliotheque` (voir [Variables d’environnement](#variables-denvironnement)).

```bash
npm run dev
```

Le serveur écoute par défaut sur le port **5000** (`http://localhost:5000`).

Au premier démarrage, la synchronisation Sequelize crée les tables manquantes et initialise un compte administrateur par défaut (voir les logs de `utils/syncDatabase.js`).

### 2. Frontend

```bash
cd front_bibliotheque
npm install
```

Copier `.env.example` vers `.env` et ajuster l’URL de l’API si besoin.

```bash
npm run dev
```

L’application Vite tourne en général sur **http://localhost:5173** (le port peut varier ; consulter la sortie du terminal).

## Variables d’environnement

### Backend (`Backend_bibliotheque/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Port HTTP du serveur (défaut : `5000`) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Connexion MySQL |
| `JWT_SECRET` | Secret de signature des JWT (**obligatoire en production**) |
| `JWT_EXPIRES_IN` | Durée de validité du token (ex. `7d`) |
| `FRONTEND_URL` | Origine autorisée pour CORS (défaut : `http://localhost:3000` ; adapter si Vite utilise un autre port) |
| `SEQUELIZE_SYNC_FORCE` | Si `true` / `1` / `yes` : recréation complète des tables (**destructif**, réservé au développement) |

### Frontend (`front_bibliotheque/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL de base de l’API (ex. `http://localhost:5000/api`) |

## API (aperçu)

Toutes les routes métier (sauf auth publique `register` / `login`) attendent l’en-tête :

```http
Authorization: Bearer <jwt_token>
```

Préfixes utiles :

- `/api/auth` — register, login, profile  
- `/api/categories` — CRUD catégories  
- `/api/books` — CRUD livres (+ query `search`, `category_id`, `page`, `limit`)  
- `/api/members` — CRUD membres (+ `search`, `status`, pagination)  
- `/api/borrows` — liste / création emprunt / retour (`PUT .../return/:id`)  
- `/api/stats` — `books`, `members`, `borrows`  

Les fichiers statiques des couvertures sont servis sous `/uploads` depuis `Backend_bibliotheque/uploads/`.

## Structure des dossiers

```
Projet_JS_Bibliotheque/
├── Backend_bibliotheque/
│   ├── config/           # Sequelize / base de données
│   ├── controllers/      # Logique métier (auth, livres, emprunts, stats, etc.)
│   ├── middlewares/      # Authentification JWT
│   ├── models/           # Modèles Sequelize (User, Book, Member, Borrow, …)
│   ├── routes/           # Définition des routes Express
│   ├── uploads/          # Images de couverture (créé au besoin)
│   ├── utils/            # JWT, synchronisation DB
│   ├── app.js
│   └── server.js
├── front_bibliotheque/
│   ├── src/
│   │   ├── components/   # Layout (sidebar, navbar)
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Dashboard, livres, catégories, membres, emprunts, login, register
│   │   └── services/     # Client Axios (api.js)
│   └── vite.config.js (si présent)
└── README.md
```

## Licence

Projet pédagogique — voir les métadonnées des `package.json` pour les licences des dépendances.
