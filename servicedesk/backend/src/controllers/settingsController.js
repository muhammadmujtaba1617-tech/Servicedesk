const settingsService = require('../services/settingsService');
const auditService = require('../services/auditService');

const getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    return res.json({ success: true, data: settings });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to fetch settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateSettings(req.body);

    await auditService.logAudit({
      actor: req.user._id,
      action: 'update_settings',
      entity: 'Setting',
      entityId: settings._id.toString(),
      newValue: req.body,
      metadata: { updatedByRole: req.user.role },
    });

    return res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to update settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
