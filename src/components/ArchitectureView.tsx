import React from 'react';
import { Cpu, Terminal, GitBranch, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* 1. Architecture Hero Banner */}
      <div className="p-6 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Cpu className="w-4 h-4" />
              <span>NEURAL NETWORK ARCHITECTURE SPECIFICATION</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              NAFNet-SR: Nonlinear Activation Free Network for Super-Resolution
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-3xl leading-relaxed">
              A 4-stage U-Net that operates completely at low resolution and reconstructs 2× resolution at the very end via PixelShuffle, removing speckle noise and restoring nanoscale structural boundaries in a single forward pass.
            </p>
          </div>

          <a
            href="https://github.com/sanviya/DEGRADED-IMAGE-RESTORATION.git"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono rounded transition-colors flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>sanviya/DEGRADED-IMAGE-RESTORATION</span>
          </a>
        </div>

        {/* High-Level Architecture Flow Diagram */}
        <div className="mt-6 p-4 rounded bg-slate-950 border border-slate-800/90 overflow-x-auto">
          <div className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre">
{`                 ┌──────────── global bicubic ×2 skip ────────────┐
                 │            (network learns the residual)       ▼
degraded ─→ conv ─→ E1 ─→ E2 ─→ E3 ─→ E4 ─→ middle ─→ D4 ─→ D3 ─→ D2 ─→ D1 ─→ PixelShuffle ×2 ─→ ⊕ ─→ restored
 128²·1     w=32   1×    1×    2×    4×      8×       1×    1×    1×    1×       + zero-init conv     256²·1
                 32·128² 64·64² 128·32² 256·16²  512·8²`}
          </div>
        </div>
      </div>

      {/* 2. Key Micro-Architectural Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* SimpleGate Deep Dive */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>01. Zero Activation Functions (SimpleGate)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard activation functions like ReLU or GELU introduce non-linear latency overhead and quantization friction. SimpleGate splits the $2C$ channel tensor into two $C$-channel halves and multiplies them element-wise:
          </p>
          <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-cyan-300 text-center">
            SimpleGate(X) = X₁ ⊙ X₂ &nbsp; (X ∈ ℝ^(B×2C×H×W))
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fewer floating-point operations, no activation lookups, smooth gradients, and seamless zero-overhead export to ONNX / TensorRT.
          </p>
        </div>

        {/* Spatial Channel Attention */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>02. Spatial Channel Attention (SCA)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Adapts channel weighting according to global image statistics while preserving local spatial variations:
          </p>
          <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-cyan-300 text-center">
            SCA(X) = X ⊙ W(GlobalAvgPool(X))
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Captures global illumination context across semiconductor dies without heavy transformer self-attention quadratic complexity.
          </p>
        </div>

        {/* PixelShuffle vs Transposed Conv */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>03. PixelShuffle: Zero Checkerboard Artifacts</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transposed convolutions frequently produce periodic checkerboard artifacts due to uneven kernel overlap. In semiconductor wafer inspection, a periodic pattern reads as a <strong>false circuit defect</strong>. PixelShuffle rearranges channels into spatial dimensions ($r^2C \to C, rH \times rW$), completely preventing checkerboards.
          </p>
        </div>

        {/* LayerNorm Robustness */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>04. Per-Pixel LayerNorm Across Channels</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unseen inspection tools exhibit significant global brightness and optical contrast drifts. Applying LayerNorm per pixel across channels neutralizes instrument-specific calibration variations, giving NAFNet-SR out-of-distribution stability.
          </p>
        </div>

      </div>

      {/* 3. Model Presets Table & CLI Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Presets Table */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Available Parameter Configurations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2">Preset</th>
                  <th className="py-2">Parameters</th>
                  <th className="py-2">Enc Width</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 tabular-nums">
                <tr>
                  <td className="py-2.5 text-slate-400">small</td>
                  <td className="py-2.5 text-slate-300">3.9 M</td>
                  <td className="py-2.5 text-slate-400">16</td>
                  <td className="py-2.5 text-slate-400">Lightweight</td>
                </tr>
                <tr className="bg-cyan-950/40 font-medium">
                  <td className="py-2.5 text-cyan-300">medium</td>
                  <td className="py-2.5 text-cyan-300">19.02 M</td>
                  <td className="py-2.5 text-cyan-300">32</td>
                  <td className="py-2.5 text-emerald-400">Submitted (best.pth)</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400">base</td>
                  <td className="py-2.5 text-slate-300">29.2 M</td>
                  <td className="py-2.5 text-slate-400">48</td>
                  <td className="py-2.5 text-slate-400">Research</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400">large</td>
                  <td className="py-2.5 text-slate-300">116.1 M</td>
                  <td className="py-2.5 text-slate-400">64</td>
                  <td className="py-2.5 text-slate-400">Offline Server</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CLI Terminal Runner */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Offline Terminal Execution</span>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              The project is 100% self-contained. Trained weights live directly in <code className="text-cyan-300">models/best.pth</code> (72.7 MB). Zero internet, zero downloads, zero API keys required:
            </p>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
              <div className="text-slate-500"># 1. Install dependencies</div>
              <div>pip install -r requirements.txt</div>
              <div className="text-slate-500 mt-2"># 2. Run restoration on a folder of .npy images</div>
              <div>python run.py &lt;input-dir&gt; &lt;output-dir&gt;</div>
              <div className="text-slate-500 mt-2"># Example:</div>
              <div>python run.py test/NoisyLR results/</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Dependencies:</span>
            <span className="text-slate-200">torch==2.5.1 · numpy==2.1.3</span>
          </div>
        </div>

      </div>

    </div>
  );
};
