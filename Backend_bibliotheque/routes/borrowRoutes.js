const express = require('express');
const auth = require('../middlewares/auth');
const borrowController = require('../controllers/borrowController');

const router = express.Router();

router.use(auth);

router.get('/', borrowController.getBorrows);
router.post('/', borrowController.createBorrow);
router.put('/return/:id', borrowController.returnBorrow);

module.exports = router;
