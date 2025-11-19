
import React, { useState } from 'react';
import { Employee, PresenceEvent, Session, Store } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Building, Clock, Sparkles, Download, Activity, Wifi, MapPin } from 'lucide-react';
import { generateStaffingInsight } from '../services/geminiService';
import LiveFeed from '../components/LiveFeed';
import FloorMap from '../components/FloorMap';

interface DashboardProps {
  stores: Store[];
  employees: Employee[];
  events: PresenceEvent[];
  sessions: Session[];
}

const Dashboard: React.FC<DashboardProps> = ({ stores, employees, events, sessions }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Calculate Stats
  const activeSessions = sessions.filter(s => !s.exitTime).length;
  const avgDwellTime = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.dwellMinutes, 0) / sessions.length) 
    : 0;

  const chartData = [
    { name: '08:00', visitors: 2 },
    { name: '10:00', visitors: 5 },
    { name: '12:00', visitors: 8 },
    { name: '14:00', visitors: 6 },
    { name: '16:00', visitors: 9 },
    { name: '18:00', visitors: 4 },
  ];

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    const insight = await generateStaffingInsight(sessions, events, stores);
    setAiInsight(insight);
    setIsLoadingAi(false);
  };

  const downloadReport = () => {
    // Helper to escape commas for CSV
    const safeText = (text: string) => `"${text.replace(/"/g, '""')}"`;

    // Helper for friendly date formats
    const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // 1. Summary Section (Top of CSV)
    const summaryRows = [
      ['EMPLOYEE ATTENDANCE REPORT'],
      [`Generated On,${new Date().toLocaleString()}`],
      [`Total Locations,${stores.length}`],
      [`Total Shifts Recorded,${sessions.length}`],
      [`Average Shift Duration,${avgDwellTime} minutes`],
      [] // Empty row for spacing
    ];

    // 2. Data Headers
    const headers = [
      'Employee Name', 
      'Employee ID', 
      'Store Location', 
      'Date', 
      'Time In', 
      'Time Out', 
      'Duration (Mins)', 
      'Status'
    ];

    // 3. Data Rows
    const dataRows = sessions.map(session => {
      const emp = employees.find(e => e.id === session.employeeId);
      const store = stores.find(s => s.id === session.storeId);
      
      return [
        safeText(emp?.name || 'Unknown'),
        safeText(session.employeeId),
        safeText(store?.name || 'Unknown'),
        formatDate(session.entryTime),
        formatTime(session.entryTime),
        session.exitTime ? formatTime(session.exitTime) : 'Active',
        session.dwellMinutes,
        session.exitTime ? 'Completed' : 'Active / On-Site'
      ].join(',');
    });

    // Combine all parts
    const csvContent = [
      ...summaryRows.map(row => row.join(',')),
      headers.join(','),
      ...dataRows
    ].join('\n');

    // Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Column: Stats & Charts (Takes 2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800 backdrop-blur-sm">
            <div>
                <h2 className="text-lg font-bold text-white">System Overview</h2>
                <p className="text-xs text-slate-400">Real-time presence and attendance analytics</p>
            </div>
            <button 
                onClick={downloadReport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
            >
                <Download className="w-4 h-4" />
                Export Report
            </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 shadow-sm hover:border-blue-500/30 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Staff</span>
                <div className="p-1.5 bg-emerald-900/20 text-emerald-400 rounded border border-emerald-800/30">
                    <Users className="w-4 h-4" />
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold text-white tracking-tight">{activeSessions}</p>
                 <span className="text-sm text-slate-500 font-medium">/ {employees.length}</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(activeSessions / employees.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 shadow-sm hover:border-blue-500/30 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Locations</span>
                <div className="p-1.5 bg-blue-900/20 text-blue-400 rounded border border-blue-800/30">
                    <Building className="w-4 h-4" />
                </div>
            </div>
             <p className="text-3xl font-bold text-white tracking-tight">{stores.length}</p>
             <p className="text-xs text-slate-500 mt-2">Monitored Zones</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 shadow-sm hover:border-blue-500/30 transition-colors">
             <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Duration</span>
                <div className="p-1.5 bg-amber-900/20 text-amber-400 rounded border border-amber-800/30">
                    <Clock className="w-4 h-4" />
                </div>
            </div>
             <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold text-white tracking-tight">{avgDwellTime}</p>
                 <span className="text-sm text-slate-500 font-medium">min</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Per session average</p>
          </div>
        </div>

        {/* Middle Section: Chart & Floor Map */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attendance Volume</h3>
                    <Activity className="w-4 h-4 text-slate-500" />
                </div>
                <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                        <Tooltip 
                        cursor={{fill: '#1e293b'}}
                        contentStyle={{borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'}}
                        itemStyle={{color: '#fff'}}
                        />
                        <Bar dataKey="visitors" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={30} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Floor Map (Visualizing the first store for demo) */}
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-sm">
                 <FloorMap 
                    store={stores[0]} 
                    activeSessions={sessions} 
                    employees={employees} 
                />
            </div>
        </div>
        
        {/* Attendance Table Preview */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Attendance</h3>
                <span className="text-xs text-slate-500">Last 24 Hours</span>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-400">
                     <thead className="bg-slate-950 text-slate-500 font-medium">
                         <tr>
                             <th className="px-6 py-3 font-medium">Employee</th>
                             <th className="px-6 py-3 font-medium">Login Time</th>
                             <th className="px-6 py-3 font-medium">Logoff Time</th>
                             <th className="px-6 py-3 font-medium">Duration</th>
                             <th className="px-6 py-3 font-medium">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                        {sessions.slice(0, 5).map(session => {
                            const emp = employees.find(e => e.id === session.employeeId);
                            return (
                                <tr key={session.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-200">{emp?.name || 'Unknown'}</td>
                                    <td className="px-6 py-3 font-mono text-xs">{new Date(session.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                    <td className="px-6 py-3 font-mono text-xs">{session.exitTime ? new Date(session.exitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                                    <td className="px-6 py-3 font-mono text-xs">{session.dwellMinutes}m</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${session.exitTime ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30'}`}>
                                            {session.exitTime ? 'Offline' : 'Online'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                     </tbody>
                 </table>
             </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-r from-indigo-950/50 to-slate-900 p-6 rounded-lg border border-indigo-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500/20 p-1.5 rounded">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-indigo-100 uppercase tracking-wider">Staffing Intelligence</h3>
            </div>
            <button 
              onClick={handleGenerateInsight}
              disabled={isLoadingAi}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-4 py-2 rounded transition-colors disabled:opacity-50 shadow-lg shadow-indigo-900/20 font-medium"
            >
              {isLoadingAi ? 'Analyzing Data...' : 'Run AI Analysis'}
            </button>
          </div>
          
          {aiInsight ? (
            <div className="prose prose-sm prose-invert max-w-none relative z-10 text-slate-300 leading-relaxed bg-indigo-950/30 p-4 rounded border border-indigo-900/30">
              <div className="whitespace-pre-line">{aiInsight}</div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm relative z-10 max-w-xl">
              Generate insights to analyze staffing efficiency, dwell times, and signal quality issues based on the latest RSSI data collected from your stores.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Live Feed (Takes 1/3 width) */}
      <div className="h-[600px] lg:h-auto bg-slate-900 rounded-lg border border-slate-800 shadow-sm overflow-hidden">
        <LiveFeed events={events} stores={stores} employees={employees} />
      </div>
    </div>
  );
};

export default Dashboard;
