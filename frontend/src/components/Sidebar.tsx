import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Settings,
  Users,
  BarChart3,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ];

    if (user?.role === 'customer') {
      return [
        ...commonItems,
        { icon: Ticket, label: 'My Tickets', href: '/tickets' },
        { icon: Settings, label: 'Profile', href: '/profile' },
      ];
    }

    if (user?.role === 'agent') {
      return [
        ...commonItems,
        { icon: Ticket, label: 'Ticket Queue', href: '/tickets' },
        { icon: BarChart3, label: 'SLA Info', href: '/sla' },
        { icon: Settings, label: 'Profile', href: '/profile' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { icon: Users, label: 'Users', href: '/users' },
        { icon: Users, label: 'Agents', href: '/agents' },
        { icon: Ticket, label: 'Tickets', href: '/tickets' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics' },
        { icon: FileText, label: 'Audit Logs', href: '/audit-logs' },
        { icon: Settings, label: 'Settings', href: '/settings' },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-gray-900 text-white shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold">ServiceDesk</h2>
        <p className="text-xs text-gray-400 mt-1">Support Management</p>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
