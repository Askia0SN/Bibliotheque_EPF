const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Cette catégorie existe déjà'
    },
    validate: {
      notEmpty: { msg: 'Le nom de la catégorie ne peut pas être vide' },
      len: {
        args: [2, 100],
        msg: 'Le nom doit contenir entre 2 et 100 caractères'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La description ne peut pas dépasser 500 caractères'
      }
    }
  }
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Category;