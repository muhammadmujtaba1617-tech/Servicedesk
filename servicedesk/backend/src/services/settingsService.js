const Setting = require('../models/Setting');

const getSettings = async () => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({});
  }
  return setting;
};

const updateSettings = async (payload) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create(payload);
    return setting;
  }

  if (payload.sla) {
    const currentSla = setting.sla ? (setting.sla.toObject ? setting.sla.toObject() : setting.sla) : {};
    setting.sla = {
      critical: { ...currentSla.critical, ...(payload.sla.critical || {}) },
      high: { ...currentSla.high, ...(payload.sla.high || {}) },
      medium: { ...currentSla.medium, ...(payload.sla.medium || {}) },
      low: { ...currentSla.low, ...(payload.sla.low || {}) },
    };
  }
  if (payload.categories && Array.isArray(payload.categories)) {
    setting.categories = payload.categories.map((c) => String(c).trim()).filter(Boolean);
  }
  if (payload.workingHours) {
    const currentWH = setting.workingHours ? (setting.workingHours.toObject ? setting.workingHours.toObject() : setting.workingHours) : {};
    setting.workingHours = { ...currentWH, ...payload.workingHours };
  }
  if (payload.automation) {
    const currentAuto = setting.automation ? (setting.automation.toObject ? setting.automation.toObject() : setting.automation) : {};
    setting.automation = { ...currentAuto, ...payload.automation };
  }

  await setting.save();
  return setting;
};

module.exports = {
  getSettings,
  updateSettings,
};

