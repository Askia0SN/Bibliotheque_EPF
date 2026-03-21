const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le prénom ne peut pas être vide' },
      len: {
        args: [1, 100],
        msg: 'Le prénom doit contenir entre 1 et 100 caractères'
      }
    }
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom ne peut pas être vide' },
      len: {
        args: [1, 100],
        msg: 'Le nom doit contenir entre 1 et 100 caractères'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: {
      args: true,
      msg: 'Cet email est déjà utilisé'
    },
    validate: {
      isEmail: { msg: 'Format d\'email invalide' },
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [0, 20],
        msg: 'Le téléphone ne peut pas dépasser 20 caractères'
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'L\'adresse ne peut pas dépasser 500 caractères'
      }
    }
  },
  membership_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: { msg: 'Format de date invalide' }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive']],
        msg: 'Le statut doit être active ou inactive'
      }
    }
  }
}, {
  tableName: 'members',
  timestamps: true,
});

// Getter pour le nom complet
Member.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

module.exports = Member;