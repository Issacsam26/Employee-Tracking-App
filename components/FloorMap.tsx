
import React from 'react';
import { Session, Employee, Store } from '../types';
import { MapPin, Image as ImageIcon } from 'lucide-react';

interface FloorMapProps {
  store: Store;
  activeSessions: Session[];
  employees: Employee[];
}

const FloorMap: React.FC<FloorMapProps> = ({ store, activeSessions, employees }) => {
  const sessionsInStore = activeSessions.filter(s => s.storeId === store.id);

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

      <div className="flex-1 flex items-center justify-center bg-slate-950 rounded-lg border border-slate-800 overflow-hidden relative p-4 min-h-[300px]">
        {/* Map Container with dynamic scaling */}
        {/* 
            We use auto width/height with max-100% and aspect-ratio to ensure the container 
            fits within the parent while maintaining the correct proportions.
        */}
        <div 
            className="relative shadow-2xl rounded-lg overflow-hidden bg-slate-900 transition-all duration-300"
            style={{ 
                aspectRatio: store.floorPlanAspectRatio || 1.5,
                height: 'auto',
                width: 'auto',
                maxHeight: '100%',
                maxWidth: '100%',
            }}
        >
            {store.floorPlanUrl ? (
                 <img 
                    src={store.floorPlanUrl} 
                    alt="Floor Plan" 
                    className="w-full h-full object-cover block" 
                 />
            ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-700 min-h-[300px]">
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
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out group cursor-pointer z-10"
                        style={{ left: `${x}%`, top: `${y}%` }}
                    >
                        {/* Pulse Effect */}
                        <div className="absolute inset-0 rounded-full bg-blue-500 opacity-50 animate-ping w-full h-full"></div>
                        
                        {/* Avatar Dot */}
                        <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden bg-slate-800 z-10 ring-2 ring-black/20 hover:scale-110 transition-transform duration-200">
                            <img src={employee?.avatarUrl} alt={employee?.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                            <p className="font-semibold">{employee?.name}</p>
                            <div className="text-[10px] text-slate-400">{session.dwellMinutes} min dwell</div>
                        </div>
                    </div>
                );
            })}

            {sessionsInStore.length === 0 && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white border border-white/10">
                    No active staff
                </div>
            )}
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
      </div>
    </div>
  );
};

export default FloorMap;
