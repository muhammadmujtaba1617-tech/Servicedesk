import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import {
  Settings,
  Clock,
  Tag,
  Sliders,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Globe,
} from 'lucide-react';

interface SettingsData {
  sla: {
    critical: { responseSLA: number; resolutionSLA: number };
    high: { responseSLA: number; resolutionSLA: number };
    medium: { responseSLA: number; resolutionSLA: number };
    low: { responseSLA: number; resolutionSLA: number };
  };
  categories: string[];
  workingHours: {
    start: string;
    end: string;
    timezone: string;
    workingDays: number[];
  };
  automation: {
    autoAssign: boolean;
    emailAlerts: boolean;
    breachThresholdPercent: number;
  };
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sla' | 'categories' | 'hours' | 'automation'>('sla');
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/v1/settings');
      setSettings(response.data.data);
    } catch {
      // Fallback defaults
      setSettings({
        sla: {
          critical: { responseSLA: 15, resolutionSLA: 240 },
          high: { responseSLA: 60, resolutionSLA: 480 },
          medium: { responseSLA: 240, resolutionSLA: 1440 },
          low: { responseSLA: 480, resolutionSLA: 4320 },
        },
        categories: ['Payment', 'Authentication', 'Bug', 'Infrastructure', 'Billing', 'Feature Request', 'General'],
        workingHours: {
          start: '09:00',
          end: '18:00',
          timezone: 'UTC',
          workingDays: [1, 2, 3, 4, 5],
        },
        automation: {
          autoAssign: false,
          emailAlerts: true,
          breachThresholdPercent: 80,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const response = await apiClient.patch('/api/v1/settings', settings);
      setSettings(response.data.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim() || !settings) return;
    if (settings.categories.includes(newCategory.trim())) {
      alert('Category already exists');
      return;
    }
    setSettings({
      ...settings,
      categories: [...settings.categories, newCategory.trim()],
    });
    setNewCategory('');
  };

  const handleRemoveCategory = (cat: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      categories: settings.categories.filter((c) => c !== cat),
    });
  };

  const toggleDay = (dayNum: number) => {
    if (!settings) return;
    const current = settings.workingHours.workingDays || [];
    const updated = current.includes(dayNum)
      ? current.filter((d) => d !== dayNum)
      : [...current, dayNum].sort();
    setSettings({
      ...settings,
      workingHours: { ...settings.workingHours, workingDays: updated },
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 gap-2">
        <Clock className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading system configuration...</span>
      </div>
    );
  }

  const daysOfWeek = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 0, label: 'Sun' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-blue-600" /> System Settings & Policies
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure SLA response/resolution targets, working hours, and ticket categories
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Settings and operational policies updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'sla'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4" /> SLA Policies
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Tag className="w-4 h-4" /> Categories
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'hours'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" /> Working Hours
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'automation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sliders className="w-4 h-4" /> Automation & Rules
        </button>
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSave} className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-6 space-y-6">
        {/* TAB 1: SLA POLICIES */}
        {activeTab === 'sla' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Service Level Agreement (SLA) Thresholds</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Set first-response deadlines and maximum resolution targets for each priority level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Critical */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                    Critical Tier
                  </span>
                  <span className="text-xs text-red-600 font-medium">High severity</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">First Response (min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input text-sm"
                      value={settings.sla.critical.responseSLA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sla: {
                            ...settings.sla,
                            critical: { ...settings.sla.critical, responseSLA: Number(e.target.value) },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Resolution (min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input text-sm"
                      value={settings.sla.critical.resolutionSLA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sla: {
                            ...settings.sla,
                            critical: { ...settings.sla.critical, resolutionSLA: Number(e.target.value) },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* High */}
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                    High Tier
                  </span>
                  <span className="text-xs text-orange-600 font-medium">Major impact</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">First Response (min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input text-sm"
                      value={settings.sla.high.responseSLA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sla: {
                            ...settings.sla,
                            high: { ...settings.sla.high, responseSLA: Number(e.target.value) },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Resolution (min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input text-sm"
                      value={settings.sla.high.resolutionSLA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sla: {
                            ...settings.sla,
                            high: { ...settings.sla.high, resolutionSLA: Number(e.target.value) },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Medium */}
              <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-yellow-800 bg-yellow-100 px-2.5 py-0.5 rounded-full">
                    Medium Tier
                  </span>
                  <span className="text-xs text-yellow-700 font-medium">Standard request</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">First Response (min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input text-sm"
                      value={settings.sla.medium.responseSLA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sla: {
                            ...settings.sla,
                            medium: { ...settings.sla.medium, responseSLA: Number(e.target.value) },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Resolution (min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input text-sm"
                      value={settings.sla.medium.resolutionSLA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sla: {
                            ...settings.sla,
                            medium: { ...settings.sla.medium, resolutionSLA: Number(e.target.value) },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Low */}
              <div className="p-4 rounded-xl border border-green-200 bg-green-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-green-800 bg-green-100 px-2.5 py-0.5 rounded-full">
                    Low Tier
                  </span>
                  <span className="text-xs text-green-700 font-medium">Minor question</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">First Response (min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input text-sm"
                      value={settings.sla.low.responseSLA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sla: {
                            ...settings.sla,
                            low: { ...settings.sla.low, responseSLA: Number(e.target.value) },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Resolution (min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input text-sm"
                      value={settings.sla.low.resolutionSLA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sla: {
                            ...settings.sla,
                            low: { ...settings.sla.low, resolutionSLA: Number(e.target.value) },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Supported Ticket Categories</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Add or remove categories available in the customer ticket creation form.
              </p>
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="e.g. Security, Database, UI/UX"
                className="input text-sm"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {settings.categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-red-600 p-0.5"
                    title="Remove Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WORKING HOURS */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Operational Hours & Business Shifts</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Define the working schedule used for calculating business-hours SLA time elapsed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Shift Start</label>
                <input
                  type="time"
                  className="input text-sm"
                  value={settings.workingHours.start}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, start: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Shift End</label>
                <input
                  type="time"
                  className="input text-sm"
                  value={settings.workingHours.end}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, end: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Timezone</label>
                <select
                  className="input text-sm"
                  value={settings.workingHours.timezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, timezone: e.target.value },
                    })
                  }
                >
                  <option value="UTC">UTC (Universal)</option>
                  <option value="America/New_York">EST (New York)</option>
                  <option value="America/Los_Angeles">PST (Los Angeles)</option>
                  <option value="Europe/London">GMT (London)</option>
                  <option value="Asia/Karachi">PKT (Karachi)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Active Working Days</label>
              <div className="flex gap-2">
                {daysOfWeek.map((day) => {
                  const isSelected = (settings.workingHours.workingDays || []).includes(day.num);
                  return (
                    <button
                      key={day.num}
                      type="button"
                      onClick={() => toggleDay(day.num)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTOMATION */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Automation & Notification Rules</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure auto-assignment round-robin and breach warning alerts.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                <div>
                  <span className="font-semibold text-sm text-gray-900 block">Automatic Ticket Assignment</span>
                  <span className="text-xs text-gray-500">Automatically assign incoming tickets to least-loaded agent</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.automation.autoAssign}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      automation: { ...settings.automation, autoAssign: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                <div>
                  <span className="font-semibold text-sm text-gray-900 block">SLA Warning Alerts</span>
                  <span className="text-xs text-gray-500">Send notifications when tickets reach breach threshold</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.automation.emailAlerts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      automation: { ...settings.automation, emailAlerts: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5"
                />
              </label>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-900">
                  <span>Breach Warning Alert Threshold</span>
                  <span className="text-blue-600 font-bold">{settings.automation.breachThresholdPercent}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={settings.automation.breachThresholdPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      automation: { ...settings.automation, breachThresholdPercent: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-xs text-gray-500 block">
                  Alert agents when {settings.automation.breachThresholdPercent}% of SLA target time has elapsed.
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
