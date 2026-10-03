import React, { useRef, useState, useEffect, useCallback } from 'react';
import { soundManager } from '../lib/audio';
import { Pencil, Brush, Eraser, RotateCcw, Trash2, Undo2 } from 'lucide-react';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface CanvasStroke {
  tool: 'pencil' | 'brush' | 'eraser';
  color: string;
  size: number;
  points: StrokePoint[];
}

interface DrawingCanvasProps {
  isDrawer: boolean;
  onStrokeComplete?: (stroke: CanvasStroke) => void;
  onClear?: () => void;
  onUndo?: () => void;
  incomingStrokes?: CanvasStroke[];
  disabled?: boolean;
}

// Strictly curated vibrant colors - NO PURPLE ANYWHERE
export const CANVAS_PALETTE = [
  { name: 'Charcoal', hex: '#1E293B' },
  { name: 'Sunny Yellow', hex: '#FACC15' },
  { name: 'Golden Amber', hex: '#F59E0B' },
  { name: 'Vibrant Orange', hex: '#F97316' },
  { name: 'Coral Red', hex: '#EF4444' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Lime Green', hex: '#84CC16' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Electric Blue', hex: '#2563EB' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Warm Brown', hex: '#92400E' },
  { name: 'White Chalk', hex: '#FFFFFF' }
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isDrawer,
  onStrokeComplete,
  onClear,
  onUndo,
  incomingStrokes = [],
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'brush' | 'eraser'>('pencil');
  const [selectedColor, setSelectedColor] = useState<string>('#1E293B');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<CanvasStroke | null>(null);

  // Redraw all strokes from history
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background to clean sketchbook cream/white
    ctx.fillStyle = '#FAF7EE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid/sketchbook texture lines subtly
    ctx.strokeStyle = 'rgba(226, 217, 197, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 40; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render strokes
    incomingStrokes.forEach(stroke => {
      if (stroke.points.length < 1) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.strokeStyle = '#FAF7EE';
        ctx.lineWidth = stroke.size * 3;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.tool === 'brush' ? stroke.size * 2 : stroke.size;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [incomingStrokes]);

  useEffect(() => {
    redrawCanvas();
  }, [incomingStrokes, redrawCanvas]);

  // Coordinate normalizer relative to 800x500 virtual canvas resolution
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer || disabled) return;
    setIsDrawing(true);
    const coords = getCanvasCoords(e);

    const newStroke: CanvasStroke = {
      tool: selectedTool,
      color: selectedColor,
      size: brushSize,
      points: [coords]
    };
    currentStrokeRef.current = newStroke;

    soundManager.playDrawStroke();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedTool === 'eraser' ? '#FAF7EE' : selectedColor;
    ctx.lineWidth = selectedTool === 'eraser' ? brushSize * 3 : (selectedTool === 'brush' ? brushSize * 2 : brushSize);
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer || disabled || !currentStrokeRef.current) return;
    const coords = getCanvasCoords(e);
    currentStrokeRef.current.points.push(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !isDrawer || disabled) return;
    setIsDrawing(false);

    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      if (onStrokeComplete) {
        onStrokeComplete(currentStrokeRef.current);
      }
    }
    currentStrokeRef.current = null;
  };

  const handleClear = () => {
    if (confirm('Clear the entire canvas?')) {
      if (onClear) onClear();
      redrawCanvas();
      soundManager.playPop();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 w-full max-w-5xl mx-auto items-stretch">
      {/* Drawing Toolbar (Only active for the drawer) */}
      {isDrawer && !disabled && (
        <div className="flex lg:flex-col items-center justify-between lg:justify-start gap-2 bg-slate-900 border-2 border-slate-700 p-2.5 rounded-2xl shadow-sketch-lg overflow-x-auto select-none">
          {/* Tool Selection */}
          <div className="flex lg:flex-col gap-1.5 border-b-0 lg:border-b-2 border-slate-700 pb-0 lg:pb-2">
            <button
              onClick={() => {
                setSelectedTool('pencil');
                soundManager.playPop();
              }}
              className={`p-2.5 rounded-xl transition-all border-2 ${
                selectedTool === 'pencil'
                  ? 'bg-amber-400 text-slate-950 border-slate-900 shadow-sketch'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Pencil Tool"
            >
              <Pencil className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setSelectedTool('brush');
                soundManager.playPop();
              }}
              className={`p-2.5 rounded-xl transition-all border-2 ${
                selectedTool === 'brush'
                  ? 'bg-sky-400 text-slate-950 border-slate-900 shadow-sketch'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Paint Brush"
            >
              <Brush className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setSelectedTool('eraser');
                soundManager.playPop();
              }}
              className={`p-2.5 rounded-xl transition-all border-2 ${
                selectedTool === 'eraser'
                  ? 'bg-rose-500 text-white border-slate-900 shadow-sketch'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          {/* Color Palette (12 vibrant painty colors) */}
          <div className="grid grid-cols-6 lg:grid-cols-2 gap-1.5 border-b-0 lg:border-b-2 border-slate-700 pb-0 lg:pb-2 px-1">
            {CANVAS_PALETTE.map(color => (
              <button
                key={color.hex}
                onClick={() => {
                  setSelectedColor(color.hex);
                  if (selectedTool === 'eraser') setSelectedTool('pencil');
                  soundManager.playPop();
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${
                  selectedColor === color.hex && selectedTool !== 'eraser'
                    ? 'border-white scale-125 ring-2 ring-amber-400'
                    : 'border-slate-800'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          {/* Brush Sizes */}
          <div className="flex lg:flex-col items-center gap-1.5 border-b-0 lg:border-b-2 border-slate-700 pb-0 lg:pb-2">
            {[2, 4, 8, 14].map(sz => (
              <button
                key={sz}
                onClick={() => {
                  setBrushSize(sz);
                  soundManager.playPop();
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 ${
                  brushSize === sz
                    ? 'bg-amber-400 border-slate-900 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <div
                  className="rounded-full bg-slate-900"
                  style={{ width: `${Math.min(sz * 1.5, 18)}px`, height: `${Math.min(sz * 1.5, 18)}px` }}
                />
              </button>
            ))}
          </div>

          {/* Undo & Clear */}
          <div className="flex lg:flex-col gap-1.5">
            <button
              onClick={() => {
                if (onUndo) onUndo();
                soundManager.playPop();
              }}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border-2 border-slate-700 hover:bg-slate-700 hover:text-white"
              title="Undo Stroke"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleClear}
              className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border-2 border-rose-500/40 hover:bg-rose-500 hover:text-white"
              title="Clear Canvas"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Sketchbook Canvas Area */}
      <div className="relative flex-1 bg-sketch-paper rounded-3xl p-3 border-4 border-slate-900 shadow-sketch-lg overflow-hidden">
        {/* Sketchbook top spiral holes effect */}
        <div className="absolute top-2 left-4 right-4 flex justify-around pointer-events-none opacity-40">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-slate-400/80 border border-slate-600" />
          ))}
        </div>

        <div className="w-full h-full pt-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`w-full h-auto max-h-[500px] rounded-2xl bg-[#FAF7EE] touch-none select-none ${
              isDrawer ? 'cursor-crosshair' : 'cursor-default'
            }`}
            style={{
              aspectRatio: '800 / 500',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        {!isDrawer && (
          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-amber-400/40 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Whiteboard Sync
          </div>
        )}
      </div>
    </div>
  );
};
