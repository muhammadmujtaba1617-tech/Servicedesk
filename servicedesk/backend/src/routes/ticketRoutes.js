const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ticketController = require('../controllers/ticketController');

const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/', ticketController.listTickets);
router.post('/', ticketController.createTicket);
router.get('/summary', ticketController.getSummary);
router.get('/:id', ticketController.getTicketById);
router.patch('/:id/status', ticketController.updateStatus);
router.post('/:id/status', ticketController.updateStatus);
router.post('/:id/assign', authorize('admin', 'agent'), ticketController.assignTicket);
router.post('/:id/comments', ticketController.addComment);
router.post('/:id/attachments', upload.single('file'), ticketController.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', ticketController.deleteAttachment);
router.delete('/:id', authorize('admin'), ticketController.deleteTicket);

module.exports = router;


