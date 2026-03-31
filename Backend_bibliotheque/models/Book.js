const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le titre ne peut pas être vide' },
      len: {
        args: [1, 255],
        msg: 'Le titre doit contenir entre 1 et 255 caractères'
      }
    }
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'L\'auteur ne peut pas être vide' },
      len: {
        args: [1, 255],
        msg: 'Le nom de l\'auteur doit contenir entre 1 et 255 caractères'
      }
    }
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: {
      args: true,
      msg: 'Cet ISBN est déjà utilisé'
    },
    validate: {
      len: {
        args: [0, 20],
        msg: 'L\'ISBN ne peut pas dépasser 20 caractères'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'La description ne peut pas dépasser 1000 caractères'
      }
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'La quantité doit être au moins 1'
      }
    }
  },
  available_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [0],
        msg: 'La quantité disponible ne peut pas être négative'
      },
      max: {
        args: [9999],
        msg: 'La quantité disponible ne peut pas dépasser 9999'
      }
    }
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: {
        args: [/^[a-zA-Z0-9-_]+\.(jpg|jpeg|png|webp)$/i],
        msg: 'Format de nom de fichier invalide'
      }
    }
  }
}, {
  tableName: 'books',
  timestamps: true,
});

// Hook pour initialiser available_quantity si non fourni
Book.beforeCreate((book) => {
  if (book.available_quantity === undefined || book.available_quantity === null) {
    book.available_quantity = book.quantity;
  }
});

module.exports = Book;