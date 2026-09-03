const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    sla: {
      critical: {
        responseSLA: { type: Number, default: 15 },
        resolutionSLA: { type: Number, default: 240 },
      },
      high: {
        responseSLA: { type: Number, default: 60 },
        resolutionSLA: { type: Number, default: 480 },
      },
      medium: {
        responseSLA: { type: Number, default: 240 },
        resolutionSLA: { type: Number, default: 1440 },
      },
      low: {
        responseSLA: { type: Number, default: 480 },
        resolutionSLA: { type: Number, default: 4320 },
      },
    },
    categories: {
      type: [String],
      default: ['Payment', 'Authentication', 'Bug', 'Infrastructure', 'Billing', 'Feature Request', 'General'],
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      timezone: { type: String, default: 'UTC' },
      workingDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon - Fri
    },
    automation: {
      autoAssign: { type: Boolean, default: false },
      emailAlerts: { type: Boolean, default: true },
      breachThresholdPercent: { type: Number, default: 80 }, // Notify when 80% SLA elapsed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
