import React from 'react';
import { Sliders, Cpu, CheckSquare, Layers, UploadCloud } from 'lucide-react';

interface TopNavProps {
  activeTab: 'console' | 'comparison' | 'batch' | 'architecture';
  setActiveTab: (tab: 'console' | 'comparison' | 'batch' | 'architecture') => void;
  onUploadClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, setActiveTab, onUploadClick }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-100 whitespace-nowrap">
            NAFNet-SR <span className="text-slate-400 font-normal">· Degraded Image Restoration</span>
          </span>
        </div>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'console'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Console</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Comparative Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'batch'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Batch Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture Specs</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onUploadClick}
            className="px-4 py-2 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm shadow-cyan-950"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest Image</span>
          </button>
        </div>

      </div>
    </header>
  );
};
