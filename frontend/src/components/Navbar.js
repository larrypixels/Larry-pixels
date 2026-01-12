import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Trophy, ImageIcon, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/studio', label: 'STUDIO', icon: ImageIcon },
    { path: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { path: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
  ];

  return (
    <nav className="border-b-2 border-white/20 bg-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/studio" className="font-pixel text-2xl text-white text-glow" data-testid="navbar-logo">
            LARRYPIXELS
          </Link>
          
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 font-mono text-sm uppercase tracking-wider transition-all ${
                    isActive ? 'text-white text-glow' : 'text-muted hover:text-white'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="flex items-center gap-3 border-l-2 border-white/20 pl-6">
              <div className="flex items-center gap-2 text-muted" data-testid="navbar-username">
                <User size={16} />
                <span className="font-mono text-sm">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-none border-2 border-white bg-black px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-all duration-75 hover:bg-white hover:text-black"
                data-testid="logout-button"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;