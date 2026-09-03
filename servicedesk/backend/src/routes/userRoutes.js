const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'agent'), userController.getUsers);
router.patch('/:id/role', authorize('admin'), userController.updateUserRole);

module.exports = router;

