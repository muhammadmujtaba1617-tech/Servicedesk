const ticketRepository = require('../repositories/ticketRepository');

const buildDashboardSummary = (metrics) => ({
  ...metrics,
});

const getDashboardSummary = async () => {
  const metrics = await ticketRepository.getSummaryCounts();
  return buildDashboardSummary(metrics);
};

module.exports = {
  buildDashboardSummary,
  getDashboardSummary,
};
