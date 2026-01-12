import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Upload, Download, Zap, Sliders, Twitter, Palette, Info } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLOR_PALETTES = {
  none: { name: 'Original', colors: null },
  monochrome: { name: 'Monochrome', colors: [[0, 0, 0], [255, 255, 255]] },
  sepia: { name: 'Sepia', colors: [[44, 34, 20], [255, 228, 181]] },
  green: { name: 'Green CRT', colors: [[0, 32, 0], [0, 255, 0]] },
  blue: { name: 'Blue Terminal', colors: [[0, 0, 32], [0, 200, 255]] },
  red_cyan: { name: 'Red/Cyan 3D', colors: [[255, 0, 0], [0, 255, 255]] },
  purple: { name: 'Purple Haze', colors: [[32, 0, 32], [255, 100, 255]] },
  amber: { name: 'Amber Monitor', colors: [[32, 20, 0], [255, 176, 0]] }
};

const Studio = () => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [colorPalette, setColorPalette] = useState('none');
  const [processing, setProcessing] = useState(false);
  const [dailyStats, setDailyStats] = useState(null);
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/user/profile?username=${user.username}`);
      const userData = response.data.user;
      setDailyStats({
        daily_images_today: userData.daily_images_today || 0,
        has_unlimited: userData.has_unlimited || false,
        invited_users_count: userData.invited_users_count || 0
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        setImage(event.target.result);
        pixelateImage(img, pixelSize, colorPalette);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const applyColorPalette = (ctx, width, height, paletteKey) => {
    const palette = COLOR_PALETTES[paletteKey];
    if (!palette.colors) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const normalized = gray / 255;
      
      const [darkColor, lightColor] = palette.colors;
      data[i] = darkColor[0] + (lightColor[0] - darkColor[0]) * normalized;
      data[i + 1] = darkColor[1] + (lightColor[1] - darkColor[1]) * normalized;
      data[i + 2] = darkColor[2] + (lightColor[2] - darkColor[2]) * normalized;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const sharpenImage = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const weights = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    const src = data.slice();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dstOff = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = Math.min(height - 1, Math.max(0, y + cy - halfSide));
            const scx = Math.min(width - 1, Math.max(0, x + cx - halfSide));
            const srcOff = (scy * width + scx) * 4;
            const wt = weights[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
          }
        }

        data[dstOff] = Math.min(255, Math.max(0, r));
        data[dstOff + 1] = Math.min(255, Math.max(0, g));
        data[dstOff + 2] = Math.min(255, Math.max(0, b));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const pixelateImage = (img, size, palette) => {
    if (!img || !canvasRef.current) return;

    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    const width = canvas.width;
    const height = canvas.height;

    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    const scaledWidth = Math.ceil(width / size);
    const scaledHeight = Math.ceil(height / size);

    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height);

    if (palette !== 'none') {
      applyColorPalette(ctx, width, height, palette);
    }

    // Apply sharpening for enhanced clarity
    sharpenImage(ctx, width, height);

    setTimeout(() => setProcessing(false), 100);
  };

  useEffect(() => {
    if (originalImageRef.current) {
      pixelateImage(originalImageRef.current, pixelSize, colorPalette);
    }
  }, [pixelSize, colorPalette]);

  const handleDownload = async () => {
    if (!canvasRef.current) {
      toast.error('No image to download');
      return;
    }

    try {
      const response = await axios.post(`${API}/user/image-created?username=${user.username}`);
      
      setDailyStats({
        daily_images_today: response.data.daily_images_today,
        has_unlimited: response.data.has_unlimited,
        invited_users_count: dailyStats?.invited_users_count || 0
      });

      if (response.data.remaining_today >= 0) {
        toast.success(`Image saved! ${response.data.remaining_today} remaining today`);
      } else {
        toast.success('Image saved! (Unlimited)');
      }
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error(error.response.data.detail);
        return;
      }
      console.error('Failed to update image count:', error);
    }

    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `larrypixels_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handleShareTwitter = () => {
    if (!canvasRef.current) {
      toast.error('No image to share');
      return;
    }

    // Trigger download first
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `larrypixels_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Then open Twitter with text and webapp link
      setTimeout(() => {
        const webappUrl = window.location.origin;
        const text = encodeURIComponent(
          `Just created some retro pixel art with @larrynfts! 🎨✨\n\nCheck out Larrypixels: ${webappUrl}\n\n#Larrypixels #PixelArt #RetroArt`
        );
        const twitterUrl = 'https://twitter.com/intent/tweet?text=' + text;
        window.open(twitterUrl, '_blank');
        toast.success('Image downloaded! Now share on X with your pixel art attached!');
      }, 500);
    }, 'image/png');
  };

  const getRemainingText = () => {
    if (!dailyStats) return '';
    if (dailyStats.has_unlimited) return 'UNLIMITED ACCESS';
    const remaining = 10 - dailyStats.daily_images_today;
    return `${remaining}/10 IMAGES LEFT TODAY`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-pixel text-4xl text-white text-glow mb-2" data-testid="studio-title">
              [ PIXEL_STUDIO.EXE ]
            </h1>
            <p className="font-mono text-sm text-muted uppercase tracking-wider" data-testid="studio-subtitle">
              8-BIT IMAGE PROCESSOR - BETA
            </p>
          </div>
          {dailyStats && (
            <div className="border-2 border-white/20 bg-black px-6 py-3">
              <p className="font-mono text-xs text-muted uppercase mb-1">DAILY LIMIT</p>
              <p className={`font-mono text-sm ${
                dailyStats.has_unlimited ? 'text-white text-glow' : 'text-white'
              }`} data-testid="daily-limit-text">
                {getRemainingText()}
              </p>
              {!dailyStats.has_unlimited && (
                <p className="font-mono text-xs text-muted mt-1">
                  INVITE {10 - dailyStats.invited_users_count} MORE FOR UNLIMITED
                </p>
              )}
            </div>
          )}
        </div>

        {/* Beta Info Banner */}
        <div className="mb-6 border-2 border-white/20 bg-secondary p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-white mt-1 flex-shrink-0" />
            <div className="font-mono text-xs text-white space-y-1">
              <p className="uppercase font-bold" data-testid="beta-title">⚡ BETA PHASE - HELP US TEST!</p>
              <p data-testid="beta-text-1">→ Create pixel art and climb to the top of the leaderboard</p>
              <p data-testid="beta-text-2">→ Share your generated images on X with @larrynfts</p>
              <p data-testid="beta-text-3">→ More styles coming soon - stay tuned!</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="border-2 border-white/20 bg-black p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-white" data-testid="canvas-title">
                  [ OUTPUT ]
                </h2>
                {processing && (
                  <span className="font-mono text-xs text-muted animate-pulse" data-testid="processing-indicator">
                    PROCESSING...
                  </span>
                )}
              </div>
              
              <div className="aspect-video bg-secondary border border-white/10 flex items-center justify-center relative overflow-hidden" data-testid="canvas-container">
                {!image ? (
                  <div className="text-center">
                    <Upload size={48} className="mx-auto mb-4 text-muted" />
                    <p className="font-mono text-sm text-muted uppercase" data-testid="upload-prompt">
                      UPLOAD IMAGE TO BEGIN
                    </p>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full object-contain"
                    data-testid="pixelation-canvas"
                  />
                )}
              </div>
            </div>

            {image && (
              <>
                <div className="border-2 border-white/20 bg-black p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sliders size={16} className="text-white" />
                    <h2 className="font-mono text-sm uppercase tracking-widest text-white" data-testid="controls-title">
                      [ PIXEL INTENSITY ]
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="2"
                        max="50"
                        value={pixelSize}
                        onChange={(e) => setPixelSize(parseInt(e.target.value))}
                        className="flex-1 h-1 bg-white/20 appearance-none cursor-pointer"
                        style={{
                          accentColor: '#FFFFFF'
                        }}
                        data-testid="pixel-size-slider"
                      />
                      <span className="font-mono text-lg text-white w-12 text-right" data-testid="pixel-size-value">
                        {pixelSize}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-xs text-muted uppercase">
                      <span>FINE</span>
                      <span>CHUNKY</span>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-white/20 bg-black p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette size={16} className="text-white" />
                    <h2 className="font-mono text-sm uppercase tracking-widest text-white" data-testid="palette-title">
                      [ RETRO COLOR PALETTE ]
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
                      <button
                        key={key}
                        onClick={() => setColorPalette(key)}
                        className={`rounded-none border-2 font-mono text-xs uppercase tracking-widest py-2 transition-all ${
                          colorPalette === key
                            ? 'border-white bg-white text-black'
                            : 'border-white/20 bg-black text-white hover:border-white'
                        }`}
                        data-testid={`palette-${key}`}
                      >
                        {palette.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="border-2 border-white/20 bg-black p-6">
              <h2 className="font-mono text-sm uppercase tracking-widest text-white mb-4" data-testid="actions-title">
                [ ACTIONS ]
              </h2>
              
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  data-testid="file-input"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono uppercase tracking-widest py-3 flex items-center justify-center gap-2"
                  data-testid="upload-button"
                >
                  <Upload size={16} />
                  UPLOAD IMAGE
                </button>

                {image && (
                  <>
                    <button
                      onClick={handleDownload}
                      className="w-full rounded-none border-2 border-white bg-white text-black hover:bg-black hover:text-white transition-all duration-75 font-mono uppercase tracking-widest py-3 flex items-center justify-center gap-2"
                      data-testid="download-button"
                    >
                      <Download size={16} />
                      DOWNLOAD PNG
                    </button>

                    <button
                      onClick={handleShareTwitter}
                      className="w-full rounded-none border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-75 font-mono uppercase tracking-widest py-3 flex items-center justify-center gap-2"
                      data-testid="share-twitter-button"
                    >
                      <Twitter size={16} />
                      SHARE ON X
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border-2 border-white/20 bg-black p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-white" />
                <h2 className="font-mono text-sm uppercase tracking-widest text-white" data-testid="info-title">
                  [ INFO ]
                </h2>
              </div>
              
              <div className="space-y-2 font-mono text-xs text-muted">
                <p data-testid="info-line-1">→ SUPPORTED: JPG, PNG, WEBP</p>
                <p data-testid="info-line-2">→ LIMIT: 10 IMAGES/DAY</p>
                <p data-testid="info-line-3">→ PROCESSING: CLIENT-SIDE</p>
                <p data-testid="info-line-4">→ OUTPUT: PNG FORMAT</p>
                <p data-testid="info-line-5">→ ENHANCED CLARITY APPLIED</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;