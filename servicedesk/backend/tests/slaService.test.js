const test = require('node:test');
const assert = require('node:assert/strict');

const { buildSLAPolicySummary } = require('../src/services/slaService');

test('buildSLAPolicySummary returns the expected SLA policy metrics', () => {
  const result = buildSLAPolicySummary({
    critical: { responseSLA: 15, resolutionSLA: 120 },
    high: { responseSLA: 30, resolutionSLA: 180 },
    medium: { responseSLA: 60, resolutionSLA: 240 },
    low: { responseSLA: 120, resolutionSLA: 480 },
  });

  assert.equal(result.critical.responseSLA, 15);
  assert.equal(result.high.resolutionSLA, 180);
  assert.equal(result.medium.responseSLA, 60);
  assert.equal(result.low.resolutionSLA, 480);
});
