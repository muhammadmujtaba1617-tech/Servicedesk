const express = require('express');
const { protect } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.use(protect);
router.get('/', profileController.getProfile);

module.exports = router;
