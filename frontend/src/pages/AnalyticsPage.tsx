import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Clock,
  ShieldCheck,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    criticalTickets: number;
    slaBreaches: number;
    avgResolutionTime: number;
    resolutionRate: number;
    slaComplianceRate: number;
  };
  volumeTrends: Array<{ date: string; created: number; resolved: number }>;
  priorityDistribution: Array<{ priority: string; name: string; count: number }>;
  categoryDistribution: Array<{ category: string; name: string; count: number }>;
  agentPerformance: Array<{
    id: string;
    name: string;
    email: string;
    assigned: number;
    resolved: number;
    active: number;
    resolutionRate: number;
  }>;
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#14b8a6'];

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/v1/analytics?days=${days}`);
      setData(response.data.data || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-500">
          <Clock className="w-6 h-6 animate-spin text-blue-600" />
          <span>Calculating operational analytics...</span>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    criticalTickets: 0,
    slaBreaches: 0,
    avgResolutionTime: 0,
    resolutionRate: 0,
    slaComplianceRate: 100,
  };

  const volumeTrends = data?.volumeTrends || [];
  const priorityDistribution = data?.priorityDistribution || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const agentPerformance = data?.agentPerformance || [];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time SLA performance, ticket resolution metrics, and team workload insights
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <Calendar className="w-4 h-4 text-gray-400 ml-2" />
          {['7', '14', '30', '90'].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                days === d
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Volume</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalTickets}</h3>
            <span className="text-xs text-blue-600 font-medium mt-1 inline-block">
              {summary.openTickets} in active queue
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolution Rate</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.resolutionRate}%</h3>
            <span className="text-xs text-green-600 font-medium mt-1 inline-block">
              {summary.resolvedTickets + summary.closedTickets} tickets resolved
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SLA Compliance</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.slaComplianceRate}%</h3>
            <span className="text-xs text-amber-600 font-medium mt-1 inline-block">
              {summary.slaBreaches} breaches recorded
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Resolution Time</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.avgResolutionTime}h</h3>
            <span className="text-xs text-purple-600 font-medium mt-1 inline-block">
              Under 4h target SLA
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Chart: Ticket Volume Over Time */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ticket Volume & Resolution Trends</h2>
            <p className="text-xs text-gray-500">Daily creation vs resolution rate over the selected period</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="created"
                name="Tickets Created"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#createdGrad)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Tickets Resolved"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#resolvedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts: Priority & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tickets by Priority Tier</h2>
            <p className="text-xs text-gray-500">Distribution across SLA criticality levels</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]}>
                  {priorityDistribution.map((entry) => (
                    <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Donut / Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Category Distribution</h2>
            <p className="text-xs text-gray-500">Proportion of service requests per category</p>
          </div>

          <div className="h-64 w-full">
            {categoryDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Support Agent Performance & Workload Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Support Team Workload & Performance
            </h2>
            <p className="text-xs text-gray-500">Individual agent caseload, resolution rates, and active assignments</p>
          </div>
        </div>

        {agentPerformance.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4 text-center">No agents registered in the system yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Agent</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Assigned</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Resolved</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Active</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Resolution Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agentPerformance.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      {agent.name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{agent.email}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-gray-900">{agent.assigned}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-green-600">{agent.resolved}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-amber-600">{agent.active}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, agent.resolutionRate))}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{agent.resolutionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
