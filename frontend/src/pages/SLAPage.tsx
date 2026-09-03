import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

interface SLAPolicyMap {
  critical: { responseSLA: number; resolutionSLA: number };
  high: { responseSLA: number; resolutionSLA: number };
  medium: { responseSLA: number; resolutionSLA: number };
  low: { responseSLA: number; resolutionSLA: number };
}

const SLAPage: React.FC = () => {
  const [policies, setPolicies] = useState<SLAPolicyMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSLA = async () => {
      try {
        const response = await apiClient.get('/api/v1/sla');
        setPolicies(response.data.data || null);
      } catch {
        setPolicies({
          critical: { responseSLA: 15, resolutionSLA: 120 },
          high: { responseSLA: 30, resolutionSLA: 180 },
          medium: { responseSLA: 60, resolutionSLA: 240 },
          low: { responseSLA: 120, resolutionSLA: 480 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSLA();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading SLA policies...</div>;
  }

  if (!policies) {
    return <div className="text-center py-8">No SLA data available</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">SLA Information</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Response SLA</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Resolution SLA</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(policies).map(([priority, policy]) => (
              <tr key={priority} className="border-b border-gray-200">
                <td className="px-6 py-3 text-sm text-gray-900 capitalize">{priority}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{policy.responseSLA} min</td>
                <td className="px-6 py-3 text-sm text-gray-600">{policy.resolutionSLA} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SLAPage;
