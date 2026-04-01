const { fn, col, literal } = require('sequelize');
const { Book, Member, Borrow } = require('../models');

async function getBookStats(req, res) {
  const totalBooks = await Book.count();
  const totalAvailable = await Book.sum('available_quantity');
  return res.status(200).json({
    totalBooks,
    totalAvailable: totalAvailable || 0,
  });
}

async function getMemberStats(req, res) {
  const totalMembers = await Member.count();
  const activeMembers = await Member.count({ where: { status: 'active' } });
  return res.status(200).json({
    totalMembers,
    activeMembers,
  });
}

async function getBorrowStats(req, res) {
  const totalBorrows = await Borrow.count();
  const activeBorrows = await Borrow.count({ where: { status: 'borrowed' } });
  const returnedBorrows = await Borrow.count({ where: { status: 'returned' } });
  const overdueBorrows = await Borrow.count({ where: { status: 'overdue' } });

  const mostBorrowed = await Borrow.findAll({
    attributes: ['book_id', [fn('COUNT', col('Borrow.id')), 'borrow_count']],
    group: ['book_id'],
    order: [[literal('borrow_count'), 'DESC']],
    limit: 5,
    include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'author'] }],
  });

  return res.status(200).json({
    totalBorrows,
    activeBorrows,
    returnedBorrows,
    overdueBorrows,
    mostBorrowed,
  });
}

module.exports = { getBookStats, getMemberStats, getBorrowStats };

