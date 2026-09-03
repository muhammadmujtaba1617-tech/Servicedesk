const { sanitizeUserProfile } = require('../services/profileService');

const getProfile = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: { user: sanitizeUserProfile(req.user) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch profile' });
  }
};

module.exports = {
  getProfile,
};
