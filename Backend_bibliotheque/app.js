const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import des modèles et synchronisation
const syncDatabase = require('./utils/syncDatabase');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Synchroniser la base de données au démarrage
syncDatabase();

// Routes (à créer plus tard)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/categories', require('./routes/categoryRoutes'));
// app.use('/api/books', require('./routes/bookRoutes'));
// app.use('/api/members', require('./routes/memberRoutes'));
// app.use('/api/borrows', require('./routes/borrowRoutes'));
// app.use('/api/stats', require('./routes/statRoutes'));

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne !' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;