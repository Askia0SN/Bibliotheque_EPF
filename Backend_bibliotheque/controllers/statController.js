const { fn, col, literal, Op } = require('sequelize');
const { Book, Member, Borrow, Category } = require('../models');

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

async function getBookStats(req, res) {
  const totalBooks = await Book.count();
  const totalAvailable = await Book.sum('available_quantity');
  const totalBorrowed = await Borrow.count({ where: { status: 'borrowed' } });

  const byCategoryRows = await Category.findAll({
    attributes: [
      'id',
      'name',
      [fn('COUNT', col('books.id')), 'count'],
    ],
    include: [
      {
        model: Book,
        as: 'books',
        attributes: [],
        required: false,
      },
    ],
    group: ['Category.id', 'Category.name'],
    subQuery: false,
  });

  const byCategory = byCategoryRows.map((row) => ({
    category_id: row.id,
    count: Number(row.get('count')),
    category: { name: row.name },
  }));

  return res.status(200).json({
    totalBooks,
    totalAvailable: totalAvailable || 0,
    totalBorrowed,
    byCategory,
  });
}

async function getMemberStats(req, res) {
  const totalMembers = await Member.count();
  const activeMembers = await Member.count({ where: { status: 'active' } });
  const inactiveMembers = await Member.count({ where: { status: 'inactive' } });

  return res.status(200).json({
    totalMembers,
    activeMembers,
    inactiveMembers,
  });
}

async function getBorrowStats(req, res) {
  const totalBorrows = await Borrow.count();
  const activeBorrows = await Borrow.count({ where: { status: 'borrowed' } });
  const returnedBorrows = await Borrow.count({ where: { status: 'returned' } });
  const today = todayStr();
  const overdueBorrows = await Borrow.count({
    where: {
      status: 'borrowed',
      due_date: { [Op.lt]: today },
    },
  });

  const mostBorrowedRaw = await Borrow.findAll({
    attributes: ['book_id', [fn('COUNT', col('Borrow.id')), 'borrow_count']],
    group: ['Borrow.book_id', 'book.id', 'book.title', 'book.author'],
    order: [[literal('borrow_count'), 'DESC']],
    limit: 5,
    subQuery: false,
    include: [{ model: Book, as: 'book', attributes: ['title', 'author'], required: true }],
  });

  const mostBorrowed = mostBorrowedRaw.map((row) => ({
    book_id: row.book_id,
    borrow_count: String(row.get('borrow_count')),
    book: {
      title: row.book?.title,
      author: row.book?.author,
    },
  }));

  return res.status(200).json({
    totalBorrows,
    activeBorrows,
    returnedBorrows,
    overdueBorrows,
    mostBorrowed,
  });
}

module.exports = { getBookStats, getMemberStats, getBorrowStats };
