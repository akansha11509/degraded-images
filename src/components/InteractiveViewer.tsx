import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Split, Eye, Sparkles, Activity } from 'lucide-react';
import { ProcessedImageData } from '../lib/restorationEngine';

interface InteractiveViewerProps {
  data: ProcessedImageData;
  viewMode: 'slider' | 'side-by-side' | 'heatmap' | 'restored-only';
  setViewMode: (mode: 'slider' | 'side-by-side' | 'heatmap' | 'restored-only') => void;
}

export const InteractiveViewer: React.FC<InteractiveViewerProps> = ({
  data,
  viewMode,
  setViewMode,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0-100
  const [zoomLevel, setZoomLevel] = useState<number>(1);   // 1x, 2x, 4x, 8x
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef<boolean>(false);
  const startPanPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle slider drag
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider.current) {
        handleSliderMove(e.clientX);
      } else if (isPanning) {
        setPanOffset({
          x: e.clientX - startPanPos.current.x,
          y: e.clientY - startPanPos.current.y,
        });
      }
    };

    const onMouseUp = () => {
      isDraggingSlider.current = false;
      setIsPanning(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isPanning, handleSliderMove]);

  // Track hover coordinate
  const handlePointerHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = Math.floor(((e.clientX - rect.left) / rect.width) * data.restoredWidth);
    const normY = Math.floor(((e.clientY - rect.top) / rect.height) * data.restoredHeight);
    setCoords({ x: Math.max(0, Math.min(data.restoredWidth, normX)), y: Math.max(0, Math.min(data.restoredHeight, normY)) });
  };

  const handleZoom = (delta: number) => {
    const levels = [1, 2, 4, 8];
    const currentIdx = levels.indexOf(zoomLevel);
    let nextIdx = currentIdx + delta;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx >= levels.length) nextIdx = levels.length - 1;
    const newZoom = levels[nextIdx];
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const resetViewport = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSliderPos(50);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Top HUD Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
        
        {/* View Mode Segmented Selector */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded border border-slate-800">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1 font-medium rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'slider' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 font-medium rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'side-by-side' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1 font-medium rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'heatmap' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Residual Heatmap</span>
          </button>

          <button
            onClick={() => setViewMode('restored-only')}
            className={`px-3 py-1 font-medium rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'restored-only' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Restored 2×</span>
          </button>
        </div>

        {/* Center / Inspection Coordinates */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono text-[11px] tabular-nums">
          <span>Scale: {zoomLevel}×</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Input: {data.degradedWidth}×{data.degradedHeight}</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Restored: {data.restoredWidth}×{data.restoredHeight}</span>
          {coords && (
            <>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-cyan-400">Probe: ({coords.x}, {coords.y})</span>
            </>
          )}
        </div>

        {/* Zoom & Reset Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom(-1)}
            disabled={zoomLevel <= 1}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => handleZoom(1)}
            disabled={zoomLevel >= 8}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetViewport}
            className="px-2 py-1 text-[11px] font-mono rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            title="Reset pan and zoom"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* Main Viewport Stage */}
      <div
        ref={containerRef}
        onMouseMove={handlePointerHover}
        onMouseDown={(e) => {
          if (zoomLevel > 1 && !isDraggingSlider.current) {
            setIsPanning(true);
            startPanPos.current = {
              x: e.clientX - panOffset.x,
              y: e.clientY - panOffset.y,
            };
          }
        }}
        className={`relative flex-1 min-h-[460px] max-h-[640px] bg-slate-950 flex items-center justify-center overflow-hidden select-none ${
          zoomLevel > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
        }`}
      >
        
        {/* Render View Modes */}
        {viewMode === 'slider' && (
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 120ms ease-out',
            }}
          >
            {/* Base Image (Degraded 1x / Bicubic background) */}
            <img
              src={data.degradedDataUrl}
              alt="Degraded input sensor scan"
              referrerPolicy="no-referrer"
              className="max-h-[580px] max-w-[90%] object-contain pointer-events-none image-pixelated"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Overlay Image (Restored NAFNet-SR 2x) clipped by sliderPos */}
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
              style={{
                clipPath: `polygon(0% 0%, ${sliderPos}% 0%, ${sliderPos}% 100%, 0% 100%)`,
              }}
            >
              <img
                src={data.restoredDataUrl}
                alt="NAFNet-SR restored scan"
                referrerPolicy="no-referrer"
                className="max-h-[580px] max-w-[90%] object-contain image-crisp"
              />
            </div>

            {/* Split Divider Line and Draggable Thumb */}
            <div
              className="absolute top-0 bottom-0 z-20 flex flex-col items-center pointer-events-auto cursor-ew-resize"
              style={{ left: `${sliderPos}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                isDraggingSlider.current = true;
              }}
              onTouchStart={(e) => {
                isDraggingSlider.current = true;
                handleSliderMove(e.touches[0].clientX);
              }}
            >
              <div className="w-[1.5px] h-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-900 border border-cyan-400 shadow-lg flex items-center justify-center text-cyan-400">
                <Split className="w-3.5 h-3.5" />
              </div>

              {/* Labels on hover / slider */}
              <div className="absolute top-4 -left-28 px-2 py-0.5 bg-slate-950/90 border border-cyan-800/80 text-[11px] font-mono text-cyan-300 rounded shadow">
                NAFNet-SR 2× Restored
              </div>
              <div className="absolute top-4 left-4 px-2 py-0.5 bg-slate-950/90 border border-slate-700 text-[11px] font-mono text-slate-300 rounded shadow">
                Degraded Input (1×)
              </div>
            </div>
          </div>
        )}

        {viewMode === 'side-by-side' && (
          <div
            className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 p-3 items-center"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 120ms ease-out',
            }}
          >
            {/* Left: Degraded with noise metrics */}
            <div className="flex flex-col items-center justify-center bg-slate-950/60 border border-slate-800/80 rounded p-2 h-full">
              <span className="text-[11px] font-mono text-slate-400 mb-1.5 self-start px-2">
                Degraded Input · Speckle σ=0.086 · {data.degradedWidth}×{data.degradedHeight}
              </span>
              <img
                src={data.degradedDataUrl}
                alt="Degraded"
                referrerPolicy="no-referrer"
                className="max-h-[460px] object-contain rounded"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Right: Restored with PSNR/SSIM gain */}
            <div className="flex flex-col items-center justify-center bg-slate-950/60 border border-cyan-900/40 rounded p-2 h-full">
              <span className="text-[11px] font-mono text-cyan-400 mb-1.5 self-start px-2">
                NAFNet-SR Restored · PSNR {data.metrics.psnr} dB · {data.restoredWidth}×{data.restoredHeight}
              </span>
              <img
                src={data.restoredDataUrl}
                alt="Restored"
                referrerPolicy="no-referrer"
                className="max-h-[460px] object-contain rounded"
              />
            </div>
          </div>
        )}

        {viewMode === 'heatmap' && (
          <div
            className="relative w-full h-full flex flex-col items-center justify-center p-4"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={data.diffHeatmapDataUrl}
              alt="Residual error heatmap"
              referrerPolicy="no-referrer"
              className="max-h-[500px] object-contain rounded border border-slate-800"
            />
            {/* Colormap Legend */}
            <div className="absolute bottom-4 left-6 flex items-center gap-3 bg-slate-950/90 border border-slate-800 rounded px-3 py-1.5 text-[11px] font-mono">
              <span className="text-slate-400">Residual Noise Energy:</span>
              <div className="w-28 h-2.5 rounded bg-gradient-to-r from-blue-700 via-cyan-400 via-yellow-400 to-rose-600 border border-slate-700" />
              <div className="flex items-center gap-2 text-slate-300">
                <span>0.0 (Clean)</span>
                <span>→</span>
                <span>Max Extracted Speckle</span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'restored-only' && (
          <div
            className="w-full h-full flex items-center justify-center p-4"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={data.restoredDataUrl}
              alt="NAFNet-SR Restored Output"
              referrerPolicy="no-referrer"
              className="max-h-[540px] object-contain rounded border border-slate-800/80 shadow-2xl"
            />
          </div>
        )}

        {/* Viewport Overlay Footer Status */}
        <div className="absolute bottom-2 right-3 pointer-events-none">
          <div className="px-2 py-1 rounded bg-slate-950/90 border border-slate-800/90 text-[10px] font-mono text-slate-400">
            Engine: NAFNet-SR 4-stage U-Net · SimpleGate · PixelShuffle 2×
          </div>
        </div>

      </div>
    </div>
  );
};
