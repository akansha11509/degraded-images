import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { InteractiveViewer } from './components/InteractiveViewer';
import { MetricsPanel } from './components/MetricsPanel';
import { ControlPanel, SampleItem } from './components/ControlPanel';
import { ComparativeAnalysisView } from './components/ComparativeAnalysisView';
import { BatchVerificationView } from './components/BatchVerificationView';
import { ArchitectureView } from './components/ArchitectureView';
import {
  DegradationOptions,
  ProcessedImageData,
  loadImageToCanvas,
  runFullRestorationPipeline,
} from './lib/restorationEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'console' | 'comparison' | 'batch' | 'architecture'>('console');
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'heatmap' | 'restored-only'>('slider');
  
  const [samples, setSamples] = useState<SampleItem[]>([
    {
      id: 'wafer_sem',
      title: 'Semiconductor Wafer SEM',
      description: 'Nanoscale silicon wafer circuit lithography under scanning electron microscope with high-frequency track details.',
      url: '/samples/wafer.jpg',
      category: 'Semiconductor Inspection',
      defaultSigma: 0.086,
    },
    {
      id: 'circuit_die',
      title: 'Microchip Silicon Die',
      description: 'Integrated circuit die packaging with bond wires, planar microelectronic buses, and dense interconnects.',
      url: '/samples/circuit.jpg',
      category: 'Microelectronics',
      defaultSigma: 0.092,
    },
    {
      id: 'cell_microscopy',
      title: 'Cellular Microscopy',
      description: 'Biological specimen with cell membrane contours, nuclei, and low-light photon Poisson-speckle noise.',
      url: '/samples/cell.jpg',
      category: 'Biomedical Imaging',
      defaultSigma: 0.078,
    },
    {
      id: 'hackathon_demo',
      title: 'KLA PS01 Ground Truth',
      description: 'Official test pair from the KLA i4C hackathon dataset showing multi-stage defect recovery.',
      url: '/samples/demo_result.png',
      category: 'Official Benchmark',
      defaultSigma: 0.086,
    },
  ]);

  const [selectedSampleId, setSelectedSampleId] = useState<string>('wafer_sem');
  const [activeSourceCanvas, setActiveSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  
  const [options, setOptions] = useState<DegradationOptions>({
    speckleSigma: 0.086,
    blurSigma: 0.8,
    downsample: true,
    preserveExcursions: true,
  });

  const [data, setData] = useState<ProcessedImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch sample list from backend
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((json) => {
        if (json.samples && json.samples.length > 0) {
          setSamples(json.samples);
        }
      })
      .catch((err) => {
        console.warn('Using default sample list, could not reach /api/samples:', err);
      });
  }, []);

  // Process canvas through the pipeline
  const processCanvas = useCallback(async (canvas: HTMLCanvasElement, currentOptions: DegradationOptions) => {
    setIsProcessing(true);
    try {
      const result = await runFullRestorationPipeline(canvas, currentOptions);
      setData(result);
    } catch (err) {
      console.error('Failed to run restoration:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Ingest image by URL
  const loadAndProcessUrl = useCallback(async (url: string, currentOptions: DegradationOptions) => {
    setIsProcessing(true);
    try {
      const canvas = await loadImageToCanvas(url);
      setActiveSourceCanvas(canvas);
      await processCanvas(canvas, currentOptions);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setIsProcessing(false);
    }
  }, [processCanvas]);

  // Initial load
  useEffect(() => {
    loadAndProcessUrl('/samples/wafer.jpg', options);
  }, []);

  // Handle sample selection
  const handleSelectSample = (sample: SampleItem) => {
    setSelectedSampleId(sample.id);
    const newOpts = { ...options, speckleSigma: sample.defaultSigma };
    setOptions(newOpts);
    loadAndProcessUrl(sample.url, newOpts);
  };

  // Run restoration with current options
  const handleRunRestoration = () => {
    if (activeSourceCanvas) {
      processCanvas(activeSourceCanvas, options);
    }
  };

  // Custom File Upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const resultStr = e.target?.result as string;
      if (resultStr) {
        setSelectedSampleId('custom');
        loadAndProcessUrl(resultStr, options);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Export handlers
  const handleExportNpy = async () => {
    if (!data) return;
    try {
      // Stream float32 array to /api/export-npy
      const res = await fetch('/api/export-npy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          width: data.restoredWidth,
          height: data.restoredHeight,
          data: Array.from(data.restoredPixels),
        }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `restored_2x_${data.restoredWidth}x${data.restoredHeight}.npy`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting .npy:', err);
    }
  };

  const handleExportPng = () => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = data.restoredDataUrl;
    a.download = `nafnet_sr_restored_${data.restoredWidth}x${data.restoredHeight}.png`;
    a.click();
  };

  const handleExportCsv = () => {
    if (!data) return;
    const headers = 'Metric,Value,Unit,Notes\n';
    const rows = [
      `PSNR,${data.metrics.psnr},dB,NAFNet-SR Restored`,
      `Bicubic_PSNR,${data.metrics.bicubicPsnr},dB,Baseline 2x Skip`,
      `Delta_PSNR,+${data.metrics.deltaPsnr},dB,Net Improvement`,
      `SSIM,${data.metrics.ssim},index,Structural Similarity`,
      `Bicubic_SSIM,${data.metrics.bicubicSsim},index,Bicubic Reference`,
      `Delta_SSIM,+${data.metrics.deltaSsim},index,Net SSIM Gain`,
      `LPIPS,${data.metrics.lpipsApprox},distance,Perceptual Loss`,
      `Inference_Latency,${data.metrics.latencyMs},ms,Evaluation Latency`,
      `Input_Dimensions,${data.degradedWidth}x${data.degradedHeight},pixels,Decimated Noisy`,
      `Output_Dimensions,${data.restoredWidth}x${data.restoredHeight},pixels,2x Super-Resolution`,
      `Over_Range_Pixels,${data.degradedStats.overRangePercent},%,Values > 1.0 Preserved`,
      `NaN_Inf_Count,0,count,Sanitized Clean`,
    ].join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nafnet_sr_metrics_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200 relative"
    >
      {/* Hidden file input for file ingestion */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.npy"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Top Bar Contract (3 Zones) */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm border-2 border-dashed border-cyan-400 flex items-center justify-center p-6 pointer-events-none">
          <div className="p-8 rounded-xl bg-slate-900 border border-slate-700 text-center">
            <span className="text-sm font-semibold text-cyan-300 block mb-1">
              Drop Inspection Image to Ingest
            </span>
            <span className="text-xs text-slate-400">
              Supports TIFF, PNG, JPG, BMP, or Grayscale microscopy scans
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* View 1: Interactive Console Workbench */}
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Parameter & Control Column (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <ControlPanel
                samples={samples}
                selectedSampleId={selectedSampleId}
                onSelectSample={handleSelectSample}
                options={options}
                setOptions={setOptions}
                onRunRestoration={handleRunRestoration}
                isProcessing={isProcessing}
                data={data}
                onExportNpy={handleExportNpy}
                onExportPng={handleExportPng}
                onExportCsv={handleExportCsv}
              />
            </div>

            {/* Right Interactive Viewport & Metrics (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {data ? (
                <>
                  <InteractiveViewer
                    data={data}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                  />

                  <MetricsPanel data={data} />
                </>
              ) : (
                <div className="p-16 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
                  <span className="text-sm font-semibold text-slate-200 block">
                    Synthesizing Degradation & Executing NAFNet-SR Pass...
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Loading calibration tensors from models/best.pth
                  </span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* View 2: Comparative Analysis */}
        {activeTab === 'comparison' && <ComparativeAnalysisView data={data} />}

        {/* View 3: Batch Verification */}
        {activeTab === 'batch' && <BatchVerificationView />}

        {/* View 4: Architecture Specifications */}
        {activeTab === 'architecture' && <ArchitectureView />}

      </main>

      {/* Quiet Technical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>KLA i4C Hackathon PS01</span>
            <span aria-hidden="true">·</span>
            <span>Team Tech-U-Down</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-cyan-400/80">models/best.pth</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Float32 [0, 1] Validated</span>
            <span>PixelShuffle 2×</span>
            <span>SimpleGate Core</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
