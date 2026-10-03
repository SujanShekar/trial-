
import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Search,
  AlertCircle,
  Package,
  X,
  History,
  ShoppingCart,
  Layout,
  Filter,
  Trash2,
  Edit2,
  ChevronLeft,
  ArrowRight,
  Layers,
  Droplet,
  Brush,
  Archive,
  Minus,
  Calendar,
  Check
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { HousekeepingSupply } from '../types';

const HousekeepingPage: React.FC = () => {
  const { housekeepingSupplies, addHousekeepingSupply, updateHousekeepingSupply, deleteHousekeepingSupply, isLoading } = useAppContext();
  const [view, setView] = useState<'stock' | 'history'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'All' | 'LowStock'>('All');
  
  // -- Quick Adjust State --
  const [adjusting, setAdjusting] = useState<{ id: string, mode: 'add' | 'sub', value: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentSupply, setCurrentSupply] = useState<Partial<HousekeepingSupply>>({
    name: '',
    quantity: 0,
    minStockLevel: 0,
    unit: 'Units'
  });

  const filteredSupplies = useMemo(() => {
    return housekeepingSupplies.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilterMode = filterMode === 'All' || (filterMode === 'LowStock' && s.quantity <= s.minStockLevel);
      return matchesSearch && matchesFilterMode;
    });
  }, [housekeepingSupplies, searchTerm, filterMode]);

  const lowStockCount = useMemo(() => housekeepingSupplies.filter(s => s.quantity <= s.minStockLevel && s.minStockLevel > 0).length, [housekeepingSupplies]);

  const uniqueSupplyNames = useMemo(() => {
    const names = new Set(housekeepingSupplies.map(s => s.name));
    return Array.from(names).sort();
  }, [housekeepingSupplies]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setCurrentSupply({ name: '', quantity: 0, minStockLevel: 0, unit: 'Units' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supply: HousekeepingSupply) => {
    setModalMode('edit');
    setCurrentSupply({ ...supply });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteHousekeepingSupply(id);
    }
  };

  const handleStockUpdate = (id: string, change: number) => {
    const supply = housekeepingSupplies.find(s => s.id === id);
    if (supply) {
      const newQuantity = Math.max(0, supply.quantity + change);
      updateHousekeepingSupply({ ...supply, quantity: newQuantity });
    }
  };

  const handleConfirmAdjust = () => {
    if (!adjusting) return;
    const val = parseInt(adjusting.value) || 0;
    if (val !== 0) {
      handleStockUpdate(adjusting.id, adjusting.mode === 'add' ? val : -val);
    }
    setAdjusting(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const existingSupply = housekeepingSupplies.find(s => s.name.toLowerCase() === currentSupply.name?.toLowerCase());
      
      if (existingSupply) {
        updateHousekeepingSupply({
          ...existingSupply,
          quantity: existingSupply.quantity + Number(currentSupply.quantity),
          minStockLevel: Number(currentSupply.minStockLevel) || existingSupply.minStockLevel,
          unit: currentSupply.unit || existingSupply.unit
        });
      } else {
        const newItem: HousekeepingSupply = {
          id: `hk-${Date.now()}`,
          name: currentSupply.name!,
          quantity: Number(currentSupply.quantity),
          minStockLevel: Number(currentSupply.minStockLevel),
          unit: currentSupply.unit!
        };
        addHousekeepingSupply(newItem);
      }
    } else {
      updateHousekeepingSupply({ ...currentSupply } as HousekeepingSupply);
    }
    setIsModalOpen(false);
  };

  const getStockHealth = (s: HousekeepingSupply) => {
    const isLow = s.minStockLevel > 0 && s.quantity <= s.minStockLevel;
    
    if (isLow) return { label: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-500' };
    return { label: 'Stable', color: 'text-[#005F54]', bg: 'bg-[#005F54]' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            Facility Housekeeping
          </h1>
          <p className="text-slate-500 font-medium italic">
            Sanitation inventory tracking and supply chain management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-3 bg-[#005F54] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all active:scale-95"
          >
            <Plus size={18} /> Add Supply Item
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => { setFilterMode('All'); }}
          className={`p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 text-left transition-all duration-300 ${filterMode === 'All' ? 'bg-[#005F54] border-[#005F54] ring-4 ring-emerald-500/20' : 'bg-white border-slate-100 hover:border-slate-300'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${filterMode === 'All' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
             <Layout size={24} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${filterMode === 'All' ? 'text-emerald-100' : 'text-slate-400'}`}>Total Items</p>
            <p className={`text-2xl font-black ${filterMode === 'All' ? 'text-white' : 'text-slate-800'}`}>{housekeepingSupplies.length}</p>
          </div>
        </button>

        <button 
          onClick={() => setFilterMode('LowStock')}
          className={`p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 text-left transition-all duration-300 ${filterMode === 'LowStock' ? 'bg-rose-600 border-rose-600 ring-4 ring-rose-500/20' : 'bg-white border-slate-100 hover:border-slate-300'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${filterMode === 'LowStock' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'}`}>
             <ShoppingCart size={24} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${filterMode === 'LowStock' ? 'text-rose-100' : 'text-slate-400'}`}>Low Stock Alerts</p>
            <p className={`text-2xl font-black ${filterMode === 'LowStock' ? 'text-white' : 'text-slate-800'}`}>{lowStockCount} Items</p>
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="space-y-4">
        <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="relative flex-1 w-full">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                placeholder="Search housekeeping supplies..." 
                className="w-full pl-14 pr-6 py-4 bg-transparent outline-none font-bold text-sm text-slate-700"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Item Description</th>
                    <th className="px-8 py-6">Quick Adjust Stock</th>
                    <th className="px-8 py-6">Stock Health</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredSupplies.map(s => {
                    const health = getStockHealth(s);
                    const healthPercentage = s.minStockLevel > 0 ? Math.min((s.quantity / (s.minStockLevel * 2)) * 100, 100) : 100;
                    
                    return (
                      <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs group-hover:bg-[#005F54] group-hover:text-white transition-colors">
                                {(s.name || '?').charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{s.name}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3 w-fit bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                              {/* MINUS SECTION */}
                              {adjusting?.id === s.id && adjusting.mode === 'sub' ? (
                                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                                   <button 
                                    onClick={handleConfirmAdjust}
                                    className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-sm active:scale-90"
                                   >
                                    <Check size={14} />
                                   </button>
                                   <input 
                                    autoFocus
                                    type="number"
                                    min="0"
                                    className="w-16 h-8 px-2 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-900 focus:outline-none"
                                    value={adjusting.value}
                                    onChange={(e) => setAdjusting({ ...adjusting, value: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdjust()}
                                   />
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setAdjusting({ id: s.id, mode: 'sub', value: '' })}
                                  className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all shadow-sm active:scale-90"
                                >
                                  <Minus size={14} />
                                </button>
                              )}

                              <div className="flex flex-col items-center min-w-[60px]">
                                <span className="text-sm font-black text-slate-900 leading-none">{s.quantity}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.unit}</span>
                              </div>

                              {/* PLUS SECTION */}
                              {adjusting?.id === s.id && adjusting.mode === 'add' ? (
                                <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
                                   <input 
                                    autoFocus
                                    type="number"
                                    min="0"
                                    className="w-16 h-8 px-2 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-900 focus:outline-none"
                                    value={adjusting.value}
                                    onChange={(e) => setAdjusting({ ...adjusting, value: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdjust()}
                                   />
                                   <button 
                                    onClick={handleConfirmAdjust}
                                    className="w-8 h-8 flex items-center justify-center bg-[#005F54] text-white rounded-xl shadow-md active:scale-90"
                                   >
                                    <Check size={14} />
                                   </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setAdjusting({ id: s.id, mode: 'add', value: '' })}
                                  className="w-8 h-8 flex items-center justify-center bg-[#005F54] text-white rounded-xl hover:bg-[#004a42] transition-all shadow-md shadow-emerald-900/10 active:scale-90"
                                >
                                  <Plus size={14} />
                                </button>
                              )}

                              {adjusting?.id === s.id && (
                                <button 
                                  onClick={() => setAdjusting(null)}
                                  className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              )}
                           </div>
                           {s.minStockLevel > 0 && (
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">
                                Threshold: {s.minStockLevel} {s.unit}
                             </p>
                           )}
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                 <div 
                                   className={`h-full rounded-full transition-all duration-1000 ${health.bg}`}
                                   style={{ width: `${healthPercentage}%` }}
                                 />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-tighter ${health.color}`}>
                                {health.label}
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => handleOpenEdit(s)}
                               className="p-2.5 bg-slate-100 text-slate-500 hover:bg-[#005F54] hover:text-white rounded-xl transition-all shadow-sm"
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                               onClick={() => handleDelete(s.id)}
                               className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                             >
                                <Trash2 size={16} />
                             </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSupplies.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                           <Package size={48} className="opacity-20" />
                           <p className="text-xs font-black uppercase tracking-widest">No supplies found matching criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-[#005F54] p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">
                    {modalMode === 'add' ? 'New Supply Item' : 'Edit Inventory'}
                  </h2>
                  <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest mt-1">Housekeeping Registry</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                <input 
                  required 
                  list="supply-names-list"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all" 
                  value={currentSupply.name} 
                  onChange={e => setCurrentSupply({...currentSupply, name: e.target.value})} 
                  placeholder="e.g. White Phenyl"
                  autoComplete="off"
                />
                <datalist id="supply-names-list">
                  {uniqueSupplyNames.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</label>
                  <input 
                    type="number"
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all" 
                    value={currentSupply.quantity} 
                    onChange={e => setCurrentSupply({...currentSupply, quantity: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <AlertCircle size={12} className="text-rose-500" /> Low Stock Threshold
                  </label>
                  <input 
                    type="number"
                    required 
                    className="w-full px-5 py-4 bg-emerald-50/30 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all" 
                    value={currentSupply.minStockLevel} 
                    onChange={e => setCurrentSupply({...currentSupply, minStockLevel: Number(e.target.value)})} 
                    placeholder="Alert at level..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit of Measure</label>
                <input 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all" 
                  value={currentSupply.unit} 
                  onChange={e => setCurrentSupply({...currentSupply, unit: e.target.value})} 
                  placeholder="e.g. Liters, Kg, Units"
                />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button type="submit" className="w-full bg-[#005F54] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                  {modalMode === 'add' ? 'Register New Item' : 'Update Inventory'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingPage;
