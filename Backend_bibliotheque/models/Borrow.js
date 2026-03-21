const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Borrow = sequelize.define('Borrow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  borrow_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: { msg: 'Format de date d\'emprunt invalide' }
    }
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Format de date d\'échéance invalide' },
      isAfterToday(value) {
        if (value < this.borrow_date) {
          throw new Error('La date d\'échéance doit être postérieure à la date d\'emprunt');
        }
      }
    }
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'Format de date de retour invalide' },
      isAfterBorrowDate(value) {
        if (value && value < this.borrow_date) {
          throw new Error('La date de retour ne peut pas être antérieure à la date d\'emprunt');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
    defaultValue: 'borrowed',
    validate: {
      isIn: {
        args: [['borrowed', 'returned', 'overdue']],
        msg: 'Le statut doit être borrowed, returned ou overdue'
      }
    }
  }
}, {
  tableName: 'borrows',
  timestamps: true,
});

// Hook pour mettre à jour le statut en overdue si nécessaire
Borrow.beforeFind((options) => {
  // Ne pas inclure dans les hooks de find
});

// Méthode pour vérifier si l'emprunt est en retard
Borrow.prototype.isOverdue = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.status === 'borrowed' && this.due_date < today;
};

// Méthode pour retourner un livre
Borrow.prototype.returnBook = function(returnDate = new Date()) {
  this.return_date = returnDate.toISOString().split('T')[0];
  this.status = 'returned';
  return this.save();
};

module.exports = Borrow;