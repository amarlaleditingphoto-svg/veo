import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GenerationStatus } from '../types';

interface LoadingOverlayProps {
  status: GenerationStatus;
}

const MESSAGES = [
  "Analyzing image composition...",
  "Dreaming up movement...",
  "Consulting the director...",
  "Rendering pixels...",
  "Applying cinematic lighting...",
  "Finalizing the cut...",
  "Polishing the frames...",
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (status === 'generating' || status === 'polling') {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === 'idle' || status === 'success' || status === 'error') return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto relative z-10" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Creating Video</h3>
        <p className="text-slate-400 min-h-[1.5rem] transition-all duration-500">
          {MESSAGES[messageIndex]}
        </p>
        
        <div className="mt-6 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-indigo-500 animate-progress origin-left"></div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Veo generation can take 1-2 minutes.</p>
      </div>
    </div>
  );
};
