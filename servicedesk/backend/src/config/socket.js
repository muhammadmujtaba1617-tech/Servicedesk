const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join:ticket', (ticketId) => {
      if (ticketId) socket.join(`ticket:${ticketId}`);
    });

    socket.on('leave:ticket', (ticketId) => {
      if (ticketId) socket.leave(`ticket:${ticketId}`);
    });

    socket.on('join:role', (role) => {
      if (role) socket.join(`role:${role}`);
    });

    socket.on('join:user', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });

  return io;
};

const getIO = () => io;

const emitTicketCreated = (ticket) => {
  if (!io) return;
  io.to('role:agent').to('role:admin').emit('ticket:created', ticket);
  const custId = ticket.customer?._id || ticket.customer;
  if (custId) io.to(`user:${custId}`).emit('ticket:created', ticket);
};

const emitTicketUpdated = (ticket) => {
  if (!io) return;
  const ticketId = ticket._id || ticket.id;
  io.to(`ticket:${ticketId}`).emit('ticket:updated', ticket);
  io.to('role:agent').to('role:admin').emit('ticket:updated', ticket);
  const custId = ticket.customer?._id || ticket.customer;
  if (custId) io.to(`user:${custId}`).emit('ticket:updated', ticket);
};

const emitCommentAdded = (ticketId, comment) => {
  if (!io) return;
  io.to(`ticket:${ticketId}`).emit('comment:added', { ticketId, comment });
  io.to('role:agent').to('role:admin').emit('comment:added', { ticketId, comment });
};

const emitTicketAssigned = (ticket, agentId) => {
  if (!io) return;
  const ticketId = ticket._id || ticket.id;
  io.to(`user:${agentId}`).emit('ticket:assigned', { ticketId, ticket });
  emitTicketUpdated(ticket);
};

module.exports = {
  initSocket,
  getIO,
  emitTicketCreated,
  emitTicketUpdated,
  emitCommentAdded,
  emitTicketAssigned,
};
