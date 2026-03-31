const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom ne peut pas être vide' },
      len: {
        args: [2, 100],
        msg: 'Le nom doit contenir entre 2 et 100 caractères'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Cet email est déjà utilisé'
    },
    validate: {
      isEmail: { msg: 'Format d\'email invalide' },
      notEmpty: { msg: 'L\'email ne peut pas être vide' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le mot de passe ne peut pas être vide' },
      len: {
        args: [6, 100],
        msg: 'Le mot de passe doit contenir au moins 6 caractères'
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: true, // Active createdAt et updatedAt automatiquement
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Méthode d'instance pour vérifier le mot de passe
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Méthode pour exclure le mot de passe des réponses
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;