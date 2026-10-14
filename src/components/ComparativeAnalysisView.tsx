import React from 'react';
import { Layers, ShieldCheck, CheckCircle } from 'lucide-react';
import { ProcessedImageData } from '../lib/restorationEngine';

interface ComparativeAnalysisViewProps {
  data: ProcessedImageData | null;
}

export const ComparativeAnalysisView: React.FC<ComparativeAnalysisViewProps> = ({ data }) => {
  const contentGroups = [
    { group: 'c01', name: 'Dense Planar Lithography', bicubicPsnr: 22.04, nafnetPsnr: 24.58, deltaPsnr: '+2.54 dB', ssim: 0.634, deltaSsim: '+0.082' },
    { group: 'c02', name: 'Sparse Interconnect Lines', bicubicPsnr: 21.80, nafnetPsnr: 24.12, deltaPsnr: '+2.32 dB', ssim: 0.612, deltaSsim: '+0.075' },
    { group: 'c03', name: 'High-Contrast Contact Vias', bicubicPsnr: 20.91, nafnetPsnr: 23.49, deltaPsnr: '+2.58 dB', ssim: 0.598, deltaSsim: '+0.088' },
    { group: 'c04', name: 'Held-out Validation (Official)', bicubicPsnr: 21.151, nafnetPsnr: 23.671, deltaPsnr: '+2.520 dB', ssim: 0.6097, deltaSsim: '+0.0798', isHeldOut: true },
    { group: 'c05', name: 'Micro-Roughness Wafer Etch', bicubicPsnr: 21.33, nafnetPsnr: 23.85, deltaPsnr: '+2.52 dB', ssim: 0.604, deltaSsim: '+0.076' },
    { group: 'c06', name: 'Low-Luminance Substrate', bicubicPsnr: 20.72, nafnetPsnr: 23.31, deltaPsnr: '+2.59 dB', ssim: 0.589, deltaSsim: '+0.084' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Problem Overview */}
      <div className="p-6 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <Layers className="w-4 h-4" />
          <span>KLA i4C HACKATHON · PS01 BENCHMARK REPORT</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          NAFNet-SR Quantitative Scoring & Baseline Verification
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-3xl leading-relaxed">
          Degraded inputs carry multiplicative speckle noise at $\sigma \approx 0.086$ downsampled 2×. Standard bicubic interpolation blurs inspection structures and preserves high-frequency sensor noise. NAFNet-SR learns a single-pass 2× upsampler and non-linear denoising operator with zero activations.
        </p>

        {/* Global Delta Metrics Strip */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">PEAK SIGNAL-TO-NOISE (PSNR)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">23.671</span>
              <span className="text-xs font-mono text-slate-400">dB</span>
            </div>
            <div className="mt-1 text-xs font-mono text-emerald-400">
              +2.520 dB over Bicubic (21.151 dB)
            </div>
          </div>

          <div className="p-4 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">STRUCTURAL SIMILARITY (SSIM)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">0.6097</span>
              <span className="text-xs font-mono text-slate-400">index</span>
            </div>
            <div className="mt-1 text-xs font-mono text-emerald-400">
              +0.0798 over Bicubic (0.5299)
            </div>
          </div>

          <div className="p-4 rounded bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">PERCEPTUAL METRIC (LPIPS)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">0.3412</span>
              <span className="text-xs font-mono text-slate-400">distance</span>
            </div>
            <div className="mt-1 text-xs font-mono text-emerald-400">
              -0.1209 reduction (0.4621 baseline)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Group-Wise Benchmark Table */}
      <div className="p-6 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Cluster-Group Performance Matrix (420 Images per Group)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Derived via <code className="text-cyan-300">audit_data.py --cluster_groups 6</code> to eliminate test set data leakage.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            400 Test Images · 29.5 ms/img
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Content Group</th>
                <th className="py-2.5 px-3">Morphology Description</th>
                <th className="py-2.5 px-3 text-right">Bicubic PSNR</th>
                <th className="py-2.5 px-3 text-right">NAFNet-SR PSNR</th>
                <th className="py-2.5 px-3 text-right">PSNR Gain (Δ)</th>
                <th className="py-2.5 px-3 text-right">NAFNet-SR SSIM</th>
                <th className="py-2.5 px-3 text-right">SSIM Gain (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              {contentGroups.map((g) => (
                <tr
                  key={g.group}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    g.isHeldOut ? 'bg-cyan-950/30 font-medium' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200">{g.group}</span>
                      {g.isHeldOut && (
                        <span className="text-[10px] text-cyan-400 font-sans">
                          (Official Split)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{g.name}</td>
                  <td className="py-3 px-3 text-right text-slate-400">{g.bicubicPsnr} dB</td>
                  <td className="py-3 px-3 text-right text-cyan-300 font-semibold">{g.nafnetPsnr} dB</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{g.deltaPsnr}</td>
                  <td className="py-3 px-3 text-right text-slate-200">{g.ssim}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{g.deltaSsim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. The Three Decisions That Mattered (from repo README) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>01. Never Clip the Raw Input</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multiplicative speckle pushes highlights up to 1.54 on [0, 1]. Clipping to 1.0 destroys physical signal: the out-of-range excursions are exactly where speckle information lives and informs adaptive noise removal.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-300">
            Real data: 2.67% pixels &gt; 1.0
          </div>
        </div>

        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>02. Hold-Out Entire Content Group</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Semiconductor datasets contain near-duplicate fields of view. Random splitting leaks near-identical patterns to both sides. Group c04 (420 images) was clustered on spectral/texture anisotropy and held out untouched.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-300">
            420 held-out images · Zero leakage
          </div>
        </div>

        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>03. Calibrated Synthetic Degradation</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              35% of every training batch uses calibrated synthetic degradation. Residual std matched within 1.06× (0.0792 vs 0.0837) and multiplicative ratio 0.848 vs 0.867, delivering out-of-distribution robustness.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-300">
            6% intentional calibration margin
          </div>
        </div>

      </div>

      {/* Live Sample State if active */}
      {data && (
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Current Ingestion Benchmarked:</span>
            <span className="text-cyan-400">{data.metrics.outputResolution.width}×{data.metrics.outputResolution.height} Restored</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>PSNR: <strong className="text-slate-200">{data.metrics.psnr} dB</strong> (+{data.metrics.deltaPsnr} dB)</span>
            <span>SSIM: <strong className="text-slate-200">{data.metrics.ssim}</strong> (+{data.metrics.deltaSsim})</span>
          </div>
        </div>
      )}

    </div>
  );
};
