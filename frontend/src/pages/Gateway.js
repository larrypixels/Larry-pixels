import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Gateway = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { codeVerified, verifyCode } = useAuth();

  React.useEffect(() => {
    if (codeVerified) {
      navigate('/auth');
    }
  }, [codeVerified, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Code must be 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/verify-code`, { code: code.toUpperCase() });
      verifyCode();
      toast.success('Access granted');
      navigate('/auth');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4 flicker-animation">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'url(https://images.pexels.com/photos/978487/pexels-photo-978487.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="border-2 border-white bg-black p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
          <div className="mb-8 text-center">
            <div className="mb-2 flex justify-center" data-testid="gateway-lock-icon">
              <Lock size={48} className="text-white" />
            </div>
            <h1 className="font-pixel text-4xl text-white text-glow mb-4" data-testid="gateway-title">
              LARRYPIXELS
            </h1>
            <p className="font-mono text-sm text-muted uppercase tracking-wider" data-testid="gateway-subtitle">
              RESTRICTED ACCESS ZONE
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-white mb-2" data-testid="code-label">
                [ ENTER 6-DIGIT CODE ]
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-transparent border-b-2 border-white/20 focus:border-white rounded-none font-mono text-2xl tracking-[0.5em] text-white placeholder:text-white/30 focus:ring-0 focus:outline-none py-3 px-2"
                placeholder="______"
                disabled={loading}
                data-testid="code-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono uppercase tracking-widest py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="gateway-submit-button"
            >
              {loading ? 'VERIFYING...' : 'ACCESS SYSTEM'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-white/10">
            <p className="font-mono text-xs text-muted text-center" data-testid="gateway-footer">
              AUTHORIZED PERSONNEL ONLY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gateway;