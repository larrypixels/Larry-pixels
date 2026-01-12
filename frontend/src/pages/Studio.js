import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Upload, Download, Zap, Sliders } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Studio = () => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        setImage(event.target.result);
        pixelateImage(img, pixelSize);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const pixelateImage = (img, size) => {
    if (!img || !canvasRef.current) return;

    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    const width = canvas.width;
    const height = canvas.height;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, width / size, height / size);
    ctx.drawImage(canvas, 0, 0, width / size, height / size, 0, 0, width, height);

    setTimeout(() => setProcessing(false), 100);
  };

  useEffect(() => {
    if (originalImageRef.current) {
      pixelateImage(originalImageRef.current, pixelSize);
    }
  }, [pixelSize]);

  const handleDownload = async () => {
    if (!canvasRef.current) {
      toast.error('No image to download');
      return;
    }

    try {
      await axios.post(`${API}/user/image-created?username=${user.username}`);
    } catch (error) {
      console.error('Failed to update image count:', error);
    }

    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `larrypixels_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Image downloaded!');
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-pixel text-4xl text-white text-glow mb-2" data-testid="studio-title">
            [ PIXEL_STUDIO.EXE ]
          </h1>
          <p className="font-mono text-sm text-muted uppercase tracking-wider" data-testid="studio-subtitle">
            8-BIT IMAGE PROCESSOR
          </p>
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
                  <button
                    onClick={handleDownload}
                    className="w-full rounded-none border-2 border-white bg-white text-black hover:bg-black hover:text-white transition-all duration-75 font-mono uppercase tracking-widest py-3 flex items-center justify-center gap-2"
                    data-testid="download-button"
                  >
                    <Download size={16} />
                    DOWNLOAD PNG
                  </button>
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
                <p data-testid="info-line-2">→ MAX SIZE: CLIENT-SIDE ONLY</p>
                <p data-testid="info-line-3">→ PROCESSING: INSTANT</p>
                <p data-testid="info-line-4">→ OUTPUT: PNG FORMAT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;