const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.use(protect);

router.get('/', settingsController.getSettings);
router.patch('/', authorize('admin'), settingsController.updateSettings);
router.put('/', authorize('admin'), settingsController.updateSettings);

module.exports = router;
