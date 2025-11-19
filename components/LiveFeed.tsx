import React from 'react';
import { EventType, PresenceEvent, Store, Employee } from '../types';
import { Wifi, LogIn, LogOut, Activity } from 'lucide-react';

interface LiveFeedProps {
  events: PresenceEvent[];
  stores: Store[];
  employees: Employee[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ events, stores, employees }) => {
  const getIcon = (type: EventType) => {
    switch (type) {
      case EventType.ENTRY: return <LogIn className="w-4 h-4 text-emerald-400" />;
      case EventType.EXIT: return <LogOut className="w-4 h-4 text-rose-400" />;
      case EventType.HEARTBEAT: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;
  const getStoreName = (id: string) => stores.find(s => s.id === id)?.name || id;

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Wifi className="w-5 h-5 text-blue-500" />
          Live Event Feed
        </h3>
        <span className="text-xs text-blue-200 bg-blue-900/30 border border-blue-800/50 px-2 py-1 rounded-full">Real-time</span>
      </div>
      <div className="overflow-y-auto p-4 space-y-3 flex-1 custom-scrollbar">
        {events.length === 0 && <p className="text-slate-500 text-center py-4">No recent events</p>}
        {events.map((evt) => (
          <div key={evt.id} className="flex items-start gap-3 text-sm border-b border-slate-800 pb-3 last:border-0 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="mt-1 bg-slate-800 p-1.5 rounded-md border border-slate-700">
              {getIcon(evt.eventType)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-200">{getEmployeeName(evt.employeeId)}</span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                {evt.eventType} @ <span className="font-medium text-slate-300">{getStoreName(evt.storeId)}</span>
              </p>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                  RSSI: {evt.rssi}dBm
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                  BSSID: {evt.bssid}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;