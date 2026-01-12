import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Trophy, Medal, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={20} className="text-white" />;
    if (rank === 2) return <Medal size={20} className="text-white" />;
    if (rank === 3) return <Award size={20} className="text-white" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-pixel text-4xl text-white text-glow mb-2" data-testid="leaderboard-title">
            [ HIGH_SCORES.DAT ]
          </h1>
          <p className="font-mono text-sm text-muted uppercase tracking-wider" data-testid="leaderboard-subtitle">
            TOP PIXELATORS WORLDWIDE
          </p>
        </div>

        <div className="border-2 border-white/20 bg-black">
          <div className="border-b-2 border-white/20 bg-secondary p-4">
            <div className="grid grid-cols-6 gap-4 font-mono text-xs uppercase tracking-widest text-white">
              <div className="col-span-1" data-testid="header-rank">RANK</div>
              <div className="col-span-2" data-testid="header-username">USERNAME</div>
              <div className="text-right" data-testid="header-images">IMAGES</div>
              <div className="text-right" data-testid="header-codes">CODES</div>
              <div className="text-right" data-testid="header-score">SCORE</div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <p className="font-mono text-sm text-muted animate-pulse" data-testid="loading-message">
                LOADING DATA...
              </p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-mono text-sm text-muted" data-testid="no-data-message">
                NO PLAYERS YET
              </p>
            </div>
          ) : (
            <div>
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.username}
                  className={`border-b border-white/10 p-4 hover:bg-secondary/50 transition-colors ${
                    index < 3 ? 'bg-secondary/30' : ''
                  }`}
                  data-testid={`leaderboard-row-${index + 1}`}
                >
                  <div className="grid grid-cols-6 gap-4 items-center font-mono text-sm">
                    <div className="col-span-1 flex items-center gap-2" data-testid={`rank-${index + 1}`}>
                      {getRankIcon(index + 1)}
                      <span className={`${
                        index < 3 ? 'text-white font-bold' : 'text-muted'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="col-span-2 text-white" data-testid={`username-${index + 1}`}>
                      {entry.username}
                    </div>
                    <div className="text-right text-muted" data-testid={`images-${index + 1}`}>
                      {entry.images_created}
                    </div>
                    <div className="text-right text-muted" data-testid={`codes-${index + 1}`}>
                      {entry.codes_shared}
                    </div>
                    <div className="text-right text-white font-bold" data-testid={`score-${index + 1}`}>
                      {entry.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 border-2 border-white/20 bg-black p-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-white mb-4" data-testid="scoring-info-title">
            [ SCORING FORMULA ]
          </h2>
          <p className="font-mono text-xs text-muted" data-testid="scoring-formula">
            SCORE = (IMAGES × 10) + (CODES × 20) + (STREAK × 5)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;