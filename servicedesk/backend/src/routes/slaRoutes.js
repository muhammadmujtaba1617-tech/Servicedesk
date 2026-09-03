const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const slaController = require('../controllers/slaController');

const router = express.Router();

router.use(protect);
router.get('/', authorize('agent', 'admin'), slaController.getSLA);

module.exports = router;
