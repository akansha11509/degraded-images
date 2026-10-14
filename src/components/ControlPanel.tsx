import React from 'react';
import { Sliders, RefreshCw, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { DegradationOptions, ProcessedImageData } from '../lib/restorationEngine';

export interface SampleItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  defaultSigma: number;
}

interface ControlPanelProps {
  samples: SampleItem[];
  selectedSampleId: string;
  onSelectSample: (sample: SampleItem) => void;
  options: DegradationOptions;
  setOptions: React.Dispatch<React.SetStateAction<DegradationOptions>>;
  onRunRestoration: () => void;
  isProcessing: boolean;
  data: ProcessedImageData | null;
  onExportNpy: () => void;
  onExportPng: () => void;
  onExportCsv: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  samples,
  selectedSampleId,
  onSelectSample,
  options,
  setOptions,
  onRunRestoration,
  isProcessing,
  data,
  onExportNpy,
  onExportPng,
  onExportCsv,
}) => {
  return (
    <div className="space-y-4">
      
      {/* 1. Sample Selector Grid */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-200">
            Calibration Samples & Test Ingestion
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {samples.length} presets loaded
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {samples.map((s) => {
            const isSelected = s.id === selectedSampleId;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSample(s)}
                className={`p-2.5 text-left rounded border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-medium truncate">{s.title}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                </div>
                <span className="text-[10px] text-slate-400 truncate">{s.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Synthetic Degradation Parameters */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Degradation Synthesis Calibration
          </span>
          <button
            onClick={() =>
              setOptions({
                speckleSigma: 0.086,
                blurSigma: 0.8,
                downsample: true,
                preserveExcursions: true,
              })
            }
            className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Speckle Noise Sigma Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Multiplicative Speckle (σ)</span>
            <span className="font-mono text-cyan-400 tabular-nums">
              {options.speckleSigma.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min="0.00"
            max="0.20"
            step="0.005"
            value={options.speckleSigma}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, speckleSigma: parseFloat(e.target.value) }))
            }
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>0.00 (Clean)</span>
            <span className="text-amber-400">σ ≈ 0.086 (Real KLA Calibrated)</span>
            <span>0.20 (Extreme)</span>
          </div>
        </div>

        {/* Separable Gaussian Blur Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Gaussian Optics Blur (σ)</span>
            <span className="font-mono text-cyan-400 tabular-nums">
              {options.blurSigma.toFixed(2)} px
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.5"
            step="0.1"
            value={options.blurSigma}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, blurSigma: parseFloat(e.target.value) }))
            }
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>0.0 px</span>
            <span>0.8 px (Optical PSF)</span>
            <span>2.5 px</span>
          </div>
        </div>

        {/* Dynamic Range & Super-Res Toggles */}
        <div className="space-y-2 pt-1 border-t border-slate-800 text-xs">
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-slate-300">2× Downsampling Factor</span>
            <input
              type="checkbox"
              checked={options.downsample}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, downsample: e.target.checked }))
              }
              className="accent-cyan-400 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <div>
              <span className="text-slate-300 block">Preserve Sensor Highlights (&gt; 1.0)</span>
              <span className="text-[10px] text-slate-400">Decision #1: Never clip raw speckle signal</span>
            </div>
            <input
              type="checkbox"
              checked={options.preserveExcursions}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, preserveExcursions: e.target.checked }))
              }
              className="accent-cyan-400 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Trigger Restoration Button */}
        <button
          onClick={onRunRestoration}
          disabled={isProcessing}
          className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-medium text-xs rounded transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? 'Processing Forward Pass...' : 'Execute NAFNet-SR Restoration'}</span>
        </button>
      </div>

      {/* 3. Export Center */}
      {data && (
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
          <span className="text-xs font-semibold text-slate-200 block">
            Artifact & Tensor Export
          </span>

          <div className="grid grid-cols-1 gap-2">
            
            {/* Download .npy binary button */}
            <button
              onClick={onExportNpy}
              className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono rounded transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export NumPy Array (.npy)</span>
              </div>
              <span className="text-[10px] text-slate-400">float32 · 2H×2W</span>
            </button>

            {/* Download Restored PNG */}
            <button
              onClick={onExportPng}
              className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono rounded transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Restored PNG</span>
              </div>
              <span className="text-[10px] text-slate-400">2× Upscaled</span>
            </button>

            {/* Download Metrics CSV */}
            <button
              onClick={onExportCsv}
              className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono rounded transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Metrics Report (CSV)</span>
              </div>
              <span className="text-[10px] text-slate-400">PSNR · SSIM · LPIPS</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
