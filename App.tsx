
import React, { useState, useEffect } from 'react';
import { Store, Employee, PresenceEvent, Session, Role, EventType, UserProfile } from './types';
import { MOCK_STORES, MOCK_EMPLOYEES, generateMockEvents, MOCK_SESSIONS, MOCK_ADMIN, MOCK_EMPLOYEE_USER } from './services/mockData';
import { LayoutDashboard, Store as StoreIcon, Users, Settings, LogOut, Menu, X, ShieldCheck, User, Trash2 } from 'lucide-react';

// Views
import Dashboard from './views/Dashboard';
import StoreRegistry from './views/StoreRegistry';
import Login from './views/Login';
import Profile from './views/Profile';
import EmployeePortal from './views/EmployeePortal';

type View = 'DASHBOARD' | 'STORES' | 'EMPLOYEES' | 'SETTINGS' | 'PROFILE';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // View State
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data State
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [events, setEvents] = useState<PresenceEvent[]>([]);
  const [sessions] = useState<Session[]>(MOCK_SESSIONS);

  // Simulate live data fetching
  useEffect(() => {
    if (!isAuthenticated) return;

    // Load initial mock events
    setEvents(generateMockEvents());

    // Simulate incoming heartbeat every 5 seconds with random movement
    const interval = setInterval(() => {
      const now = new Date();
      const newEvent: PresenceEvent = {
        id: `evt-live-${now.getTime()}`,
        employeeId: 'emp-101',
        storeId: 'store-001',
        eventType: Math.random() > 0.95 ? EventType.EXIT : EventType.HEARTBEAT,
        timestamp: now.toISOString(),
        ssid: 'ShopNet_Staff',
        bssid: 'aa:bb:cc:dd:ee:01',
        rssi: -60 + Math.floor(Math.random() * 10),
        location: { x: Math.random() * 100, y: Math.random() * 100 } // Random movement for map demo
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (role: 'ADMIN' | 'EMPLOYEE') => {
    setIsAuthenticated(true);
    if (role === 'ADMIN') {
        setUser(MOCK_ADMIN);
    } else {
        setUser(MOCK_EMPLOYEE_USER);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('DASHBOARD');
  };

  const handleAddStore = (newStore: Store) => {
    setStores([...stores, newStore]);
  };

  const handleUpdateStore = (updatedStore: Store) => {
    setStores(stores.map(s => s.id === updatedStore.id ? updatedStore : s));
  };

  const handleDeleteStore = (id: string) => {
    setStores(stores.filter(s => s.id !== id));
  };

  const handleDeleteEmployee = (id: string) => {
      if(window.confirm("Are you sure you want to remove this employee? This action cannot be undone.")) {
          setEmployees(employees.filter(e => e.id !== id));
      }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // If user is an Employee, show only Employee Portal
  if (user && user.role !== 'Super Administrator') {
      const currentEmployee = employees.find(e => e.id === user.id);
      return (
        <EmployeePortal 
          user={user} 
          onLogout={handleLogout} 
          stores={stores}
          employee={currentEmployee}
        />
      );
  }

  // Navigation Item Component
  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => { setCurrentView(view); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-medium' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative z-30 w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 xl:w-64'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 text-white overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/50">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col lg:hidden xl:flex text-left">
                <span className="font-bold text-lg tracking-tight leading-none">EmpTrack</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Admin Portal</span>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-6 text-left">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="STORES" icon={StoreIcon} label="Store Registry" />
          <NavItem view="EMPLOYEES" icon={Users} label="Employees" />
          <NavItem view="SETTINGS" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 text-left">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium lg:hidden xl:block">Sign Out</span>
          </button>
          <div className="mt-4 px-4 lg:hidden xl:block">
             <p className="text-xs text-slate-500">Tenant: {user?.tenantName || 'Unknown'}</p>
             <p className="text-[10px] text-slate-600 font-mono mt-1">v2.3.0 (Pro)</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-950">
        {/* Top Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:bg-slate-800 rounded-md"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {currentView === 'DASHBOARD' && 'System Overview'}
              {currentView === 'STORES' && 'Store Registry Management'}
              {currentView === 'EMPLOYEES' && 'Staff Roster'}
              {currentView === 'SETTINGS' && 'System Configuration'}
              {currentView === 'PROFILE' && 'User Profile'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2 cursor-pointer" onClick={() => setCurrentView('PROFILE')}>
              <span className="text-sm font-bold text-white">{user?.name}</span>
              <span className="text-xs text-blue-400 font-medium">{user?.role}</span>
            </div>
            <button 
              onClick={() => setCurrentView('PROFILE')}
              className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold border border-slate-700 shadow-sm overflow-hidden hover:border-blue-500 transition-all"
            >
              <img src={user?.avatarUrl} className="w-full h-full object-cover" alt="Admin" />
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 custom-scrollbar">
          {currentView === 'DASHBOARD' && (
            <Dashboard 
              stores={stores} 
              employees={employees} 
              events={events} 
              sessions={sessions} 
            />
          )}
          
          {currentView === 'STORES' && (
            <StoreRegistry 
              stores={stores} 
              onAddStore={handleAddStore} 
              onUpdateStore={handleUpdateStore}
              onDeleteStore={handleDeleteStore}
            />
          )}

          {currentView === 'PROFILE' && user && (
            <Profile user={user} onLogout={handleLogout} />
          )}

          {currentView === 'EMPLOYEES' && (
            <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 overflow-hidden animate-in fade-in duration-300 flex flex-col">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                  <div className="text-left">
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider">Staff Directory</h3>
                     <p className="text-xs text-slate-500">Manage active assignments and personnel</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg shadow-blue-900/20 transition-colors">
                      Export List
                  </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Employee</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Role</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Assignments</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <img src={emp.avatarUrl} alt={emp.name} className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 group-hover:border-blue-500 transition-colors" />
                            <div>
                              <p className="text-sm font-medium text-white">{emp.name}</p>
                              <p className="text-xs text-slate-500">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className="px-2 py-1 text-[10px] font-bold bg-blue-900/20 text-blue-400 border border-blue-800/30 rounded uppercase">
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 align-middle">
                          {emp.assignedStoreIds.length} Stores
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-middle">
                            <button 
                               onClick={() => handleDeleteEmployee(emp.id)}
                               className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-950/20 rounded transition-all"
                               title="Delete Employee"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'SETTINGS' && (
             <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 p-12 text-center animate-in fade-in duration-300">
               <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                  <Settings className="w-10 h-10 text-slate-500" />
               </div>
               <h3 className="text-lg font-bold text-white">Tenant Settings</h3>
               <p className="text-slate-400 max-w-md mx-auto mt-2 mb-8 text-sm">
                 Configure global settings, rate limiting, branding, and API keys for <strong>{user?.tenantName}</strong>.
               </p>
               <div className="flex justify-center gap-4">
                 <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 font-medium text-sm">
                   Manage Tenant Profile
                 </button>
                 <button className="px-6 py-2 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors border border-slate-700 text-sm">
                   View Audit Logs
                 </button>
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
