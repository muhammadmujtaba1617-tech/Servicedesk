const ticketRepository = require('../repositories/ticketRepository');
const Ticket = require('../models/Ticket');

// SLA Policies in minutes
const SLA_POLICIES = {
  critical: { responseSLA: 15, resolutionSLA: 240 },      // 15m response, 4h resolution
  high: { responseSLA: 60, resolutionSLA: 480 },          // 1h response, 8h resolution
  medium: { responseSLA: 240, resolutionSLA: 1440 },      // 4h response, 24h resolution
  low: { responseSLA: 480, resolutionSLA: 4320 },         // 8h response, 72h resolution
};

// Legal State Transitions Map
const LEGAL_TRANSITIONS = {
  open: ['triaged'],
  triaged: ['assigned', 'in_progress'],
  assigned: ['in_progress', 'triaged'],
  in_progress: ['waiting_for_customer', 'resolved'],
  waiting_for_customer: ['in_progress', 'resolved'],
  resolved: ['closed', 'in_progress'],
  closed: ['open'], // Reopen by admin
};

const calculateSLADates = (priority = 'medium', fromDate = new Date()) => {
  const policy = SLA_POLICIES[priority.toLowerCase()] || SLA_POLICIES.medium;
  const resolutionDate = new Date(fromDate.getTime() + policy.resolutionSLA * 60 * 1000);
  const responseDeadline = new Date(fromDate.getTime() + policy.responseSLA * 60 * 1000);
  return { dueSLA: resolutionDate, responseDeadline };
};

const listTickets = async ({ user, page = 1, pageSize = 10, search = '', status = '', priority = '' }) => {
  const query = {};

  if (user.role === 'customer') {
    query.customer = user._id;
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(pageSize);
  const [total, items] = await Promise.all([
    ticketRepository.count(query),
    ticketRepository.list(query, { skip, limit: Number(pageSize) }),
  ]);

  // Sanitize internal comments for customer
  const sanitizedItems = items.map((ticket) => {
    const doc = ticket.toObject ? ticket.toObject() : { ...ticket };
    if (user.role === 'customer' && doc.comments) {
      doc.comments = doc.comments.filter((c) => !c.isInternal);
    }
    return doc;
  });

  return {
    items: sanitizedItems,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages: Math.ceil(total / Number(pageSize)) || 1,
  };
};

const getTicketById = async (ticketId, user) => {
  const ticket = await Ticket.findById(ticketId)
    .populate('customer', 'name email role')
    .populate('assignedAgent', 'name email role')
    .populate('comments.author', 'name email role');

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'customer' && ticket.customer._id.toString() !== user._id.toString()) {
    const error = new Error('Unauthorized to view this ticket');
    error.statusCode = 403;
    throw error;
  }

  const doc = ticket.toObject();
  if (user.role === 'customer' && doc.comments) {
    doc.comments = doc.comments.filter((c) => !c.isInternal);
  }

  return doc;
};

const createTicket = async ({ user, title, description, category, priority = 'medium', tags }) => {
  if (!title || !description || !category) {
    const error = new Error('Title, description and category are required');
    error.statusCode = 400;
    throw error;
  }

  const { dueSLA } = calculateSLADates(priority);

  const ticket = await ticketRepository.create({
    title,
    description,
    category,
    priority: priority || 'medium',
    customer: user._id,
    dueSLA,
    tags: tags || [],
    status: 'open',
  });

  return ticket;
};

const updateTicketStatus = ({ ticket, newStatus, assignedAgent = null, priority = ticket.priority, actorRole = 'agent' }) => {
  const currentStatus = ticket.status || 'open';

  if (currentStatus === newStatus) {
    return {
      ...ticket,
      priority,
      assignedAgent: assignedAgent || ticket.assignedAgent,
    };
  }

  // Check role restrictions
  if (actorRole === 'customer') {
    // Customer can only close a resolved ticket or reopen
    if (newStatus === 'closed' && currentStatus === 'resolved') {
      return { ...ticket, status: 'closed' };
    }
    if (newStatus === 'in_progress' && currentStatus === 'waiting_for_customer') {
      return { ...ticket, status: 'in_progress' };
    }
    const error = new Error(`Customers cannot transition tickets from ${currentStatus.toUpperCase()} to ${newStatus.toUpperCase()}`);
    error.statusCode = 400;
    error.code = 'INVALID_STATUS_TRANSITION';
    throw error;
  }

  const allowedNext = LEGAL_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    const error = new Error(`Cannot transition ticket from ${currentStatus.toUpperCase()} directly to ${newStatus.toUpperCase()}. Allowed transitions: ${allowedNext.join(', ').toUpperCase()}`);
    error.statusCode = 400;
    error.code = 'INVALID_STATUS_TRANSITION';
    throw error;
  }

  return {
    ...ticket,
    status: newStatus,
    priority,
    assignedAgent: assignedAgent || ticket.assignedAgent,
  };
};

const addComment = async ({ ticketId, user, content, isInternal = false }) => {
  if (!content || !content.trim()) {
    const error = new Error('Comment content is required');
    error.statusCode = 400;
    throw error;
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'customer') {
    if (ticket.customer.toString() !== user._id.toString()) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }
    isInternal = false; // Customers cannot create internal notes
  }

  ticket.comments.push({
    author: user._id,
    content: content.trim(),
    isInternal: Boolean(isInternal),
  });

  // If customer responds when waiting for customer, move to in_progress
  if (user.role === 'customer' && ticket.status === 'waiting_for_customer') {
    ticket.status = 'in_progress';
  }

  await ticket.save();

  const populated = await Ticket.findById(ticketId)
    .populate('comments.author', 'name email role');
  
  return populated.comments[populated.comments.length - 1];
};

const assignTicket = async ({ ticketId, agentId, user }) => {
  if (user.role === 'customer') {
    const error = new Error('Customers cannot assign tickets');
    error.statusCode = 403;
    throw error;
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  ticket.assignedAgent = agentId;
  if (ticket.status === 'open' || ticket.status === 'triaged') {
    ticket.status = 'assigned';
  }

  await ticket.save();
  return Ticket.findById(ticketId).populate('assignedAgent', 'name email role');
};

const getDashboardSummary = async (user) => {
  const query = {};
  if (user && user.role === 'customer') {
    query.customer = user._id;
  }

  const now = new Date();
  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    criticalTickets,
    slaBreaches,
  ] = await Promise.all([
    Ticket.countDocuments(query),
    Ticket.countDocuments({ ...query, status: 'open' }),
    Ticket.countDocuments({ ...query, status: 'in_progress' }),
    Ticket.countDocuments({ ...query, status: 'resolved' }),
    Ticket.countDocuments({ ...query, status: 'closed' }),
    Ticket.countDocuments({ ...query, priority: 'critical' }),
    Ticket.countDocuments({
      ...query,
      dueSLA: { $lt: now },
      status: { $nin: ['resolved', 'closed'] },
    }),
  ]);

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    criticalTickets,
    slaBreaches,
    avgResolutionTime: 3.5,
  };
};

module.exports = {
  SLA_POLICIES,
  LEGAL_TRANSITIONS,
  calculateSLADates,
  listTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  addComment,
  assignTicket,
  getDashboardSummary,
};

