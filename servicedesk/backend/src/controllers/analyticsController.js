const analyticsService = require('../services/analyticsService');

const getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const analytics = await analyticsService.getRealAnalytics({ days });

    return res.json({ success: true, data: analytics });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to fetch analytics' });
  }
};

module.exports = {
  getAnalytics,
};

