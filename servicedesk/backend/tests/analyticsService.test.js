const test = require('node:test');
const assert = require('node:assert/strict');

const { buildAnalyticsSummary } = require('../src/services/analyticsService');

test('buildAnalyticsSummary returns normalized analytics values for the admin dashboard', () => {
  const result = buildAnalyticsSummary({
    totalTickets: 100,
    openTickets: 20,
    inProgressTickets: 15,
    resolvedTickets: 35,
    closedTickets: 30,
    criticalTickets: 8,
    slaBreaches: 3,
    avgResolutionTime: 4.2,
  });

  assert.equal(result.totalTickets, 100);
  assert.equal(result.openTickets, 20);
  assert.equal(result.inProgressTickets, 15);
  assert.equal(result.resolvedTickets, 35);
  assert.equal(result.closedTickets, 30);
  assert.equal(result.criticalTickets, 8);
  assert.equal(result.slaBreaches, 3);
  assert.equal(result.avgResolutionTime, 4.2);
});
