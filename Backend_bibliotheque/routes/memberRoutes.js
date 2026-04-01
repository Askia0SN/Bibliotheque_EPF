const express = require('express');
const auth = require('../middlewares/auth');
const memberController = require('../controllers/memberController');

const router = express.Router();

router.use(auth);

router.get('/', memberController.getMembers);
router.post('/', memberController.createMember);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;