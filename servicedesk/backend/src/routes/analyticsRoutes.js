const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'agent'), analyticsController.getAnalytics);

module.exports = router;
