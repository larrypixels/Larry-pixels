import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Lock, Plus, Users, Code, BarChart3, CheckCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const adminAuth = sessionStorage.getItem('larrypixels_admin');
    if (adminAuth === 'true') {
      setAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/admin/login`, { password });
      setAuthenticated(true);
      sessionStorage.setItem('larrypixels_admin', 'true');
      toast.success('Admin access granted');
      fetchData();
    } catch (error) {
      toast.error('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, codesRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/codes`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setCodes(codesRes.data.codes);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const generateCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/generate-code`);
      toast.success(`Code generated: ${response.data.code}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('larrypixels_admin');
    navigate('/');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 flicker-animation">
        <div className="w-full max-w-md">
          <div className="border-2 border-white bg-black p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="mb-8 text-center">
              <div className="mb-2 flex justify-center">
                <Lock size={48} className="text-white" />
              </div>
              <h1 className="font-pixel text-3xl text-white text-glow mb-2" data-testid="admin-login-title">
                [ ADMIN_ROOT ]
              </h1>
              <p className="font-mono text-xs text-muted uppercase tracking-wider" data-testid="admin-login-subtitle">
                SYSTEM ADMINISTRATOR ACCESS
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-white mb-2" data-testid="password-label">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-white rounded-none font-mono text-white placeholder:text-white/30 focus:ring-0 focus:outline-none py-2"
                  placeholder="Enter admin password"
                  required
                  data-testid="admin-password-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono uppercase tracking-widest py-3 disabled:opacity-50"
                data-testid="admin-login-button"
              >
                {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b-2 border-white/20 bg-black">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-pixel text-2xl text-white text-glow" data-testid="admin-nav-title">
            [ ADMIN_PANEL.EXE ]
          </h1>
          <button
            onClick={handleLogout}
            className="rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono text-xs uppercase tracking-widest px-4 py-2"
            data-testid="admin-logout-button"
          >
            LOGOUT
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8">
          {['overview', 'users', 'codes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-none border-2 font-mono text-xs uppercase tracking-widest px-6 py-2 transition-all ${
                activeTab === tab
                  ? 'border-white bg-white text-black'
                  : 'border-white/20 bg-black text-white hover:border-white'
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="border-2 border-white/20 bg-black p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={20} className="text-white" />
                  <span className="font-mono text-xs uppercase text-muted" data-testid="stat-users-label">Total Users</span>
                </div>
                <p className="font-pixel text-3xl text-white text-glow" data-testid="stat-users-value">
                  {stats.total_users}
                </p>
              </div>

              <div className="border-2 border-white/20 bg-black p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Code size={20} className="text-white" />
                  <span className="font-mono text-xs uppercase text-muted" data-testid="stat-codes-label">Total Codes</span>
                </div>
                <p className="font-pixel text-3xl text-white text-glow" data-testid="stat-codes-value">
                  {stats.total_codes}
                </p>
              </div>

              <div className="border-2 border-white/20 bg-black p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={20} className="text-white" />
                  <span className="font-mono text-xs uppercase text-muted" data-testid="stat-used-label">Used Codes</span>
                </div>
                <p className="font-pixel text-3xl text-white text-glow" data-testid="stat-used-value">
                  {stats.used_codes}
                </p>
              </div>

              <div className="border-2 border-white/20 bg-black p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 size={20} className="text-white" />
                  <span className="font-mono text-xs uppercase text-muted" data-testid="stat-images-label">Total Images</span>
                </div>
                <p className="font-pixel text-3xl text-white text-glow" data-testid="stat-images-value">
                  {stats.total_images}
                </p>
              </div>
            </div>

            <div className="border-2 border-white/20 bg-black p-6">
              <h2 className="font-mono text-sm uppercase tracking-widest text-white mb-4" data-testid="actions-title">
                [ QUICK ACTIONS ]
              </h2>
              <button
                onClick={generateCode}
                disabled={loading}
                className="rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono uppercase tracking-widest px-6 py-3 flex items-center gap-2 disabled:opacity-50"
                data-testid="generate-code-action-button"
              >
                <Plus size={16} />
                GENERATE ACCESS CODE
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="border-2 border-white/20 bg-black">
            <div className="border-b-2 border-white/20 bg-secondary p-4">
              <div className="grid grid-cols-5 gap-4 font-mono text-xs uppercase tracking-widest text-white">
                <div data-testid="users-header-username">USERNAME</div>
                <div data-testid="users-header-discord">DISCORD</div>
                <div className="text-right" data-testid="users-header-images">IMAGES</div>
                <div className="text-right" data-testid="users-header-codes">CODES</div>
                <div className="text-right" data-testid="users-header-streak">STREAK</div>
              </div>
            </div>
            {users.map((user, index) => (
              <div key={user.id} className="border-b border-white/10 p-4 hover:bg-secondary/50 transition-colors" data-testid={`user-row-${index}`}>
                <div className="grid grid-cols-5 gap-4 items-center font-mono text-sm">
                  <div className="text-white" data-testid={`user-username-${index}`}>{user.username}</div>
                  <div className="text-muted" data-testid={`user-discord-${index}`}>{user.discord_handle}</div>
                  <div className="text-right text-muted" data-testid={`user-images-${index}`}>{user.images_created}</div>
                  <div className="text-right text-muted" data-testid={`user-codes-${index}`}>{user.codes_shared}</div>
                  <div className="text-right text-muted" data-testid={`user-streak-${index}`}>{user.streak_days}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="border-2 border-white/20 bg-black">
            <div className="border-b-2 border-white/20 bg-secondary p-4">
              <div className="grid grid-cols-4 gap-4 font-mono text-xs uppercase tracking-widest text-white">
                <div data-testid="codes-header-code">CODE</div>
                <div data-testid="codes-header-status">STATUS</div>
                <div data-testid="codes-header-used-by">USED BY</div>
                <div data-testid="codes-header-created">CREATED</div>
              </div>
            </div>
            {codes.map((code, index) => (
              <div key={code.code} className="border-b border-white/10 p-4 hover:bg-secondary/50 transition-colors" data-testid={`code-row-${index}`}>
                <div className="grid grid-cols-4 gap-4 items-center font-mono text-sm">
                  <div className="text-white tracking-wider" data-testid={`code-value-${index}`}>{code.code}</div>
                  <div className="flex items-center gap-2" data-testid={`code-status-${index}`}>
                    {code.is_used ? (
                      <>
                        <XCircle size={14} className="text-destructive" />
                        <span className="text-destructive">USED</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} className="text-white" />
                        <span className="text-white">AVAILABLE</span>
                      </>
                    )}
                  </div>
                  <div className="text-muted" data-testid={`code-used-by-${index}`}>{code.used_by || '-'}</div>
                  <div className="text-muted" data-testid={`code-created-${index}`}>
                    {new Date(code.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;