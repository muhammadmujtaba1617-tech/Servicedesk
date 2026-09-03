const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDashboardSummary } = require('../src/services/dashboardService');

test('buildDashboardSummary returns the shape expected by the dashboard UI', () => {
  const result = buildDashboardSummary({
    totalTickets: 124,
    openTickets: 32,
    inProgressTickets: 45,
    resolvedTickets: 42,
    closedTickets: 5,
    criticalTickets: 4,
    slaBreaches: 2,
    avgResolutionTime: 3.5,
  });

  assert.equal(result.totalTickets, 124);
  assert.equal(result.openTickets, 32);
  assert.equal(result.inProgressTickets, 45);
  assert.equal(result.resolvedTickets, 42);
  assert.equal(result.closedTickets, 5);
  assert.equal(result.criticalTickets, 4);
  assert.equal(result.slaBreaches, 2);
  assert.equal(result.avgResolutionTime, 3.5);
});
