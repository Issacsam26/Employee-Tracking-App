
import React, { useState, useRef } from 'react';
import { Session, Employee, Store } from '../types';
import { MapPin, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface FloorMapProps {
  store: Store;
  activeSessions: Session[];
  employees: Employee[];
}

const FloorMap: React.FC<FloorMapProps> = ({ store, activeSessions, employees }) => {
  const sessionsInStore = activeSessions.filter(s => s.storeId === store.id);

  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 text-left">
            <MapPin className="w-5 h-5 text-blue-500" />
            Real-Time Floor Map
          </h3>
          <p className="text-sm text-slate-400 text-left">Live employee tracking • {store.name}</p>
        </div>
        <div className="flex items-center gap-2">
             <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <span className="text-xs text-slate-400 font-mono uppercase">Live</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-slate-950 rounded-lg border border-slate-800 overflow-hidden w-full min-h-[300px] group">
        
        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-slate-900/90 p-1.5 rounded-lg border border-slate-700 shadow-xl backdrop-blur-sm">
            <button onClick={handleZoomIn} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={handleReset} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Reset View">
                <RotateCcw className="w-4 h-4" />
            </button>
        </div>
        
        {/* Hint Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-black/50 px-2 py-1 rounded text-[10px] text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Drag to pan</span>
        </div>

        <div 
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                className="relative shadow-2xl rounded-lg transition-transform duration-100 ease-out origin-center"
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    aspectRatio: store.floorPlanAspectRatio || 1.5,
                    width: '80%', // Base width relative to container
                }}
            >
                {store.floorPlanUrl ? (
                     <img 
                        src={store.floorPlanUrl} 
                        alt="Floor Plan" 
                        className="w-full h-full object-cover block rounded-lg pointer-events-none select-none" 
                     />
                ) : (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-700 rounded-lg border border-slate-800">
                        <div className="opacity-10 absolute inset-0" style={{ 
                            backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
                            backgroundSize: '40px 40px' 
                        }} />
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-xs font-mono">No Floor Plan Uploaded</p>
                    </div>
                )}

                {/* Employee Dots */}
                {sessionsInStore.map(session => {
                    const employee = employees.find(e => e.id === session.employeeId);
                    const x = session.lastKnownLocation?.x ?? 50;
                    const y = session.lastKnownLocation?.y ?? 50;

                    return (
                        <div 
                            key={session.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out group/pin cursor-pointer z-10"
                            style={{ left: `${x}%`, top: `${y}%` }}
                        >
                            {/* Pulse Effect - Scale inversed to maintain visual size if desired, but here we scale with map */}
                            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-50 animate-ping w-full h-full"></div>
                            
                            {/* Avatar Dot - Fixed size relative to map scale? No, let it zoom for inspection. */}
                            <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden bg-slate-800 z-10 ring-2 ring-black/20 hover:scale-110 transition-transform duration-200">
                                <img src={employee?.avatarUrl} alt={employee?.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Tooltip - Scale inversed to keep text readable? */}
                            <div 
                                className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap border border-slate-700 opacity-0 group-hover/pin:opacity-100 transition-opacity z-30 pointer-events-none"
                                style={{ transform: `translate(-50%, 0) scale(${1/scale})`, transformOrigin: 'bottom center' }}
                            >
                                <p className="font-semibold">{employee?.name}</p>
                                <div className="text-[10px] text-slate-400">{session.dwellMinutes} min dwell</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-4 text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Floor Plan</span>
          </div>
          <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Active Staff</span>
          </div>
          <div className="flex-1 text-right text-[10px] font-mono opacity-50">
              {Math.round(scale * 100)}% Zoom • {position.x.toFixed(0)},{position.y.toFixed(0)}
          </div>
      </div>
    </div>
  );
};

export default FloorMap;
