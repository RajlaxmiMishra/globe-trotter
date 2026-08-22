import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Globe, Map, Plus, Search, BarChart2, User, LogOut, Activity } from 'lucide-react';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: Globe },
  { to: '/trips',      label: 'My Trips',   icon: Map },
  { to: '/trips/new',  label: 'New Trip',   icon: Plus },
  { to: '/cities',     label: 'Cities',     icon: Search },
  { to: '/activities', label: 'Activities', icon: Activity },
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ' +
        (isActive ? 'bg-sky text-white shadow-float' : 'text-white/70 hover:bg-white/10 hover:text-white')
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/auth/login'); };

  return (
    <div className="flex min-h-screen bg-fog">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-ink text-white fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-sky rounded-lg flex items-center justify-center">
            <Globe size={18} className="text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-wide">GlobeTrotter</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => <NavItem key={item.to} {...item} />)}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ' +
                (isActive ? 'bg-sand text-ink shadow-float' : 'text-white/70 hover:bg-white/10 hover:text-white')
              }
            >
              <BarChart2 size={18} />
              Analytics
            </NavLink>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ' +
              (isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white')
            }
          >
            <User size={18} />
            {user?.name ?? 'Profile'}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-rose/20 hover:text-rose transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-ink text-white flex items-center justify-between px-4 py-3 shadow-float">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sky rounded-lg flex items-center justify-center">
            <Globe size={15} />
          </div>
          <span className="font-display font-semibold">GlobeTrotter</span>
        </div>
        <NavLink to="/profile"><User size={20} className="text-white/80" /></NavLink>
      </header>

      {/* Main */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="p-5 md:p-8 pt-16 md:pt-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-ink border-t border-white/10 flex justify-around py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ' +
              (isActive ? 'text-sky' : 'text-white/50')
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
