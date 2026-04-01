const express = require('express');
const auth = require('../middlewares/auth');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router.use(auth);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;