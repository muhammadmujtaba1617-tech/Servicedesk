const settingsService = require('../services/settingsService');

const getSLA = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    return res.json({ success: true, data: settings.sla });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch SLA policies' });
  }
};

module.exports = {
  getSLA,
};

