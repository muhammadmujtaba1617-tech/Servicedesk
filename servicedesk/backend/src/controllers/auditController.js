const auditService = require('../services/auditService');

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const logs = await auditService.getAuditLogs({ page, pageSize });
    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch audit logs' });
  }
};

module.exports = {
  getAuditLogs,
};
