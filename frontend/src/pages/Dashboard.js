import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Copy, Check, Share2, ImageIcon, Zap, Flame, ExternalLink, Crown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dailyCode, setDailyCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeAlreadyExists, setCodeAlreadyExists] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/user/profile?username=${user.username}`);
      setProfile(response.data.user);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const generateDailyCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/user/daily-code?username=${user.username}`);
      setDailyCode(response.data.code);
      setCodeAlreadyExists(response.data.already_exists);
      if (!response.data.already_exists) {
        toast.success('Daily code generated!');
        fetchProfile();
      } else {
        toast.info('You already have a code for today');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (dailyCode) {
      navigator.clipboard.writeText(dailyCode);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const score = profile ? 
    (profile.images_created * 10) + (profile.codes_shared * 20) + (profile.streak_days * 5) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-pixel text-4xl text-white text-glow mb-2" data-testid="dashboard-title">
            [ USER_STATS.EXE ]
          </h1>
          <p className="font-mono text-sm text-muted uppercase tracking-wider" data-testid="dashboard-subtitle">
            PERSONAL COMMAND CENTER
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="border-2 border-white/20 bg-black p-6">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon size={20} className="text-white" />
              <span className="font-mono text-xs uppercase text-muted" data-testid="images-label">Images Created</span>
            </div>
            <p className="font-pixel text-3xl text-white text-glow" data-testid="images-count">
              {profile?.images_created || 0}
            </p>
          </div>

          <div className="border-2 border-white/20 bg-black p-6">
            <div className="flex items-center gap-3 mb-2">
              <Share2 size={20} className="text-white" />
              <span className="font-mono text-xs uppercase text-muted" data-testid="codes-label">Codes Shared</span>
            </div>
            <p className="font-pixel text-3xl text-white text-glow" data-testid="codes-count">
              {profile?.codes_shared || 0}
            </p>
          </div>

          <div className="border-2 border-white/20 bg-black p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame size={20} className="text-white" />
              <span className="font-mono text-xs uppercase text-muted" data-testid="streak-label">Streak Days</span>
            </div>
            <p className="font-pixel text-3xl text-white text-glow" data-testid="streak-count">
              {profile?.streak_days || 0}
            </p>
          </div>

          <div className="border-2 border-white/20 bg-black p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={20} className="text-white" />
              <span className="font-mono text-xs uppercase text-muted" data-testid="score-label">Total Score</span>
            </div>
            <p className="font-pixel text-3xl text-white text-glow" data-testid="total-score">
              {score}
            </p>
          </div>

          <div className={`border-2 bg-black p-6 ${
            (profile?.invited_users_count || 0) >= 10 ? 'border-white' : 'border-white/20'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Share2 size={20} className="text-white" />
              <span className="font-mono text-xs uppercase text-muted" data-testid="invites-label">Users Invited</span>
            </div>
            <p className={`font-pixel text-3xl ${
              (profile?.invited_users_count || 0) >= 10 ? 'text-white text-glow' : 'text-white'
            }`} data-testid="invites-count">
              {profile?.invited_users_count || 0}/10
            </p>
            {(profile?.invited_users_count || 0) >= 10 && (
              <p className="font-mono text-xs text-white mt-2" data-testid="unlimited-badge">
                UNLIMITED UNLOCKED
              </p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Larry Floor Link */}
          <a
            href="https://imbatman-03.github.io/Floor-Larry/"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white/20 bg-black p-6 hover:border-white hover:bg-secondary transition-all duration-300 group"
            data-testid="larry-floor-link"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-sm uppercase tracking-widest text-white group-hover:text-glow transition-all" data-testid="larry-floor-title">
                [ LARRY FLOOR ]
              </h2>
              <ExternalLink size={20} className="text-white group-hover:text-glow transition-all" />
            </div>
            
            <p className="font-mono text-xs text-muted group-hover:text-white transition-all" data-testid="larry-floor-description">
              Want to see what Larry is? Check it out!
            </p>
          </a>

          <div className="border-2 border-white/20 bg-black p-6">
            <h2 className="font-mono text-sm uppercase tracking-widest text-white mb-4" data-testid="daily-code-title">
              [ DAILY SHARE CODE ]
            </h2>
            
            <p className="font-mono text-xs text-muted mb-6" data-testid="daily-code-description">
              Generate a 6-digit code once per day to share with friends. Each code can be used by one person.
            </p>

            {!dailyCode ? (
              <button
                onClick={generateDailyCode}
                disabled={loading}
                className="w-full rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono uppercase tracking-widest py-3 disabled:opacity-50"
                data-testid="generate-code-button"
              >
                {loading ? 'GENERATING...' : 'GENERATE CODE'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="border border-white/20 bg-secondary p-4 flex items-center justify-between">
                  <span className="font-mono text-2xl tracking-[0.3em] text-white" data-testid="generated-code">
                    {dailyCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 p-2"
                    data-testid="copy-code-button"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {codeAlreadyExists && (
                  <p className="font-mono text-xs text-muted" data-testid="code-exists-message">
                    This is your code for today. Come back in 24 hours to generate a new one.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* NFT Holder Benefits Section */}
        <div className="mt-6 border-2 border-white bg-black p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown size={24} className="text-white" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-white text-glow" data-testid="holder-benefits-title">
              [ LARRY NFT HOLDER BENEFITS ]
            </h2>
          </div>
          <div className="space-y-2 font-mono text-xs text-white">
            <p data-testid="holder-benefit-1">✓ FULL ACCESS TO ALL FEATURES</p>
            <p data-testid="holder-benefit-2">✓ UNLIMITED IMAGE CREATION (NO DAILY LIMITS)</p>
            <p data-testid="holder-benefit-3">✓ NO WATERMARK ON GENERATED IMAGES</p>
            <p data-testid="holder-benefit-4">✓ FIRST PRIORITY ACCESS TO NEW FEATURES</p>
            <p className="text-muted mt-3" data-testid="holder-note">Holders are our VIP community members with exclusive perks!</p>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div className="border-2 border-white/20 bg-black p-6">
            <h2 className="font-mono text-sm uppercase tracking-widest text-white mb-4" data-testid="profile-title">
              [ PROFILE DATA ]
            </h2>
            
            <div className="space-y-4 font-mono text-sm">
              <div>
                <span className="text-muted uppercase text-xs" data-testid="username-label">USERNAME:</span>
                <p className="text-white" data-testid="username-value">{profile?.username}</p>
              </div>
              <div>
                <span className="text-muted uppercase text-xs" data-testid="discord-label">DISCORD:</span>
                <p className="text-white" data-testid="discord-value">{profile?.discord_handle}</p>
              </div>
              <div>
                <span className="text-muted uppercase text-xs" data-testid="joined-label">JOINED:</span>
                <p className="text-white" data-testid="joined-value">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted uppercase text-xs" data-testid="last-active-label">LAST ACTIVE:</span>
                <p className="text-white" data-testid="last-active-value">
                  {profile?.last_active_date || 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-2 border-white/20 bg-black p-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-white mb-4" data-testid="scoring-title">
            [ SCORING SYSTEM ]
          </h2>
          <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
            <div>
              <p className="text-muted uppercase mb-2">Images Created</p>
              <p className="text-white">+10 points each</p>
            </div>
            <div>
              <p className="text-muted uppercase mb-2">Codes Shared</p>
              <p className="text-white">+20 points each</p>
            </div>
            <div>
              <p className="text-muted uppercase mb-2">Streak Days</p>
              <p className="text-white">+5 points each</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;