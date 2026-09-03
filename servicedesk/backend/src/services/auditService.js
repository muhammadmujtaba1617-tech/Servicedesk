const AuditLog = require('../models/AuditLog');

const logAudit = async ({ actor, action, entity, entityId, oldValue, newValue, metadata = {} }) => {
  if (!actor || !action || !entity || !entityId) {
    return null;
  }

  return AuditLog.create({
    actor,
    action,
    entity,
    entityId,
    oldValue,
    newValue,
    metadata,
  });
};

const getAuditLogs = async ({ page = 1, pageSize = 10 } = {}) => {
  const skip = (Number(page) - 1) * Number(pageSize);
  const [items, total] = await Promise.all([
    AuditLog.find({})
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize)),
    AuditLog.countDocuments(),
  ]);

  return {
    items,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages: Math.ceil(total / Number(pageSize)) || 1,
  };
};

module.exports = {
  logAudit,
  getAuditLogs,
};
