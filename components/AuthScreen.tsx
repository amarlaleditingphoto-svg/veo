import React from 'react';
import { Key, ExternalLink, Video } from 'lucide-react';

interface AuthScreenProps {
  onConnect: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onConnect }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
        <div className="bg-indigo-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="w-10 h-10 text-indigo-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Veo Animator</h1>
        <p className="text-slate-300 mb-8 leading-relaxed">
          Transform your static images into cinematic videos using Google's generative AI model, Veo.
          To begin, please connect your paid Google Cloud Project.
        </p>

        <button
          onClick={onConnect}
          className="group relative w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-4 px-6 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <Key className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
          <span>Connect API Key</span>
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
          <ExternalLink className="w-4 h-4" />
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline decoration-slate-600 hover:decoration-indigo-400 underline-offset-4"
          >
            Learn about billing & pricing
          </a>
        </div>
      </div>
    </div>
  );
};