import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import type { Ticket } from '../types';
import {
  Plus,
  Search,
  Filter,
  X,
  Clock,
  AlertTriangle,
  Tag,
  MessageSquare,
  Lock,
  UserCheck,
  Send,
  Trash2,
  CheckCircle,
  ArrowRight,
  Zap,
  Paperclip,
  Download,
  FileText,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getSocket,
  joinRoleRoom,
  joinUserRoom,
  joinTicketRoom,
  leaveTicketRoom,
} from '../services/socket';

// Legal State Transitions Map matching SRS
const LEGAL_TRANSITIONS: Record<string, string[]> = {
  open: ['triaged'],
  triaged: ['assigned', 'in_progress'],
  assigned: ['in_progress', 'triaged'],
  in_progress: ['waiting_for_customer', 'resolved'],
  waiting_for_customer: ['in_progress', 'resolved'],
  resolved: ['closed', 'in_progress'],
  closed: ['open'],
};

const TicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Live real-time toast state
  const [liveToast, setLiveToast] = useState<{ id: string; message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Attachment upload state
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');

  // Detail Modal Actions State
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [actionError, setActionError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Payment',
    priority: 'medium',
    tags: '',
  });

  const showLiveToast = (message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setLiveToast({ id: Date.now().toString(), message, type });
    setTimeout(() => {
      setLiveToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTickets();
  }, [page, pageSize, searchTerm, filterStatus, filterPriority]);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'agent') {
      fetchAgents();
    }
  }, [user]);

  // Real-time WebSocket Listeners
  useEffect(() => {
    const socket = getSocket();
    if (user) {
      joinRoleRoom(user.role);
      const uid = user.id || (user as any)._id;
      if (uid) joinUserRoom(uid);
    }

    const onTicketCreated = (newTicket: any) => {
      showLiveToast(`⚡ Real-time: New ticket created "${newTicket.title || 'Untitled'}"`, 'info');
      fetchTickets();
    };

    const onTicketUpdated = (updatedTicket: any) => {
      showLiveToast(`🔄 Ticket status updated: "${updatedTicket.title || 'Ticket'}" is now ${String(updatedTicket.status || '').toUpperCase()}`, 'success');
      fetchTickets();
      setSelectedTicket((current: any) => {
        if (current && (current._id === updatedTicket._id || current.id === updatedTicket._id)) {
          return { ...current, ...updatedTicket };
        }
        return current;
      });
    };

    const onCommentAdded = ({ ticketId, comment }: { ticketId: string; comment: any }) => {
      setSelectedTicket((current: any) => {
        if (current && (current._id === ticketId || current.id === ticketId)) {
          // If already in list, do not duplicate
          const existing = current.comments || [];
          if (existing.some((c: any) => (c._id && c._id === comment._id) || (c.id && c.id === comment._id))) {
            return current;
          }
          return {
            ...current,
            comments: [...existing, comment],
          };
        }
        return current;
      });
    };

    const onTicketAssigned = ({ ticket }: { ticketId: string; ticket: any }) => {
      showLiveToast(`🎯 Ticket assigned: "${ticket?.title || 'Ticket'}"`, 'info');
      fetchTickets();
    };

    socket.on('ticket:created', onTicketCreated);
    socket.on('ticket:updated', onTicketUpdated);
    socket.on('comment:added', onCommentAdded);
    socket.on('ticket:assigned', onTicketAssigned);

    return () => {
      socket.off('ticket:created', onTicketCreated);
      socket.off('ticket:updated', onTicketUpdated);
      socket.off('comment:added', onCommentAdded);
      socket.off('ticket:assigned', onTicketAssigned);
    };
  }, [user]);

  // Track room when viewing a specific ticket
  useEffect(() => {
    if (selectedTicket) {
      const tid = selectedTicket._id || selectedTicket.id;
      if (tid) joinTicketRoom(tid);
      return () => {
        if (tid) leaveTicketRoom(tid);
      };
    }
  }, [selectedTicket]);

  const fetchAgents = async () => {
    try {
      const response = await apiClient.get('/api/v1/users?role=agent');
      const items = response.data?.data?.items || response.data?.data || [];
      setAgentsList(Array.isArray(items) ? items : []);
    } catch {
      setAgentsList([]);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);

      const response = await apiClient.get<any>(
        `/api/v1/tickets?${params.toString()}`
      );
      
      const items = response.data?.data?.items || response.data?.items || response.data?.data || [];
      const totalCount = response.data?.data?.total ?? response.data?.total ?? (Array.isArray(items) ? items.length : 0);
      
      setTickets(Array.isArray(items) ? items : []);
      setTotal(typeof totalCount === 'number' ? totalCount : 0);
      setError('');
    } catch (err) {
      setError('Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      await apiClient.post('/api/v1/tickets', payload);
      
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Payment',
        priority: 'medium',
        tags: '',
      });

      if (searchParams.get('action') === 'create') {
        searchParams.delete('action');
        setSearchParams(searchParams);
      }

      fetchTickets();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create ticket. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!selectedTicket) return;
    setStatusUpdating(true);
    setActionError('');

    try {
      const ticketId = selectedTicket.id || selectedTicket._id;
      const response = await apiClient.patch(`/api/v1/tickets/${ticketId}/status`, {
        status: newStatus,
      });

      const updated = response.data?.data;
      setSelectedTicket((prev: any) => ({ ...prev, ...updated, status: newStatus }));
      fetchTickets();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || err.response?.data?.message || 'Invalid status transition');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!selectedTicket) return;
    setAssigning(true);
    setActionError('');

    try {
      const ticketId = selectedTicket.id || selectedTicket._id;
      const response = await apiClient.post(`/api/v1/tickets/${ticketId}/assign`, { agentId });
      const updated = response.data?.data;
      setSelectedTicket((prev: any) => ({
        ...prev,
        ...updated,
        assignedAgent: agentsList.find((a) => (a.id || a._id) === agentId) || prev.assignedAgent,
      }));
      fetchTickets();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newComment.trim()) return;
    setCommentSubmitting(true);
    setActionError('');

    try {
      const ticketId = selectedTicket.id || selectedTicket._id;
      const response = await apiClient.post(`/api/v1/tickets/${ticketId}/comments`, {
        content: newComment.trim(),
        isInternal: isInternalNote,
      });

      const addedComment = response.data?.data;
      setSelectedTicket((prev: any) => ({
        ...prev,
        comments: [...(prev.comments || []), addedComment],
      }));
      setNewComment('');
      setIsInternalNote(false);
      fetchTickets();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTicket) return;
    setIsUploadingAttachment(true);
    setAttachmentError('');

    try {
      const ticketId = selectedTicket.id || selectedTicket._id;
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await apiClient.post(`/api/v1/tickets/${ticketId}/attachments`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedTicket = response.data?.ticket;
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      } else if (response.data?.data) {
        setSelectedTicket((prev: any) => ({
          ...prev,
          attachments: [...(prev.attachments || []), response.data.data],
        }));
      }
      showLiveToast(`📎 File "${file.name}" uploaded successfully!`, 'success');
      fetchTickets();
    } catch (err: any) {
      setAttachmentError(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setIsUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!selectedTicket || !window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const ticketId = selectedTicket.id || selectedTicket._id;
      const response = await apiClient.delete(`/api/v1/tickets/${ticketId}/attachments/${attachmentId}`);
      if (response.data?.data) {
        setSelectedTicket(response.data.data);
      } else {
        setSelectedTicket((prev: any) => ({
          ...prev,
          attachments: (prev.attachments || []).filter((a: any) => a._id !== attachmentId),
        }));
      }
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete attachment');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await apiClient.delete(`/api/v1/tickets/${ticketId}`);
      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const calculateSLAStatus = (ticket: any) => {
    if (!ticket?.dueSLA) return null;
    const isCompleted = ticket.status === 'resolved' || ticket.status === 'closed';
    if (isCompleted) {
      return { breached: false, label: 'Resolved', color: 'text-green-600 bg-green-50' };
    }

    const due = new Date(ticket.dueSLA).getTime();
    const now = Date.now();
    const diffMs = due - now;

    if (diffMs <= 0) {
      return { breached: true, label: 'SLA Breached', color: 'text-red-700 bg-red-100 font-bold animate-pulse' };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      breached: false,
      label: `${diffHours}h ${diffMins}m remaining`,
      color: diffHours < 2 ? 'text-orange-700 bg-orange-100' : 'text-blue-700 bg-blue-50',
    };
  };

  const getAllowedNextStatuses = (ticket: any) => {
    if (!ticket) return [];
    const current = ticket.status || 'open';
    const nextList = LEGAL_TRANSITIONS[current] || [];

    if (user?.role === 'customer') {
      // Customers can close if resolved
      return nextList.filter((s) => s === 'closed' || (s === 'in_progress' && current === 'waiting_for_customer'));
    }

    return nextList;
  };

  const totalPages = Math.ceil(total / pageSize);
  const statusOptions = ['open', 'triaged', 'assigned', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'];
  const priorityOptions = ['low', 'medium', 'high', 'critical'];
  const categoryOptions = ['Payment', 'Authentication', 'Bug', 'Feature Request', 'Infrastructure', 'Billing', 'General'];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      triaged: 'bg-purple-100 text-purple-800',
      assigned: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      waiting_for_customer: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-200 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 relative">
      {/* Live Real-time Notification Banner */}
      {liveToast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce transition-all">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
            <span className="text-sm font-medium">{liveToast.message}</span>
            <button
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'customer' ? 'My Tickets' : 'Ticket Queue'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === 'customer'
              ? 'Track and respond to your support requests'
              : 'Triage, prioritize, assign, and resolve customer tickets'}
          </p>
        </div>
        {user?.role !== 'agent' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 shadow-sm hover:shadow"
          >
            <Plus className="w-5 h-5" />
            Create Ticket
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              className="input pl-10"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              className="input pl-10"
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="input"
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPage(1);
              }}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 animate-spin" /> Loading tickets...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      ) : (tickets || []).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg font-medium">No tickets found</p>
          <p className="text-gray-400 text-sm mt-1">Get started by creating your first service request</p>
          {user?.role !== 'agent' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Ticket
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">SLA Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket: any, index: number) => {
                  const ticketId = ticket.id || ticket._id || `ticket-${index}`;
                  const sla = calculateSLAStatus(ticket);
                  return (
                    <tr
                      key={ticketId}
                      onClick={() => setSelectedTicket(ticket)}
                      className="border-b border-gray-200 hover:bg-blue-50/60 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">#{String(ticketId).slice(-5)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{ticket.title || 'Untitled'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{ticket.customer?.name || 'Customer'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status || 'open')}`}>
                          {(ticket.status || 'open').replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority || 'medium')}`}>
                          {(ticket.priority || 'medium').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {sla ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sla.color}`}>
                            {sla.label}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ticket.assignedAgent?.name ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                            <UserCheck className="w-3.5 h-3.5" /> {ticket.assignedAgent.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} tickets
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={pageNum === page ? 'btn-primary' : 'btn-secondary'}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">Create New Service Ticket</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (searchParams.get('action')) {
                    searchParams.delete('action');
                    setSearchParams(searchParams);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="label font-medium">Ticket Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment API returning 500 error"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label font-medium">Category *</label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label font-medium">Priority *</label>
                  <select
                    className="input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low (72h SLA)</option>
                    <option value="medium">Medium (24h SLA)</option>
                    <option value="high">High (8h SLA)</option>
                    <option value="critical">Critical (4h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label font-medium">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="api, payments, bug"
                  className="input"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div>
                <label className="label font-medium">Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide detailed description of the request or problem..."
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAILS & WORKFLOW DRAWER / MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-6 relative max-h-[92vh] overflow-y-auto">
            {/* Header with Title and Status Badges */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${getPriorityColor(selectedTicket.priority || 'medium')}`}>
                    {selectedTicket.priority || 'medium'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getStatusColor(selectedTicket.status || 'open')}`}>
                    {(selectedTicket.status || 'open').replace(/_/g, ' ')}
                  </span>
                  {calculateSLAStatus(selectedTicket) && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${calculateSLAStatus(selectedTicket)?.color}`}>
                      {calculateSLAStatus(selectedTicket)?.label}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{selectedTicket.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {actionError}
              </div>
            )}

            {/* CONTROLLED STATE MACHINE TRANSITIONS BAR */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-blue-600" /> State Machine Workflow
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Current Status: <strong className="uppercase text-slate-900">{(selectedTicket.status || 'open').replace(/_/g, ' ')}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {getAllowedNextStatuses(selectedTicket).length > 0 ? (
                  getAllowedNextStatuses(selectedTicket).map((nextStatus) => (
                    <button
                      key={nextStatus}
                      disabled={statusUpdating}
                      onClick={() => handleStatusTransition(nextStatus)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Move to {nextStatus.replace(/_/g, ' ').toUpperCase()}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    {selectedTicket.status === 'closed'
                      ? 'Ticket is closed.'
                      : 'No further status transitions available for your role.'}
                  </span>
                )}
              </div>
            </div>

            {/* Ticket Info & Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</h3>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-500 text-xs block">Category:</span>
                  <span className="font-semibold text-gray-900">{selectedTicket.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Customer:</span>
                  <span className="font-semibold text-gray-900">{selectedTicket.customer?.name || 'Customer'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Created At:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Assigned Agent:</span>
                  {user?.role === 'customer' ? (
                    <span className="font-semibold text-gray-900">{selectedTicket.assignedAgent?.name || 'Unassigned'}</span>
                  ) : (
                    <select
                      disabled={assigning}
                      value={selectedTicket.assignedAgent?._id || selectedTicket.assignedAgent?.id || ''}
                      onChange={(e) => handleAssignAgent(e.target.value)}
                      className="input text-xs py-1 px-1.5 mt-0.5 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {agentsList.map((agent) => (
                        <option key={agent.id || agent._id} value={agent.id || agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-gray-500 font-medium mr-1">Tags:</span>
                  {selectedTicket.tags.map((tag: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ATTACHMENTS SECTION */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600" /> Attachments ({selectedTicket.attachments?.length || 0})
                </h3>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                  <UploadCloud className="w-3.5 h-3.5" />
                  {isUploadingAttachment ? 'Uploading...' : 'Upload File'}
                  <input
                    type="file"
                    disabled={isUploadingAttachment}
                    onChange={handleUploadAttachment}
                    className="hidden"
                  />
                </label>
              </div>

              {attachmentError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  {attachmentError}
                </div>
              )}

              {(selectedTicket.attachments || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No files or screenshots attached.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {selectedTicket.attachments.map((file: any, idx: number) => {
                    const isImg = file.mimetype?.startsWith('image/');
                    const fileUrl = `http://localhost:3000${file.url}`;
                    const sizeKb = Math.round((file.size || 0) / 1024);
                    return (
                      <div
                        key={file._id || file.id || idx}
                        className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold">
                            {isImg ? 'IMG' : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                              title={file.originalName || file.filename}
                            >
                              {file.originalName || file.filename}
                            </a>
                            <span className="text-[11px] text-gray-500">{sizeKb} KB</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Download / View"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          {(user?.role === 'admin' || user?.role === 'agent' || user?.id === file.uploadedBy) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(file._id || file.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete File"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comments & Internal Notes Feed */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" /> Activity & Discussion
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {(selectedTicket.comments || []).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No comments yet.</p>
                ) : (
                  selectedTicket.comments.map((c: any, idx: number) => (
                    <div
                      key={c.id || c._id || idx}
                      className={`p-3 rounded-lg text-sm border ${
                        c.isInternal
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-gray-50 border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-gray-900">
                            {c.author?.name || 'Support Team'}
                          </span>
                          {c.isInternal && (
                            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-800 font-bold text-[10px] uppercase flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Internal Note
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3 pt-2">
                <textarea
                  rows={3}
                  required
                  placeholder={
                    isInternalNote
                      ? 'Add internal note visible only to agents and admins...'
                      : 'Type your response to the customer...'
                  }
                  className={`input text-sm ${isInternalNote ? 'border-amber-400 focus:ring-amber-400' : ''}`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />

                <div className="flex justify-between items-center">
                  {user?.role !== 'customer' ? (
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="flex items-center gap-1 text-amber-800">
                        <Lock className="w-3.5 h-3.5" /> Post as Private Internal Note
                      </span>
                    </label>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> {commentSubmitting ? 'Posting...' : 'Post Message'}
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              {user?.role === 'admin' ? (
                <button
                  type="button"
                  onClick={() => handleDeleteTicket(selectedTicket.id || selectedTicket._id)}
                  className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Ticket
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="btn-secondary text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;


