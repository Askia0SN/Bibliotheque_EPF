const Joi = require('joi');
const { Category, Book } = require('../models');

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow('', null),
});

async function getCategories(req, res) {
  const categories = await Category.findAll({
    order: [['name', 'ASC']],
    include: [{ model: Book, as: 'books', attributes: ['id'] }],
  });
  return res.status(200).json(categories);
}

async function createCategory(req, res) {
  try {
    const { error, value } = categorySchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const category = await Category.create(value);
    const withBooks = await Category.findByPk(category.id, {
      include: [{ model: Book, as: 'books', attributes: ['id'] }],
    });
    return res.status(201).json(withBooks);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Cette catégorie existe déjà' });
    }
    return res.status(500).json({ message: 'Erreur lors de la création de la catégorie' });
  }
}

async function updateCategory(req, res) {
  try {
    const { error, value } = categorySchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Catégorie introuvable' });

    await category.update(value);
    const withBooks = await Category.findByPk(category.id, {
      include: [{ model: Book, as: 'books', attributes: ['id'] }],
    });
    return res.status(200).json(withBooks);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Cette catégorie existe déjà' });
    }
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la catégorie' });
  }
}

async function deleteCategory(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: 'Catégorie introuvable' });

  const booksCount = await Book.count({ where: { category_id: category.id } });
  if (booksCount > 0) {
    return res.status(400).json({ message: 'Impossible de supprimer une catégorie contenant des livres' });
  }

  await category.destroy();
  return res.status(200).json({ message: 'Catégorie supprimée' });
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

