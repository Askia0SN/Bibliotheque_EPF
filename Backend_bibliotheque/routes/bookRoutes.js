const express = require('express');
const auth = require('../middlewares/auth');
const bookController = require('../controllers/bookController');

const router = express.Router();

router.use(auth);

router.get('/', bookController.getBooks);
router.post('/', bookController.uploadCover.single('cover_image'), bookController.createBook);
router.put('/:id', bookController.uploadCover.single('cover_image'), bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router;