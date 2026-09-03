const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const auditController = require('../controllers/auditController');

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin'), auditController.getAuditLogs);

module.exports = router;
