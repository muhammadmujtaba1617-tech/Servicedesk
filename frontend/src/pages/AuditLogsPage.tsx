import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt?: string;
  actor?: {
    name?: string;
    email?: string;
  };
}

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get('/api/v1/audit-logs');
        setLogs(response.data.data.items || []);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading audit logs...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200">
                  <td className="px-6 py-3 text-sm text-gray-900">{log.actor?.name || 'System'}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{log.action}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{log.entity}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
