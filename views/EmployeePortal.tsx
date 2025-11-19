
import React, { useState, useEffect } from 'react';
import { UserProfile, Shift, Session, Store, Employee } from '../types';
import { LogOut, MapPin, Clock, Wifi, Calendar, Plus, Play, Square, AlertTriangle, Signal } from 'lucide-react';
import { MOCK_SHIFTS } from '../services/mockData';

interface EmployeePortalProps {
  user: UserProfile;
  stores: Store[];
  employee?: Employee;
  onLogout: () => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ user, stores, employee, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS.filter(s => s.employeeId === user.id));
  
  // Attendance State
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<Session[]>([]);
  const [sessionDuration, setSessionDuration] = useState<string>('00:00');
  const [error, setError] = useState<string | null>(null);

  // Simulation State
  const [simulatedSSID, setSimulatedSSID] = useState<string>('');

  // Shift Management State
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShift, setNewShift] = useState<Partial<Shift>>({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00'
  });

  // Collect all unique SSIDs for simulation dropdown
  const allStoreSSIDs = Array.from(new Set(stores.flatMap(s => s.ssids)));

  // Update clock and duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (currentSession) {
        const start = new Date(currentSession.entryTime);
        const diffMs = now.getTime() - start.getTime();
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        setSessionDuration(`${diffHrs}h ${diffMins}m`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSession]);

  // Clear error on network change
  useEffect(() => {
      if (error) setError(null);
  }, [simulatedSSID]);

  // Auto-connect simulation: Connect to first authorized store SSID if available
  useEffect(() => {
    if (!simulatedSSID && !currentSession && employee) {
        const assignedStoreIds = employee.assignedStoreIds || [];
        const myStores = stores.filter(s => assignedStoreIds.includes(s.id));
        
        // Find the first matching SSID from the assigned stores to simulate auto-connection
        // This mimics the behavior of a phone auto-connecting to a known, authorized network
        const targetSSID = myStores.flatMap(s => s.ssids)[0];
        
        if (targetSSID) {
            setSimulatedSSID(targetSSID);
        }
    }
  }, [employee, stores]);

  const handleClockIn = () => {
      setError(null);

      // 1. Identify assigned stores
      const assignedStoreIds = employee?.assignedStoreIds || [];
      const myStores = stores.filter(s => assignedStoreIds.includes(s.id));

      // 2. Validate Connection
      // User must be connected to an SSID belonging to one of their assigned stores
      const authorizedStore = myStores.find(s => s.ssids.includes(simulatedSSID));

      if (!authorizedStore) {
          setError("Access Denied: You are not connected to an assigned store Wi-Fi network.");
          return;
      }

      const newSession: Session = {
          id: `sess-${Date.now()}`,
          employeeId: user.id,
          storeId: authorizedStore.id, // Use the matched store
          entryTime: new Date().toISOString(),
          dwellMinutes: 0
      };
      setCurrentSession(newSession);
  };

  const handleClockOut = () => {
      if (!currentSession) return;

      const now = new Date();
      const startTime = new Date(currentSession.entryTime);
      const durationMinutes = Math.round((now.getTime() - startTime.getTime()) / 60000);

      const completedSession: Session = {
          ...currentSession,
          exitTime: now.toISOString(),
          dwellMinutes: durationMinutes
      };

      setAttendanceHistory([completedSession, ...attendanceHistory]);
      setCurrentSession(null);
      setSessionDuration('00:00');
  };

  const handleAddShift = (e: React.FormEvent) => {
      e.preventDefault();
      if(newShift.date && newShift.startTime && newShift.endTime) {
          const shift: Shift = {
              id: `shift-${Date.now()}`,
              employeeId: user.id,
              date: newShift.date,
              startTime: newShift.startTime,
              endTime: newShift.endTime,
              status: 'SCHEDULED'
          };
          setShifts([...shifts, shift]);
          setIsAddingShift(false);
      }
  };

  const getStoreName = (id?: string) => stores.find(s => s.id === id)?.name || 'Unknown Location';
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white">{user.name}</h1>
                    <p className="text-xs text-slate-400">{user.role} • ID: {user.id}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>

        {/* Network Simulator (For Demo/Testing Purposes) */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-full text-slate-400">
                    <Signal className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-300 uppercase">Network Simulator</p>
                    <p className="text-[10px] text-slate-500">Simulate device Wi-Fi connection</p>
                </div>
            </div>
            <select 
                value={simulatedSSID}
                onChange={(e) => setSimulatedSSID(e.target.value)}
                disabled={!!currentSession}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded px-3 py-2 outline-none focus:border-blue-500 min-w-[200px]"
            >
                <option value="">-- Not Connected --</option>
                <option value="Starbucks_Free_WiFi">Starbucks_Free_WiFi</option>
                <option value="Home_Network_5G">Home_Network_5G</option>
                <optgroup label="Authorized Store Networks">
                    {allStoreSSIDs.map(ssid => (
                        <option key={ssid} value={ssid}>{ssid}</option>
                    ))}
                </optgroup>
            </select>
        </div>

        {/* Error Alert */}
        {error && (
            <div className="bg-rose-900/20 border border-rose-900/50 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-rose-400">Clock In Failed</p>
                    <p className="text-xs text-rose-300 mt-1">{error}</p>
                </div>
            </div>
        )}

        {/* Clock In/Out Status Card */}
        <div className={`rounded-2xl p-8 shadow-lg relative overflow-hidden transition-all duration-500 ${currentSession ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-900/40' : 'bg-slate-900 border border-slate-800'}`}>
            {currentSession && (
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Wifi className="w-32 h-32 text-white" />
                </div>
            )}
            
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-4 ${currentSession ? 'bg-white/10 text-white border-white/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        <span className={`w-2 h-2 rounded-full ${currentSession ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                        {currentSession ? 'On Duty' : 'Off Duty'}
                    </div>
                    
                    {currentSession && (
                         <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Current Session</p>
                            <p className="text-2xl font-mono font-bold text-white">{sessionDuration}</p>
                         </div>
                    )}
                </div>

                <h2 className={`text-4xl font-bold mb-1 ${currentSession ? 'text-white' : 'text-slate-300'}`}>
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </h2>
                <p className={`text-sm mb-8 ${currentSession ? 'text-blue-100' : 'text-slate-500'}`}>
                    {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                
                {currentSession ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white/90 bg-white/10 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
                            <MapPin className="w-5 h-5 text-emerald-300" />
                            <div>
                                <p className="text-xs text-emerald-200 font-bold uppercase">Location Detected</p>
                                <span className="font-medium text-sm">{getStoreName(currentSession.storeId)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleClockOut}
                            className="w-full bg-white text-rose-600 hover:bg-rose-50 font-bold py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Square className="w-4 h-4 fill-current" />
                            Clock Out
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                         <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/50">
                            <p className="text-xs text-slate-500 mb-1">Detected SSID</p>
                            <div className="flex items-center gap-2 text-slate-300">
                                <Wifi className="w-4 h-4" />
                                <span className="text-sm">{simulatedSSID || 'Not Connected'}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleClockIn}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Clock In
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Recent Activity (History) */}
        {attendanceHistory.length > 0 && (
             <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="font-bold text-white text-sm">Recent Activity</h3>
                </div>
                <div className="divide-y divide-slate-800">
                    {attendanceHistory.map(sess => (
                        <div key={sess.id} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-white">Shift Completed</p>
                                <p className="text-xs text-slate-500">
                                    {new Date(sess.entryTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(sess.exitTime!).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-emerald-400">{sess.dwellMinutes} min</span>
                                <p className="text-[10px] text-slate-500">Duration</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Shift Management Section */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <h3 className="font-bold text-white text-sm">Upcoming Schedule</h3>
                </div>
                <button 
                    onClick={() => setIsAddingShift(!isAddingShift)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-3 h-3" /> Add Shift
                </button>
             </div>

             {isAddingShift && (
                 <form onSubmit={handleAddShift} className="p-4 bg-slate-950/50 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                     <div>
                         <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Date</label>
                         <input 
                            type="date" 
                            required
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            value={newShift.date}
                            onChange={e => setNewShift({...newShift, date: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Start</label>
                         <input 
                            type="time" 
                            required
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            value={newShift.startTime}
                            onChange={e => setNewShift({...newShift, startTime: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">End</label>
                         <input 
                            type="time" 
                            required
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            value={newShift.endTime}
                            onChange={e => setNewShift({...newShift, endTime: e.target.value})}
                         />
                     </div>
                     <div className="sm:col-span-3 flex justify-end pt-2">
                         <button type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded font-medium transition-colors">Save Schedule</button>
                     </div>
                 </form>
             )}

             <div className="divide-y divide-slate-800">
                {shifts.length === 0 && <p className="p-4 text-center text-slate-500 text-sm">No upcoming shifts scheduled.</p>}
                {shifts.map(shift => (
                    <div key={shift.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 font-bold text-xs">
                                {new Date(shift.date).getDate()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-200">{new Date(shift.date).toLocaleDateString(undefined, {weekday: 'long', month: 'short'})}</p>
                                <p className="text-xs text-slate-500">{shift.startTime} - {shift.endTime}</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 text-[10px] font-medium bg-blue-900/20 text-blue-400 border border-blue-800/30 rounded uppercase">
                            {shift.status}
                        </span>
                    </div>
                ))}
             </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-slate-400">
                     <Clock className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Today's Duration</span>
                 </div>
                 {/* Calculating total duration from history for today + current active session */}
                 <p className="text-2xl font-bold text-white">
                    {Math.floor(
                        (attendanceHistory.reduce((acc, s) => acc + s.dwellMinutes, 0) + 
                        (currentSession ? Math.floor((currentTime.getTime() - new Date(currentSession.entryTime).getTime()) / 60000) : 0)
                        ) / 60
                    )}h {' '}
                    {
                        (attendanceHistory.reduce((acc, s) => acc + s.dwellMinutes, 0) + 
                        (currentSession ? Math.floor((currentTime.getTime() - new Date(currentSession.entryTime).getTime()) / 60000) : 0)
                        ) % 60
                    }m
                 </p>
             </div>
             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-slate-400">
                     <Calendar className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Weekly Hours</span>
                 </div>
                 <p className="text-2xl font-bold text-white">38.5 hrs</p>
             </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
            Employee Tracking App v2.3.0 <br />
            Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default EmployeePortal;
