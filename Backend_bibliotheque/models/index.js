const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const Book = require("./Book");
const Member = require("./Member");
const Borrow = require("./Borrow");

// Relations Category - Book
Category.hasMany(Book, {
  foreignKey: "category_id",
  as: "books",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
  constraints: {
    name: "fk_books_category",
  },
});

Book.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
  constraints: {
    name: "fk_books_category",
  },
});

// Relations Member - Borrow
Member.hasMany(Borrow, {
  foreignKey: "member_id",
  as: "borrows",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
  constraints: {
    name: "fk_borrows_member",
  },
});

Borrow.belongsTo(Member, {
  foreignKey: "member_id",
  as: "member",
  constraints: {
    name: "fk_borrows_member",
  },
});

// Relations Book - Borrow
Book.hasMany(Borrow, {
  foreignKey: "book_id",
  as: "borrows",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
  constraints: {
    name: "fk_borrows_book",
  },
});

Borrow.belongsTo(Book, {
  foreignKey: "book_id",
  as: "book",
  constraints: {
    name: "fk_borrows_book",
  },
});

// Exportation de tous les modèles
module.exports = {
  User,
  Category,
  Book,
  Member,
  Borrow,
  sequelize,
};
