
import React, { useState } from 'react';
import { Store } from '../types';
import { Plus, MapPin, Trash2, Wifi, Edit2, Save, Target, X, Signal, Upload, Image as ImageIcon, Layout } from 'lucide-react';

interface StoreRegistryProps {
  stores: Store[];
  onAddStore: (store: Store) => void;
  onUpdateStore: (store: Store) => void;
  onDeleteStore: (id: string) => void;
}

const StoreRegistry: React.FC<StoreRegistryProps> = ({ stores, onAddStore, onUpdateStore, onDeleteStore }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Store>>({
    name: '',
    rssiThreshold: -75,
    geofence: { lat: 0, lng: 0, radius: 50 },
    floorPlanUrl: '',
    floorPlanAspectRatio: 1.5
  });
  const [rawSSIDs, setRawSSIDs] = useState('');
  const [rawBSSIDs, setRawBSSIDs] = useState('');

  // Handle opening form for Create
  const handleStartAdd = () => {
    setFormData({
        name: '',
        rssiThreshold: -75,
        geofence: { lat: 0, lng: 0, radius: 50 },
        floorPlanUrl: '',
        floorPlanAspectRatio: 1.5
    });
    setRawSSIDs('');
    setRawBSSIDs('');
    setEditingId(null);
    setIsFormOpen(true);
  };

  // Handle opening form for Edit
  const handleStartEdit = (store: Store) => {
      setFormData({
          name: store.name,
          rssiThreshold: store.rssiThreshold,
          geofence: { ...store.geofence },
          floorPlanUrl: store.floorPlanUrl,
          floorPlanAspectRatio: store.floorPlanAspectRatio
      });
      setRawSSIDs(store.ssids.join(', '));
      setRawBSSIDs(store.bssids.join(', '));
      setEditingId(store.id);
      setIsFormOpen(true);
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Create an image to get dimensions
        const img = new Image();
        img.onload = () => {
           const aspectRatio = img.width / img.height;
           setFormData(prev => ({
               ...prev,
               floorPlanUrl: result,
               floorPlanAspectRatio: aspectRatio
           }));
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const commonData = {
        tenantId: 'tenant-current',
        name: formData.name || 'Unnamed Store',
        ssids: rawSSIDs.split(',').map(s => s.trim()).filter(Boolean),
        bssids: rawBSSIDs.split(',').map(s => s.trim()).filter(Boolean),
        rssiThreshold: formData.rssiThreshold || -75,
        geofence: {
            lat: Number(formData.geofence?.lat || 0),
            lng: Number(formData.geofence?.lng || 0),
            radius: Number(formData.geofence?.radius || 50)
        },
        floorPlanUrl: formData.floorPlanUrl,
        floorPlanAspectRatio: formData.floorPlanAspectRatio || 1.5
    };

    if (editingId) {
        // Update existing
        onUpdateStore({
            ...commonData,
            id: editingId
        });
    } else {
        // Create new
        onAddStore({
            ...commonData,
            id: `store-${Date.now()}`
        });
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800 backdrop-blur-sm">
        <div className="text-left">
          <h2 className="text-lg font-bold text-white">Store Registry</h2>
          <p className="text-xs text-slate-400">Manage authorized locations and configuration.</p>
        </div>
        {!isFormOpen && (
            <button 
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
            >
            <Plus className="w-4 h-4" />
            New Store
            </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-800 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                {editingId ? <Edit2 className="w-4 h-4 text-amber-500" /> : <Target className="w-4 h-4 text-blue-500" />}
                {editingId ? 'Edit Store Configuration' : 'Register New Store'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Basic Info */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Store Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-md p-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-600 text-sm"
                placeholder="e.g. Times Square Branch"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            {/* RSSI Config */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-2 uppercase tracking-wide">
                 <Signal className="w-3 h-3" />
                 RSSI Sensitivity
              </label>
              <div className="flex gap-4 items-center">
                  <input 
                    type="range"
                    min="-100"
                    max="-40"
                    step="1"
                    className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    value={formData.rssiThreshold}
                    onChange={e => setFormData({...formData, rssiThreshold: Number(e.target.value)})}
                  />
                  <div className="w-20">
                    <input 
                        type="number" 
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-md p-2.5 focus:ring-1 focus:ring-blue-500 outline-none text-center font-mono text-sm"
                        value={formData.rssiThreshold}
                        onChange={e => setFormData({...formData, rssiThreshold: Number(e.target.value)})}
                    />
                  </div>
              </div>
            </div>

            {/* WiFi Config */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Authorized SSIDs</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-md p-2.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none placeholder-slate-600"
                placeholder="Staff_WiFi, Secure_Store_Net"
                value={rawSSIDs}
                onChange={e => setRawSSIDs(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Authorized BSSIDs (MAC Addresses)</label>
              <textarea 
                required
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-md p-2.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none h-20 placeholder-slate-600"
                placeholder="aa:bb:cc:dd:ee:ff, 11:22:33:44:55:66"
                value={rawBSSIDs}
                onChange={e => setRawBSSIDs(e.target.value)}
              />
            </div>

            {/* Floor Plan Upload */}
             <div className="col-span-2 bg-slate-950/30 p-4 rounded-md border border-slate-800/50">
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Layout className="w-3 h-3 text-indigo-500" />
                    Floor Plan Setup
                </h4>
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                         <label className="block w-full cursor-pointer bg-slate-900 border border-dashed border-slate-700 hover:border-blue-500 rounded-md p-4 transition-all text-center group">
                            <Upload className="w-5 h-5 text-slate-500 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                            <span className="text-xs text-slate-400 group-hover:text-slate-300 font-medium">Upload Image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    {formData.floorPlanUrl && (
                        <div className="w-32 h-20 bg-slate-900 rounded border border-slate-700 overflow-hidden relative">
                            <img src={formData.floorPlanUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, floorPlanUrl: '', floorPlanAspectRatio: 1.5})}
                                className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-0.5 rounded transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Geofence Config */}
            <div className="col-span-2 bg-slate-950/30 p-4 rounded-md border border-slate-800/50">
               <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                 <MapPin className="w-3 h-3 text-blue-500" />
                 Geofence Coordinates
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      placeholder="40.7128"
                      value={formData.geofence?.lat}
                      onChange={e => setFormData({
                        ...formData, 
                        geofence: { ...formData.geofence!, lat: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      placeholder="-74.0060"
                      value={formData.geofence?.lng}
                      onChange={e => setFormData({
                        ...formData, 
                        geofence: { ...formData.geofence!, lng: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase">Radius (m)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      placeholder="50"
                      value={formData.geofence?.radius}
                      onChange={e => setFormData({
                        ...formData, 
                        geofence: { ...formData.geofence!, radius: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
               </div>
            </div>

            <div className="col-span-2 flex justify-end gap-3 mt-2 border-t border-slate-800 pt-4">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-md text-sm transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md shadow-lg shadow-blue-900/20 transition-all font-medium text-sm"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Store' : 'Save Store'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
        {stores.map(store => (
          <div key={store.id} className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-900/20 border border-blue-800/50 p-2 rounded group-hover:bg-blue-900/40 transition-colors">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{store.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {store.id}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                    onClick={() => handleStartEdit(store)}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-all" 
                    title="Edit Store"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                    onClick={() => onDeleteStore(store.id)} 
                    className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-950/30 rounded transition-all"
                    title="Delete Store"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Params */}
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Parameters</p>
                    <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                        {store.tenantId}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded border border-slate-800 flex items-center gap-1.5">
                    <Wifi className="w-3 h-3 text-emerald-500" /> {store.ssids.length} SSIDs
                  </span>
                  <span className="px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded border border-slate-800 flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-indigo-500" /> {store.bssids.length} APs
                  </span>
                   <span className="px-2 py-1 bg-slate-950 text-amber-400 border border-slate-800 text-xs rounded flex items-center gap-1.5">
                    <Signal className="w-3 h-3" /> {store.rssiThreshold} dBm
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/30 p-3 rounded border border-slate-800/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Geofence Zone
                </p>
                <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-300 font-mono">
                        {store.geofence.lat.toFixed(4)}, {store.geofence.lng.toFixed(4)}
                    </div>
                    <div className="text-[10px] text-blue-300 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-900/30">
                        Radius: {store.geofence.radius}m
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreRegistry;