const Joi = require('joi');
const { Op } = require('sequelize');
const { sequelize, Borrow, Book, Member } = require('../models');

const createSchema = Joi.object({
  member_id: Joi.number().integer().positive().required(),
  book_id: Joi.number().integer().positive().required(),
  due_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
});

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

async function getBorrows(req, res) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
  const offset = (page - 1) * limit;
  const where = {};

  const statusFilter = req.query.status;
  const today = todayStr();

  if (statusFilter === 'borrowed') {
    where.status = 'borrowed';
  } else if (statusFilter === 'returned') {
    where.status = 'returned';
  } else if (statusFilter === 'overdue') {
    where.status = 'borrowed';
    where.due_date = { [Op.lt]: today };
  }

  const { count, rows } = await Borrow.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
      { model: Book, as: 'book', attributes: ['id', 'title', 'author'] },
    ],
  });

  return res.status(200).json({
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1,
    borrows: rows,
  });
}

async function createBorrow(req, res) {
  const { error, value } = createSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { member_id, book_id, due_date } = value;
  const borrowDate = todayStr();

  if (due_date < borrowDate) {
    return res.status(400).json({ message: 'La date de retour prévue doit être au moins la date du jour' });
  }

  try {
    const borrow = await sequelize.transaction(async (t) => {
      const member = await Member.findByPk(member_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!member) throw Object.assign(new Error('Membre introuvable'), { status: 404 });
      if (member.status !== 'active') {
        throw Object.assign(new Error('Le membre doit être actif pour emprunter'), { status: 400 });
      }

      const book = await Book.findByPk(book_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!book) throw Object.assign(new Error('Livre introuvable'), { status: 404 });
      if (book.available_quantity < 1) {
        throw Object.assign(new Error('Aucun exemplaire disponible pour ce livre'), { status: 400 });
      }

      await book.update(
        { available_quantity: book.available_quantity - 1 },
        { transaction: t },
      );

      return Borrow.create(
        {
          member_id,
          book_id,
          borrow_date: borrowDate,
          due_date,
          status: 'borrowed',
        },
        { transaction: t },
      );
    });

    const withRelations = await Borrow.findByPk(borrow.id, {
      include: [
        { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author'] },
      ],
    });

    return res.status(201).json(withRelations);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    return res.status(500).json({ message: 'Erreur lors de la création de l’emprunt' });
  }
}

async function returnBorrow(req, res) {
  try {
    const result = await sequelize.transaction(async (t) => {
      const borrow = await Borrow.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!borrow) throw Object.assign(new Error('Emprunt introuvable'), { status: 404 });
      if (borrow.status === 'returned') {
        throw Object.assign(new Error('Ce livre a déjà été retourné'), { status: 400 });
      }

      const returnDate = todayStr();
      const book = await Book.findByPk(borrow.book_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!book) throw Object.assign(new Error('Livre introuvable'), { status: 404 });

      await book.update(
        { available_quantity: book.available_quantity + 1 },
        { transaction: t },
      );

      await borrow.update(
        {
          return_date: returnDate,
          status: 'returned',
        },
        { transaction: t },
      );

      return borrow;
    });

    const withRelations = await Borrow.findByPk(result.id, {
      include: [
        { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author'] },
      ],
    });

    return res.status(200).json({
      message: 'Livre retourné avec succès',
      borrow: withRelations,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    return res.status(500).json({ message: 'Erreur lors de l’enregistrement du retour' });
  }
}

module.exports = { getBorrows, createBorrow, returnBorrow };
