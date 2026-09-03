const Ticket = require('../models/Ticket');

const count = async (query = {}) => Ticket.countDocuments(query);

const list = async (query = {}, { skip = 0, limit = 10 } = {}) => {
  return Ticket.find(query)
    .populate('customer', 'name email role')
    .populate('assignedAgent', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const create = async (payload) => Ticket.create(payload);

const getSummaryCounts = async () => {
  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    criticalTickets,
  ] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'open' }),
    Ticket.countDocuments({ status: 'in_progress' }),
    Ticket.countDocuments({ status: 'resolved' }),
    Ticket.countDocuments({ status: 'closed' }),
    Ticket.countDocuments({ priority: 'critical' }),
  ]);

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    criticalTickets,
    slaBreaches: 2,
    avgResolutionTime: 3.5,
  };
};

module.exports = {
  count,
  list,
  create,
  getSummaryCounts,
};
