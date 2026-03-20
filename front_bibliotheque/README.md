# Gestion de Bibliothèque

Application web complète de gestion de bibliothèque (livres, membres, emprunts).

---

# PARTIE FRONTEND

## Présentation

Interface web développée en React permettant à l'administrateur de gérer l'ensemble des ressources de la bibliothèque via une API REST.

### Fonctionnalités

- Connexion sécurisée (JWT)
- Tableau de bord avec statistiques en temps réel
- Gestion des livres (ajout, modification, suppression, upload de couverture, recherche, pagination)
- Gestion des catégories de livres
- Gestion des membres de la bibliothèque
- Suivi des emprunts et retours de livres

---

## Technologies Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18 | Bibliothèque UI |
| Vite | 4 | Bundler et serveur de développement |
| React Router | v6 | Navigation entre les pages |
| Axios | 1.5 | Client HTTP pour appels API |
| Bootstrap | 5.3 | Framework CSS |
| Font Awesome | 6.4 | Icônes |
| React Toastify | 9 | Notifications utilisateur |

---

## Installation et démarrage

### Prérequis

- Node.js v18 ou supérieur
- npm v8 ou supérieur
- Le backend doit être démarré sur le port `5000`

### Étapes

```bash
cd frontend

# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement (optionnel)
cp .env.example .env
```

Contenu du fichier `.env` :

```env
VITE_API_URL=http://localhost:5000/api
```

> La valeur par défaut pointe déjà vers `http://localhost:5000/api`.
> Modifier uniquement si le backend tourne sur un autre port ou hôte.

```bash
# 3. Démarrer en développement
npm run dev

# Ou en production
npm run build && npm run preview
```

L'application démarre sur **http://localhost:3000**

Se connecter avec le compte admin créé automatiquement par le backend :

| Email | Mot de passe |
|-------|-------------|
| `admin@bibliotheque.com` | `admin123` |

---

## Structure du projet Frontend

```
frontend/
├── index.html                  # Point d'entrée HTML (Bootstrap + Font Awesome CDN)
├── vite.config.js              # Configuration Vite + proxy vers API backend
├── package.json
└── src/
    ├── main.jsx                # Point d'entrée React (BrowserRouter, AuthProvider)
    ├── App.jsx                 # Routage principal + protection des routes privées
    ├── context/
    │   └── AuthContext.jsx     # État global auth : user, login(), logout()
    ├── services/
    │   └── api.js              # Instance Axios préconfigurée (baseURL, token, interceptors)
    ├── components/
    │   └── Layout/
    │       ├── Layout.jsx      # Mise en page : Sidebar + Navbar + <Outlet />
    │       ├── Sidebar.jsx     # Menu de navigation latéral
    │       └── Navbar.jsx      # Barre supérieure (nom admin + déconnexion)
    └── pages/
        ├── LoginPage.jsx       # Formulaire de connexion
        ├── DashboardPage.jsx   # Tableau de bord (appel /stats/*)
        ├── BooksPage.jsx       # CRUD livres + upload image + recherche + pagination
        ├── CategoriesPage.jsx  # CRUD catégories
        ├── MembersPage.jsx     # CRUD membres + pagination
        └── BorrowsPage.jsx     # Gestion emprunts + retours
```

---
---

# PARTIE BACKEND

## Présentation

API REST sécurisée exposant les ressources nécessaires à la gestion d'une bibliothèque.
Toutes les routes (sauf login/register) sont protégées par un token JWT transmis dans le header `Authorization: Bearer <token>`.

---

## Technologies Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 18+ | Environnement d'exécution |
| Express.js | 4.18 | Framework web HTTP |
| Sequelize | 6 | ORM — mapping objet/relationnel |
| MySQL2 | 3 | Driver MySQL |
| jsonwebtoken | 9 | Génération et vérification des tokens JWT |
| bcryptjs | 2.4 | Hachage des mots de passe |
| Joi | 17 | Validation des données en entrée |
| Multer | 1.4 | Upload de fichiers (images de couverture) |
| dotenv | 16 | Variables d'environnement |
| cors | 2.8 | Autorisation des requêtes cross-origin |

---

## Configuration requise

Créer un fichier `.env` à la racine du dossier `backend/` :

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_db
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=une_cle_secrete_longue_et_aleatoire
JWT_EXPIRES_IN=7d
```

Créer la base de données MySQL :

```sql
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Les tables sont créées et synchronisées automatiquement au démarrage (`sequelize.sync({ alter: true })`).
Un compte administrateur par défaut est inséré si aucun utilisateur n'existe :

| Email | Mot de passe |
|-------|-------------|
| `admin@bibliotheque.com` | `admin123` |

---

## Modèles de données

### User
| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | INTEGER | PK, auto-increment |
| `name` | STRING | NOT NULL |
| `email` | STRING | NOT NULL, UNIQUE |
| `password` | STRING | NOT NULL, haché avec bcrypt |
| `createdAt` | DATE | auto |
| `updatedAt` | DATE | auto |

### Category
| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | INTEGER | PK, auto-increment |
| `name` | STRING | NOT NULL, UNIQUE |
| `description` | TEXT | nullable |

### Book
| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | INTEGER | PK, auto-increment |
| `title` | STRING | NOT NULL |
| `author` | STRING | NOT NULL |
| `isbn` | STRING | UNIQUE, nullable |
| `category_id` | INTEGER | FK → Category |
| `description` | TEXT | nullable |
| `quantity` | INTEGER | total en stock, défaut 1 |
| `available_quantity` | INTEGER | disponible à l'emprunt, défaut 1 |
| `cover_image` | STRING | nom du fichier dans `/uploads/` |

### Member
| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | INTEGER | PK, auto-increment |
| `first_name` | STRING | NOT NULL |
| `last_name` | STRING | NOT NULL |
| `email` | STRING | UNIQUE, nullable |
| `phone` | STRING | nullable |
| `address` | TEXT | nullable |
| `membership_date` | DATEONLY | défaut = date du jour |
| `status` | ENUM | `active` \| `inactive`, défaut `active` |

### Borrow
| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | INTEGER | PK, auto-increment |
| `member_id` | INTEGER | FK → Member |
| `book_id` | INTEGER | FK → Book |
| `borrow_date` | DATEONLY | date de l'emprunt |
| `due_date` | DATEONLY | NOT NULL, date de retour prévue |
| `return_date` | DATEONLY | nullable, renseigné au retour |
| `status` | ENUM | `borrowed` \| `returned` \| `overdue` |

---

## Authentification

Toutes les routes protégées attendent le header HTTP suivant :

```
Authorization: Bearer <jwt_token>
```

### POST `/api/auth/register`

Crée un nouvel utilisateur administrateur.

**Corps de la requête :**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

| Champ | Type | Requis | Règles |
|-------|------|--------|--------|
| `name` | string | oui | min 2, max 100 caractères |
| `email` | string | oui | format email valide |
| `password` | string | oui | min 6 caractères |

**Réponse `201` :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": { "id": 1, "name": "Jean Dupont", "email": "jean@example.com" }
}
```

---

### POST `/api/auth/login`

**Corps de la requête :**
```json
{
  "email": "admin@bibliotheque.com",
  "password": "admin123"
}
```

**Réponse `200` :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": { "id": 1, "name": "Administrateur", "email": "admin@bibliotheque.com" }
}
```

**Erreurs possibles :**
- `401` — Email ou mot de passe incorrect

---

### GET `/api/auth/profile` *(protégé)*

**Réponse `200` :**
```json
{ "id": 1, "name": "Administrateur", "email": "admin@bibliotheque.com" }
```

---

## Module Catégories *(toutes les routes protégées)*

### GET `/api/categories`

**Réponse `200` :**
```json
[
  {
    "id": 1,
    "name": "Roman",
    "description": "Littérature romanesque",
    "books": [{ "id": 3 }, { "id": 7 }]
  }
]
```

> Le tableau `books` contient uniquement les `id` des livres rattachés à la catégorie.

---

### POST `/api/categories`

**Corps de la requête :**
```json
{
  "name": "Sciences",
  "description": "Livres scientifiques"
}
```

| Champ | Type | Requis | Règles |
|-------|------|--------|--------|
| `name` | string | oui | min 2, max 100 caractères |
| `description` | string | non | max 500 caractères |

**Réponse `201` :** objet Category créé.

---

### PUT `/api/categories/:id`

Mêmes champs que POST. **Réponse `200` :** objet Category mis à jour.

---

### DELETE `/api/categories/:id`

**Réponse `200` :**
```json
{ "message": "Catégorie supprimée" }
```

---

## Module Livres *(toutes les routes protégées)*

### GET `/api/books`

**Paramètres de requête (query string) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `search` | string | Recherche dans `title` et `author` (LIKE) |
| `category_id` | number | Filtre par catégorie |
| `page` | number | Numéro de page (défaut : 1) |
| `limit` | number | Nombre de résultats par page (défaut : 10) |

**Réponse `200` :**
```json
{
  "total": 42,
  "page": 1,
  "totalPages": 5,
  "books": [
    {
      "id": 1,
      "title": "Le Petit Prince",
      "author": "Antoine de Saint-Exupéry",
      "isbn": "978-2-07-040850-4",
      "category_id": 1,
      "description": "Un classique de la littérature",
      "quantity": 3,
      "available_quantity": 2,
      "cover_image": "1693000000000-123456789.jpg",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "category": { "id": 1, "name": "Roman" }
    }
  ]
}
```

---

### POST `/api/books`

> Requête de type `multipart/form-data` (pour l'upload d'image).

| Champ | Type | Requis | Règles |
|-------|------|--------|--------|
| `title` | string | oui | min 1, max 255 caractères |
| `author` | string | oui | min 1, max 255 caractères |
| `isbn` | string | non | max 20 caractères |
| `category_id` | number | oui | ID d'une catégorie existante |
| `quantity` | number | oui | entier >= 1 |
| `available_quantity` | number | non | entier >= 0 (défaut = quantity) |
| `description` | string | non | max 1000 caractères |
| `cover_image` | file | non | image jpeg/jpg/png/webp, max 5 Mo |

**Réponse `201` :** objet Book créé.

---

### PUT `/api/books/:id`

Mêmes champs que POST (tous optionnels). L'image n'est remplacée que si un nouveau fichier est envoyé.

---

### DELETE `/api/books/:id`

**Réponse `200` :**
```json
{ "message": "Livre supprimé" }
```

---

## Module Membres *(toutes les routes protégées)*

### GET `/api/members`

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `search` | string | Recherche dans `first_name`, `last_name`, `email` |
| `status` | string | Filtre : `active` ou `inactive` |
| `page` | number | Numéro de page (défaut : 1) |
| `limit` | number | Résultats par page (défaut : 10) |

**Réponse `200` :**
```json
{
  "total": 100,
  "page": 1,
  "totalPages": 10,
  "members": [
    {
      "id": 1,
      "first_name": "Marie",
      "last_name": "Martin",
      "email": "marie@example.com",
      "phone": "0601020304",
      "address": "12 rue des Fleurs, Paris",
      "membership_date": "2024-01-15",
      "status": "active"
    }
  ]
}
```

---

### POST `/api/members`

| Champ | Type | Requis | Règles |
|-------|------|--------|--------|
| `first_name` | string | oui | min 1, max 100 caractères |
| `last_name` | string | oui | min 1, max 100 caractères |
| `email` | string | non | format email valide |
| `phone` | string | non | max 20 caractères |
| `address` | string | non | max 500 caractères |
| `membership_date` | date | non | format `YYYY-MM-DD` (défaut = aujourd'hui) |
| `status` | string | non | `active` ou `inactive` (défaut : `active`) |

**Réponse `201` :** objet Member créé.

---

### PUT `/api/members/:id`

Mêmes champs que POST. **Réponse `200` :** objet Member mis à jour.

---

### DELETE `/api/members/:id`

**Réponse `200` :**
```json
{ "message": "Membre supprimé" }
```

---

## Module Emprunts *(toutes les routes protégées)*

### GET `/api/borrows`

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `status` | string | Filtre : `borrowed`, `returned`, `overdue` |
| `page` | number | Numéro de page (défaut : 1) |
| `limit` | number | Résultats par page (défaut : 10) |

**Réponse `200` :**
```json
{
  "total": 50,
  "page": 1,
  "totalPages": 5,
  "borrows": [
    {
      "id": 1,
      "member_id": 2,
      "book_id": 5,
      "borrow_date": "2024-03-01",
      "due_date": "2024-03-15",
      "return_date": null,
      "status": "borrowed",
      "member": { "id": 2, "first_name": "Marie", "last_name": "Martin" },
      "book": { "id": 5, "title": "Le Petit Prince", "author": "Antoine de Saint-Exupéry" }
    }
  ]
}
```

---

### POST `/api/borrows`

| Champ | Type | Requis | Règles |
|-------|------|--------|--------|
| `member_id` | number | oui | ID d'un membre existant avec status = `active` |
| `book_id` | number | oui | ID d'un livre avec `available_quantity` >= 1 |
| `due_date` | date | oui | format `YYYY-MM-DD`, date de retour prévue |

**Règles métier :**
- Le livre doit avoir `available_quantity >= 1` sinon erreur `400`
- Le membre doit avoir `status = active` sinon erreur `400`
- À la création : `available_quantity` du livre est décrémenté de 1

**Réponse `201` :** objet Borrow avec les relations `member` et `book` incluses.

---

### PUT `/api/borrows/return/:id`

Enregistre le retour d'un livre emprunté.

**Règles métier :**
- Si l'emprunt est déjà `returned`, erreur `400`
- Le champ `return_date` est automatiquement renseigné à la date du jour
- Le `status` passe à `returned`
- Le `available_quantity` du livre est incrémenté de 1

**Réponse `200` :**
```json
{
  "message": "Livre retourné avec succès",
  "borrow": { "id": 1, "status": "returned", "return_date": "2024-03-12", "..." : "..." }
}
```

---

## Module Statistiques *(toutes les routes protégées)*

### GET `/api/stats/books`

**Réponse `200` :**
```json
{
  "totalBooks": 42,
  "totalAvailable": 30,
  "totalBorrowed": 12,
  "byCategory": [
    {
      "category_id": 1,
      "count": 15,
      "category": { "name": "Roman" }
    },
    {
      "category_id": 2,
      "count": 10,
      "category": { "name": "Sciences" }
    }
  ]
}
```

| Variable | Type | Description |
|----------|------|-------------|
| `totalBooks` | `number` | Nombre total de livres enregistrés |
| `totalAvailable` | `number` | Somme de `available_quantity` sur tous les livres |
| `totalBorrowed` | `number` | Nombre d'emprunts actifs (`status = borrowed`) |
| `byCategory` | `array` | Répartition du nombre de livres par catégorie |
| `byCategory[].category_id` | `number` | ID de la catégorie |
| `byCategory[].count` | `number` | Nombre de livres dans cette catégorie |
| `byCategory[].category.name` | `string` | Nom de la catégorie |

---

### GET `/api/stats/members`

**Réponse `200` :**
```json
{
  "totalMembers": 100,
  "activeMembers": 85,
  "inactiveMembers": 15
}
```

| Variable | Type | Description |
|----------|------|-------------|
| `totalMembers` | `number` | Nombre total de membres enregistrés |
| `activeMembers` | `number` | Membres avec `status = active` |
| `inactiveMembers` | `number` | Membres avec `status = inactive` |

---

### GET `/api/stats/borrows`

**Réponse `200` :**
```json
{
  "totalBorrows": 200,
  "activeBorrows": 12,
  "returnedBorrows": 183,
  "overdueBorrows": 5,
  "mostBorrowed": [
    {
      "book_id": 3,
      "borrow_count": "18",
      "book": {
        "title": "Le Petit Prince",
        "author": "Antoine de Saint-Exupéry"
      }
    }
  ]
}
```

| Variable | Type | Description |
|----------|------|-------------|
| `totalBorrows` | `number` | Nombre total d'emprunts (toutes périodes confondues) |
| `activeBorrows` | `number` | Emprunts en cours (`status = borrowed`) |
| `returnedBorrows` | `number` | Emprunts soldés (`status = returned`) |
| `overdueBorrows` | `number` | Emprunts actifs dont la `due_date` est dépassée |
| `mostBorrowed` | `array` | Top 5 des livres les plus empruntés (toutes périodes) |
| `mostBorrowed[].book_id` | `number` | ID du livre |
| `mostBorrowed[].borrow_count` | `string` | Nombre total d'emprunts pour ce livre |
| `mostBorrowed[].book.title` | `string` | Titre du livre |
| `mostBorrowed[].book.author` | `string` | Auteur du livre |

---

## Format des erreurs

Toutes les erreurs retournent un JSON structuré :

```json
{ "message": "Description de l'erreur" }
```

Pour les erreurs de validation (400) :

```json
{
  "message": "Données invalides",
  "errors": ["\"title\" is required", "\"quantity\" must be a number"]
}
```

| Code HTTP | Signification |
|-----------|---------------|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Données invalides ou règle métier non respectée |
| `401` | Non authentifié (token manquant ou invalide) |
| `404` | Ressource introuvable |
| `500` | Erreur interne du serveur |

---

## Démarrage rapide

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Ouvrir **http://localhost:3000** — Email : `admin@bibliotheque.com` — Mot de passe : `admin123`
