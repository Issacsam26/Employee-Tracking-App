import React from 'react';
import { UserProfile } from '../types';
import { User, Mail, Shield, Building, Key, LogOut, Bell } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden shadow-xl">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Online"></div>
        </div>
        <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-400 flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-blue-400" />
                {user.role} 
                <span className="text-slate-600">•</span> 
                <span className="text-slate-500">{user.tenantName}</span>
            </p>
        </div>
        <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-900/20 text-rose-400 border border-rose-900/50 rounded-lg hover:bg-rose-900/40 transition-colors"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Info Card */}
        <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Personal Information
                </h3>
                <button className="text-xs text-blue-400 hover:text-blue-300">Edit Details</button>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</label>
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm">
                            {user.name}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Role</label>
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm">
                            {user.role}
                        </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</label>
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            {user.email}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Organization Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-6">
                <Building className="w-5 h-5 text-indigo-500" />
                Organization
            </h3>
            
            <div className="space-y-4">
                <div className="p-3 bg-indigo-900/10 border border-indigo-900/30 rounded-lg">
                    <p className="text-xs text-indigo-300 mb-1">Tenant Name</p>
                    <p className="font-medium text-white">{user.tenantName}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Tenant ID</p>
                    <p className="font-mono text-xs text-slate-300">{user.tenantId}</p>
                </div>
            </div>
        </div>

        {/* Security Settings */}
        <div className="md:col-span-3 bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
             <h3 className="font-semibold text-white flex items-center gap-2 mb-6">
                <Key className="w-5 h-5 text-amber-500" />
                Security & Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-2">Password</h4>
                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-sm text-white">**************</span>
                            <span className="text-xs text-slate-500">Last changed 3 months ago</span>
                        </div>
                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded border border-slate-700 transition-colors">
                            Change
                        </button>
                    </div>
                </div>

                 <div className="space-y-4">
                    <h4 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-2">Notifications</h4>
                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded text-slate-400">
                                <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-white">Email Alerts</span>
                                <span className="text-xs text-slate-500">Receive weekly summaries</span>
                            </div>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-5"/>
                            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-blue-600 cursor-pointer"></label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;