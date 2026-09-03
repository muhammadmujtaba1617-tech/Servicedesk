const defaultSLAPolicies = {
  critical: { responseSLA: 15, resolutionSLA: 120 },
  high: { responseSLA: 30, resolutionSLA: 180 },
  medium: { responseSLA: 60, resolutionSLA: 240 },
  low: { responseSLA: 120, resolutionSLA: 480 },
};

const buildSLAPolicySummary = (policies = defaultSLAPolicies) => ({
  critical: { ...defaultSLAPolicies.critical, ...(policies.critical || {}) },
  high: { ...defaultSLAPolicies.high, ...(policies.high || {}) },
  medium: { ...defaultSLAPolicies.medium, ...(policies.medium || {}) },
  low: { ...defaultSLAPolicies.low, ...(policies.low || {}) },
});

module.exports = {
  defaultSLAPolicies,
  buildSLAPolicySummary,
};
