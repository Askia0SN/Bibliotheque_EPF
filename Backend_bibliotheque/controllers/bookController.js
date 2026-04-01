const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const { Book, Category } = require('../models');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Format image invalide (jpeg/jpg/png/webp requis)'));
    }
    cb(null, true);
  },
});

const createSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  author: Joi.string().min(1).max(255).required(),
  isbn: Joi.string().max(20).allow('', null),
  category_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required(),
  available_quantity: Joi.number().integer().min(0).optional(),
  description: Joi.string().max(1000).allow('', null),
});

const updateSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  author: Joi.string().min(1).max(255).optional(),
  isbn: Joi.string().max(20).allow('', null).optional(),
  category_id: Joi.number().integer().positive().optional(),
  quantity: Joi.number().integer().min(1).optional(),
  available_quantity: Joi.number().integer().min(0).optional(),
  description: Joi.string().max(1000).allow('', null).optional(),
}).min(1);

function parsePayload(body) {
  const payload = { ...body };
  if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
  if (payload.available_quantity !== undefined) payload.available_quantity = Number(payload.available_quantity);
  if (payload.category_id !== undefined) payload.category_id = Number(payload.category_id);
  return payload;
}

async function getBooks(req, res) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${req.query.search}%` } },
      { author: { [Op.like]: `%${req.query.search}%` } },
    ];
  }
  if (req.query.category_id) where.category_id = Number(req.query.category_id);

  const { count, rows } = await Book.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
  });
//test commit
  return res.status(200).json({
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1,
    books: rows,
  });
}

async function createBook(req, res) {
  try {
    const payload = parsePayload(req.body);
    const { error, value } = createSchema.validate(payload, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const category = await Category.findByPk(value.category_id);
    if (!category) return res.status(400).json({ message: 'Catégorie invalide' });

    if (value.available_quantity === undefined) value.available_quantity = value.quantity;
    if (req.file) value.cover_image = req.file.filename;

    const book = await Book.create(value);
    const withCategory = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });
    return res.status(201).json(withCategory);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Cet ISBN est déjà utilisé' });
    }
    return res.status(500).json({ message: err.message || 'Erreur lors de la création du livre' });
  }
}

async function updateBook(req, res) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });

    const payload = parsePayload(req.body);
    const { error, value } = updateSchema.validate(payload, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    if (value.category_id !== undefined) {
      const category = await Category.findByPk(value.category_id);
      if (!category) return res.status(400).json({ message: 'Catégorie invalide' });
    }

    if (req.file) value.cover_image = req.file.filename;
    await book.update(value);

    const withCategory = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });
    return res.status(200).json(withCategory);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Cet ISBN est déjà utilisé' });
    }
    return res.status(500).json({ message: err.message || 'Erreur lors de la mise à jour du livre' });
  }
}

async function deleteBook(req, res) {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ message: 'Livre introuvable' });
  await book.destroy();
  return res.status(200).json({ message: 'Livre supprimé' });
}

module.exports = { uploadCover, getBooks, createBook, updateBook, deleteBook };

