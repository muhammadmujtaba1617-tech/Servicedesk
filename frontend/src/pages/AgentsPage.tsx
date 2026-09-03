import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

interface AgentRow {
  id: string;
  name: string;
  email: string;
  role: 'agent';
}

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await apiClient.get('/api/v1/users?role=agent');
        setAgents((response.data.data.items || []) as AgentRow[]);
      } catch {
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading agents...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Role</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-gray-200">
                  <td className="px-6 py-3 text-sm text-gray-900">{agent.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{agent.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                      {agent.role}
                    </span>
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

export default AgentsPage;
