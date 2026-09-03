const ticketService = require('../services/ticketService');
const auditService = require('../services/auditService');
const Ticket = require('../models/Ticket');
const {
  emitTicketCreated,
  emitTicketUpdated,
  emitCommentAdded,
  emitTicketAssigned,
} = require('../config/socket');

const listTickets = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', status = '', priority = '' } = req.query;
    const result = await ticketService.listTickets({
      user: req.user,
      page,
      pageSize,
      search,
      status,
      priority,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to fetch tickets' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    return res.json({ success: true, data: ticket });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to fetch ticket' });
  }
};

const createTicket = async (req, res) => {
  try {
    const ticket = await ticketService.createTicket({
      user: req.user,
      ...req.body,
    });

    await auditService.logAudit({
      actor: req.user._id,
      action: 'create_ticket',
      entity: 'Ticket',
      entityId: ticket._id.toString(),
      newValue: { title: ticket.title, priority: ticket.priority, category: ticket.category },
      metadata: { createdByRole: req.user.role },
    });

    // Real-time notification broadcast
    emitTicketCreated(ticket);

    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to create ticket' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, assignedAgent, priority } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const updated = ticketService.updateTicketStatus({
      ticket: ticket.toObject ? ticket.toObject() : ticket,
      newStatus: status,
      assignedAgent,
      priority,
      actorRole: req.user.role,
    });

    const savedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        status: updated.status,
        assignedAgent: updated.assignedAgent,
        priority: updated.priority,
      },
      { new: true }
    ).populate('customer', 'name email role').populate('assignedAgent', 'name email role');

    await auditService.logAudit({
      actor: req.user._id,
      action: 'update_status',
      entity: 'Ticket',
      entityId: req.params.id,
      oldValue: { status: ticket.status, assignedAgent: ticket.assignedAgent, priority: ticket.priority },
      newValue: { status: savedTicket.status, assignedAgent: savedTicket.assignedAgent, priority: savedTicket.priority },
      metadata: { updatedByRole: req.user.role },
    });

    // Real-time broadcast
    emitTicketUpdated(savedTicket);

    return res.json({ success: true, data: savedTicket });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_STATUS_FAILED',
        message: error.message || 'Unable to update ticket status',
      },
      message: error.message,
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { content, isInternal } = req.body;
    const comment = await ticketService.addComment({
      ticketId: req.params.id,
      user: req.user,
      content,
      isInternal,
    });

    await auditService.logAudit({
      actor: req.user._id,
      action: isInternal ? 'add_internal_note' : 'add_comment',
      entity: 'Ticket',
      entityId: req.params.id,
      newValue: { isInternal },
      metadata: { authorRole: req.user.role },
    });

    // Real-time broadcast
    emitCommentAdded(req.params.id, comment);

    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to add comment' });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await ticketService.assignTicket({
      ticketId: req.params.id,
      agentId,
      user: req.user,
    });

    await auditService.logAudit({
      actor: req.user._id,
      action: 'assign_ticket',
      entity: 'Ticket',
      entityId: req.params.id,
      newValue: { assignedAgent: agentId },
      metadata: { assignedByRole: req.user.role },
    });

    // Real-time broadcast
    emitTicketAssigned(ticket, agentId);

    return res.json({ success: true, data: ticket });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to assign ticket' });
  }
};

const deleteTicket = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can delete tickets' });
    }

    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await auditService.logAudit({
      actor: req.user._id,
      action: 'delete_ticket',
      entity: 'Ticket',
      entityId: req.params.id,
      metadata: { deletedByRole: req.user.role },
    });

    return res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to delete ticket' });
  }
};

const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const newAttachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    };

    ticket.attachments.push(newAttachment);
    await ticket.save();

    const populated = await Ticket.findById(req.params.id)
      .populate('customer', 'name email role')
      .populate('assignedAgent', 'name email role')
      .populate('attachments.uploadedBy', 'name email role');

    await auditService.logAudit({
      actor: req.user._id,
      action: 'upload_attachment',
      entity: 'Ticket',
      entityId: req.params.id,
      newValue: { filename: req.file.originalname, size: req.file.size },
      metadata: { uploadedByRole: req.user.role },
    });

    emitTicketUpdated(populated);

    const savedAttachment = populated.attachments[populated.attachments.length - 1];
    return res.status(201).json({ success: true, data: savedAttachment, ticket: populated });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to upload attachment' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const attachmentIndex = ticket.attachments.findIndex(
      (a) => a._id.toString() === req.params.attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    const attachment = ticket.attachments[attachmentIndex];
    ticket.attachments.splice(attachmentIndex, 1);
    await ticket.save();

    // Clean up file on disk
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../uploads', attachment.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsErr) {
      console.warn('Could not remove file from disk:', fsErr.message);
    }

    const populated = await Ticket.findById(req.params.id)
      .populate('customer', 'name email role')
      .populate('assignedAgent', 'name email role');

    emitTicketUpdated(populated);

    return res.json({ success: true, message: 'Attachment deleted', data: populated });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to delete attachment' });
  }
};

const getSummary = async (req, res) => {
  try {
    const summary = await ticketService.getDashboardSummary(req.user);
    return res.json({ success: true, data: summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard summary' });
  }
};

module.exports = {
  listTickets,
  getTicketById,
  createTicket,
  updateStatus,
  addComment,
  assignTicket,
  deleteTicket,
  uploadAttachment,
  deleteAttachment,
  getSummary,
};


