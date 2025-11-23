import React, { useState, useEffect, useRef } from 'react';
import { Upload, Film, Wand2, RefreshCw, Play, AlertCircle } from 'lucide-react';
import { generateVideo } from './services/veoService';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AuthScreen } from './components/AuthScreen';
import { GenerationStatus, AspectRatio } from './types';

// Removed conflicting window interface declaration.
// Accessing window.aistudio via casting to avoid conflicts with global type definitions.

const SAMPLE_PROMPT = `DM Madam, dressed as a bride, reached the police station at midnight. Cinematic lighting, high drama, moody atmosphere.`;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && aistudio.hasSelectedApiKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setIsAuthenticated(hasKey);
      }
    } catch (e) {
      console.error("Auth check failed", e);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleConnect = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && aistudio.openSelectKey) {
        await aistudio.openSelectKey();
        // Assume success after interaction to avoid race condition
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Auth flow failed", e);
      setError("Failed to connect API key.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset previous results
      setVideoUrl(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setStatus('uploading');
    setError(null);

    try {
      const resultUrl = await generateVideo(image, prompt, aspectRatio);
      setVideoUrl(resultUrl);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'AUTH_ERROR') {
        setIsAuthenticated(false);
        setError("Session expired or invalid key. Please reconnect.");
      } else {
        setError(err.message || "Something went wrong during generation.");
      }
      setStatus('error');
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setVideoUrl(null);
    setPrompt("");
    setError(null);
    setStatus('idle');
  };

  if (checkingAuth) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400"><RefreshCw className="animate-spin w-8 h-8" /></div>;
  }

  if (!isAuthenticated) {
    return <AuthScreen onConnect={handleConnect} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <LoadingOverlay status={status} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Film className="w-6 h-6" />
            <span className="font-bold text-xl text-white tracking-tight">Veo Animator</span>
          </div>
          <button 
             onClick={() => setIsAuthenticated(false)}
             className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            Switch API Key
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Controls */}
          <div className="flex flex-col gap-6">
            
            {/* Image Uploader */}
            <div className={`
              relative group border-2 border-dashed rounded-2xl transition-all duration-300
              ${imagePreview 
                ? 'border-indigo-500/50 bg-slate-900/50' 
                : 'border-slate-700 hover:border-indigo-400 bg-slate-900 hover:bg-slate-800/50'
              }
              h-80 flex flex-col items-center justify-center overflow-hidden
            `}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Click to change image</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 pointer-events-none">
                  <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Upload Reference Image</h3>
                  <p className="text-sm text-slate-400">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 flex justify-between">
                <span>Prompt (Optional)</span>
                <button 
                  onClick={() => setPrompt(SAMPLE_PROMPT)}
                  className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" />
                  Use Sample Story
                </button>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want the image to move or change..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-32 transition-all"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
               <label className="text-sm font-medium text-slate-300">Aspect Ratio</label>
               <div className="grid grid-cols-2 gap-4">
                 <button
                   onClick={() => setAspectRatio('16:9')}
                   className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                     aspectRatio === '16:9' 
                     ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                     : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                   }`}
                 >
                   <div className="w-8 h-5 border-2 border-current rounded-sm"></div>
                   <span className="text-sm font-medium">Landscape (16:9)</span>
                 </button>
                 <button
                   onClick={() => setAspectRatio('9:16')}
                   className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                     aspectRatio === '9:16' 
                     ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                     : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                   }`}
                 >
                   <div className="w-5 h-8 border-2 border-current rounded-sm"></div>
                   <span className="text-sm font-medium">Portrait (9:16)</span>
                 </button>
               </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!image || status !== 'idle' && status !== 'error' && status !== 'success'}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                ${!image 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/25 active:scale-[0.98]'
                }
              `}
            >
              <Film className="w-5 h-5" />
              {status === 'generating' ? 'Processing...' : 'Generate Video'}
            </button>
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-white">Result</h3>
            
            <div className={`
              relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center
              border border-slate-800 shadow-2xl
              ${aspectRatio === '9:16' ? 'max-w-sm mx-auto aspect-[9/16]' : ''}
            `}>
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  {status === 'idle' || status === 'error' ? (
                     <div className="flex flex-col items-center gap-4 opacity-50">
                        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center">
                          <Play className="w-8 h-8 text-slate-700 ml-1" />
                        </div>
                        <p className="text-slate-500 text-sm">Generated video will appear here</p>
                     </div>
                  ) : (
                    // While generating, we show the loading overlay on top of screen, but we can keep this clean
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-full h-full bg-slate-900/50 absolute inset-0 animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {videoUrl && (
               <div className="flex justify-center">
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start New Creation
                  </button>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;