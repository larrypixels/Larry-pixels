import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { UserPlus, LogIn, Twitter, MessageCircle, AlertTriangle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [discordHandle, setDiscordHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { username, password });
      login(response.data.user);
      toast.success('Login successful');
      navigate('/studio');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/signup`, { 
        username, 
        discord_handle: discordHandle,
        password 
      });
      login(response.data.user);
      toast.success('Account created successfully');
      navigate('/studio');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4 flicker-animation">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1758573466985-afab16774425?crop=entropy&cs=srgb&fm=jpg&q=85)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="border-2 border-white bg-black p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
          <div className="mb-8">
            <h1 className="font-pixel text-3xl text-white text-glow mb-2" data-testid="auth-title">
              [ USER_AUTH.EXE ]
            </h1>
            <p className="font-mono text-xs text-muted uppercase tracking-wider" data-testid="auth-subtitle">
              SYSTEM AUTHENTICATION REQUIRED
            </p>
          </div>

          {/* Social Links Section */}
          <div className="mb-6 border border-white/20 bg-secondary p-4">
            <p className="font-mono text-xs text-white uppercase mb-3" data-testid="need-code-text">
              NEED AN ACCESS CODE?
            </p>
            <div className="space-y-2">
              <a
                href="https://twitter.com/larrynfts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-xs text-muted hover:text-white transition-colors"
                data-testid="twitter-link"
              >
                <Twitter size={14} />
                <span>FOLLOW @LARRYNFTS ON X</span>
              </a>
              <a
                href="https://discord.gg/m4cA8sfMP"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-xs text-muted hover:text-white transition-colors"
                data-testid="discord-link"
              >
                <MessageCircle size={14} />
                <span>JOIN DISCORD COMMUNITY</span>
              </a>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-none border-2 font-mono text-xs uppercase tracking-widest py-2 transition-all ${
                mode === 'login'
                  ? 'border-white bg-white text-black'
                  : 'border-white/20 bg-black text-white hover:border-white'
              }`}
              data-testid="login-tab-button"
            >
              <LogIn size={14} className="inline mr-2" />
              LOGIN
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-none border-2 font-mono text-xs uppercase tracking-widest py-2 transition-all ${
                mode === 'signup'
                  ? 'border-white bg-white text-black'
                  : 'border-white/20 bg-black text-white hover:border-white'
              }`}
              data-testid="signup-tab-button"
            >
              <UserPlus size={14} className="inline mr-2" />
              SIGNUP
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-white mb-2" data-testid="login-username-label">
                  USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-white rounded-none font-mono text-white placeholder:text-white/30 focus:ring-0 focus:outline-none py-2"
                  placeholder="Enter username"
                  required
                  data-testid="login-username-input"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-white mb-2" data-testid="login-password-label">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-white rounded-none font-mono text-white placeholder:text-white/30 focus:ring-0 focus:outline-none py-2"
                  placeholder="Enter password"
                  required
                  data-testid="login-password-input"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono uppercase tracking-widest py-3 disabled:opacity-50"
                data-testid="login-submit-button"
              >
                {loading ? 'AUTHENTICATING...' : 'LOGIN'}
              </button>
            </form>
          ) : (
            <>
              {/* Warning Banner */}
              <div className="mb-6 border-2 border-white bg-secondary p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-white flex-shrink-0 mt-1" />
                  <div className="font-mono text-xs text-white">
                    <p className="uppercase font-bold mb-2" data-testid="warning-title">⚠ IMPORTANT WARNING</p>
                    <p className="mb-2" data-testid="warning-text-1">
                      Please register carefully with a suitable username and strong password.
                    </p>
                    <p className="text-muted" data-testid="warning-text-2">
                      Once entered, credentials CANNOT be changed. Choose wisely!
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-white mb-2" data-testid="signup-username-label">
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white/20 focus:border-white rounded-none font-mono text-white placeholder:text-white/30 focus:ring-0 focus:outline-none py-2"
                    placeholder="Choose username"
                    required
                    minLength={3}
                    data-testid="signup-username-input"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-white mb-2" data-testid="signup-discord-label">
                    DISCORD HANDLE
                  </label>
                  <input
                    type="text"
                    value={discordHandle}
                    onChange={(e) => setDiscordHandle(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white/20 focus:border-white rounded-none font-mono text-white placeholder:text-white/30 focus:ring-0 focus:outline-none py-2"
                    placeholder="username#0000"
                    required
                    data-testid="signup-discord-input"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-white mb-2" data-testid="signup-password-label">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white/20 focus:border-white rounded-none font-mono text-white placeholder:text-white/30 focus:ring-0 focus:outline-none py-2"
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    data-testid="signup-password-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono uppercase tracking-widest py-3 disabled:opacity-50"
                  data-testid="signup-submit-button"
                >
                  {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;