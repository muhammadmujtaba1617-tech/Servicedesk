const test = require('node:test');
const assert = require('node:assert/strict');

const { updateTicketStatus } = require('../src/services/ticketService');

test('updateTicketStatus advances a ticket status and preserves assignment metadata', async () => {
  const ticket = {
    _id: 'ticket_1',
    status: 'open',
    assignedAgent: null,
    priority: 'medium',
    customer: 'customer_1',
  };

  const updatedTicket = updateTicketStatus({
    ticket,
    newStatus: 'in_progress',
    assignedAgent: 'agent_1',
    priority: 'high',
    actorRole: 'agent',
  });

  assert.equal(updatedTicket.status, 'in_progress');
  assert.equal(updatedTicket.assignedAgent, 'agent_1');
  assert.equal(updatedTicket.priority, 'high');
});
