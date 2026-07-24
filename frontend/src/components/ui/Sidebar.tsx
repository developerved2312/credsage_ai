import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '@lib/auth.client';
import {
  LayoutDashboard,
  CreditCard,
  LineChart,
  Star,
  Briefcase,
  MessageSquare,
  LogOut,
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/credit', label: 'Credit Score', icon: CreditCard },
  { to: '/investment/risk-profile', label: 'Risk Profile', icon: Star },
  { to: '/investment/recommendations', label: 'Recommendations', icon: LineChart },
  { to: '/investment/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/chatbot', label: 'AI Advisor', icon: MessageSquare },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface border-r border-border-color min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-color">
        <span className="text-lg font-semibold text-primary tracking-tight">CredSage AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border-color">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-text-secondary hover:text-risk-high hover:bg-red-50"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
