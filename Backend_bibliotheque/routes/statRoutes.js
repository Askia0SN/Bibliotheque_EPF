const express = require('express');
const auth = require('../middlewares/auth');
const statController = require('../controllers/statController');

const router = express.Router();

router.use(auth);

router.get('/books', statController.getBookStats);
router.get('/members', statController.getMemberStats);
router.get('/borrows', statController.getBorrowStats);

module.exports = router;