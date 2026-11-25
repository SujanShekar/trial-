
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Pill, 
  AlertCircle, 
  Plus, 
  Search, 
  History, 
  ChevronRight, 
  Lock,
  LayoutGrid,
  ArrowLeft,
  Clock,
  FileSearch,
  ChevronLeft,
  Calendar,
  Trash2,
  Edit,
  Minus,
  Check,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { findDuplicate } from '../lib/uniqueness';
import { User as UserType, Medicine, MedicineUsage } from '../types';

interface InventoryPageProps {
  user: UserType;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { medicines, medicineUsage, updateMedicineQuantity, deleteMedicine, isLoading } = useAppContext();
  const [view, setView] = useState<'stock' | 'history'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  
  // -- Stock State --
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // -- Quick Adjust State --
  const [adjusting, setAdjusting] = useState<{ id: string, mode: 'add' | 'sub', value: string } | null>(null);

  // -- History State --
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('All');

  const isAdmin = user.role === 'Admin';
  const isDoctor = user.role === 'Doctor';
  const isDataEntry = user.role === 'Data Entry';
  const canManage = isAdmin || isDoctor || isDataEntry;

  // Handle incoming filter state from Dashboard
  useEffect(() => {
    const state = location.state as { filter?: string } | null;
    if (state?.filter === 'LowStock') {
      setShowOnlyLowStock(true);
      setSelectedCategory('All');
      // Clear state so manual refreshes don't keep the filter locked
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, showOnlyLowStock]);

  const getMedicineStatus = (med: Medicine) => {
    const isLow = med.quantity <= med.minStockLevel;

    if (isLow) {
      return { label: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-500' };
    }

    return { label: 'Good', color: 'text-[#005F54]', bg: 'bg-[#005F54]' };
  };

  // Extract unique categories for filter buttons - Keeping 'Others' at the last
  const categoriesData = useMemo(() => {
    const counts: Record<string, number> = {};
    medicines.forEach(m => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    const categories = Object.entries(counts).map(([name, count]) => ({ name, count }));
    
    // Move 'Others' to the end if it exists
    const othersIndex = categories.findIndex(c => c.name === 'Others');
    if (othersIndex !== -1) {
      const others = categories.splice(othersIndex, 1)[0];
      categories.push(others);
    }
    
    return categories;
  }, [medicines]);

  // Extract unique categories for History Dropdown
  const allCategories = useMemo(() => {
    const cats = new Set(medicines.map(m => m.category));
    const sortedCats = Array.from(cats).sort();
    
    // Ensure 'Others' is at the end of the array if it exists
    const othersIndex = sortedCats.indexOf('Others');
    if (othersIndex !== -1) {
      sortedCats.splice(othersIndex, 1);
      sortedCats.push('Others');
    }

    return ['All', ...sortedCats];
  }, [medicines]);

  const lowStockCount = medicines.filter(m => m.quantity <= m.minStockLevel).length;

  // -- Stock Filtering Logic --
  const filteredMeds = useMemo(() => {
    return medicines.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            findDuplicate(searchTerm, [med.name]) === med.name ||
                            med.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
      const matchesLowStock = !showOnlyLowStock || med.quantity <= med.minStockLevel;
      
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [medicines, searchTerm, selectedCategory, showOnlyLowStock]);

  // -- Pagination Logic --
  const totalPages = Math.ceil(filteredMeds.length / ITEMS_PER_PAGE);
  const paginatedMeds = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMeds.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMeds, currentPage]);

  // -- History Filtering Logic --
  const filteredHistory = useMemo(() => {
    return medicineUsage.filter(log => {
      // Find the medicine to check its category
      const associatedMed = medicines.find(m => m.name === log.medicineName || m.id === log.medicineId);
      const medCategory = associatedMed ? associatedMed.category : 'Unknown';

      const matchesSearch = log.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.takenBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = historyCategoryFilter === 'All' || medCategory === historyCategoryFilter;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      return b.dateTime.localeCompare(a.dateTime);
    });
  }, [searchTerm, historyCategoryFilter, medicines, medicineUsage]);

  // -- Handlers --

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setShowOnlyLowStock(false);
  };

  const handleLowStockFilter = () => {
    setShowOnlyLowStock(!showOnlyLowStock);
    setSelectedCategory('All');
  };

  const handleDeleteMedicine = (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine from the registry?")) {
      deleteMedicine(id);
    }
  };

  const handleUpdateStock = (id: string, change: number) => {
    const med = medicines.find(m => m.id === id);
    if (med) {
      updateMedicineQuantity(id, Math.max(0, med.quantity + change));
    }
  };

  const handleConfirmAdjust = () => {
    if (!adjusting) return;
    const val = parseInt(adjusting.value) || 0;
    if (val !== 0) {
      handleUpdateStock(adjusting.id, adjusting.mode === 'add' ? val : -val);
    }
    setAdjusting(null);
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
            {view === 'stock' ? 'Medicine List' : 'Usage History'}
          </h1>
          <p className="text-slate-500 font-medium italic">
            {view === 'stock' 
              ? 'Track medicines and manage stock levels.' 
              : 'Detailed list of medicine usage by staff.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {view === 'stock' ? (
            <button 
              onClick={() => { setView('history'); setSearchTerm(''); }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
            >
              <History size={18} /> View Usage History
            </button>
          ) : (
            <button 
              onClick={() => { setView('stock'); setSearchTerm(''); }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
            >
              <ArrowLeft size={18} /> Back to List
            </button>
          )}
          
          {canManage && view === 'stock' && (
            <button 
              onClick={() => navigate('/inventory/new')}
              className="flex items-center gap-2 px-6 py-3 bg-[#005F54] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all"
            >
              <Plus size={18} /> Add Medicine
            </button>
          )}
        </div>
      </div>

      {view === 'stock' ? (
        <>
          {/* Dynamic Category Browser */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <LayoutGrid size={14} /> Categories
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Click to filter list</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleCategoryClick('All')}
                className={`flex flex-col items-center justify-center min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                  selectedCategory === 'All' && !showOnlyLowStock
                    ? 'bg-[#005F54] border-[#005F54] text-white shadow-lg shadow-emerald-900/10' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-widest">All Items</p>
                <p className={`text-[10px] font-bold opacity-60 mt-1`}>{medicines.length} Items</p>
              </button>

              {categoriesData.map(cat => (
                <button 
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex flex-col items-center justify-center min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    selectedCategory === cat.name 
                      ? 'bg-[#005F54] border-[#005F54] text-white shadow-lg shadow-emerald-900/10' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-widest">{cat.name}</p>
                  <p className="text-[10px] font-bold opacity-60 mt-1">{cat.count} Items</p>
                </button>
              ))}

              <button 
                onClick={handleLowStockFilter}
                className={`flex flex-col items-center justify-center min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                  showOnlyLowStock
                    ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-900/20' 
                    : 'bg-white border-rose-100 text-rose-600 hover:bg-rose-50 shadow-sm'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-widest">Low Stock</p>
                <p className="text-[10px] font-bold opacity-60 mt-1">{lowStockCount} Alerts</p>
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mt-8">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search medicine name..." 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="responsive-table w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                  <tr>
                    <th className="px-10 py-6">Medicine Info</th>
                    <th className="px-10 py-6">Quick Adjust</th>
                    <th className="px-10 py-6">Stock Health</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedMeds.map((med) => {
                    const status = getMedicineStatus(med);
                    const isAdjustingThis = adjusting?.id === med.id;

                    return (
                      <tr key={med.id} className="group hover:bg-emerald-50/10 transition-colors">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#005F54]/5 flex items-center justify-center text-[#005F54] font-black text-base border border-[#005F54]/10 transition-all group-hover:bg-[#005F54] group-hover:text-white group-hover:scale-110">
                              {(med.name || '?').charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-base tracking-tight">{med.name}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">{med.category}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-3 w-fit bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                              {/* MINUS SECTION */}
                              {isAdjustingThis && adjusting.mode === 'sub' ? (
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
                                  onClick={() => setAdjusting({ id: med.id, mode: 'sub', value: '' })}
                                  className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all shadow-sm active:scale-90"
                                >
                                  <Minus size={14} />
                                </button>
                              )}

                              <div className="flex flex-col items-center min-w-[60px]">
                                <span className="text-sm font-black text-slate-900 leading-none">{med.quantity}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{med.unit}</span>
                              </div>

                              {/* PLUS SECTION */}
                              {isAdjustingThis && adjusting.mode === 'add' ? (
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
                                  onClick={() => setAdjusting({ id: med.id, mode: 'add', value: '' })}
                                  className="w-8 h-8 flex items-center justify-center bg-[#005F54] text-white rounded-xl hover:bg-[#004a42] transition-all shadow-md shadow-emerald-900/10 active:scale-90"
                                >
                                  <Plus size={14} />
                                </button>
                              )}

                              {isAdjustingThis && (
                                <button 
                                  onClick={() => setAdjusting(null)}
                                  className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              )}
                           </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-[140px] h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${status.bg}`}
                                style={{ width: `${Math.min((med.quantity / (med.minStockLevel * 2)) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {canManage && (
                               <button 
                                onClick={() => handleDeleteMedicine(med.id)}
                                className="p-3 bg-rose-50 text-rose-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                               >
                                 <Trash2 size={18} />
                               </button>
                             )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMeds.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                          <div className="p-8 bg-slate-50 rounded-full">
                            <FileSearch size={64} className="opacity-10" />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">No medicines found</p>
                            <p className="text-xs text-slate-400 font-medium mt-1">Try changing your search.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredMeds.length > 0 && (
              <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-900">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredMeds.length)}</span> - <span className="text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredMeds.length)}</span> of <span className="text-slate-900">{filteredMeds.length}</span> Items
                </p>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      currentPage === 1 
                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' 
                      : 'bg-white text-slate-600 hover:bg-[#005F54] hover:text-white border border-slate-200 shadow-sm'
                    }`}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <div className="flex items-center gap-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-[#005F54]">{currentPage}</span>
                    <span className="text-[10px] font-black text-slate-300">/</span>
                    <span className="text-[10px] font-black text-slate-400">{totalPages}</span>
                  </div>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      currentPage === totalPages 
                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' 
                      : 'bg-white text-slate-600 hover:bg-[#005F54] hover:text-white border border-slate-200 shadow-sm'
                    }`}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* History Log View */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
             <div className="relative flex-1 w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             <div className="relative w-full md:w-64">
               <LayoutGrid className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <select 
                 className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 shadow-inner appearance-none cursor-pointer"
                 value={historyCategoryFilter}
                 onChange={(e) => setHistoryCategoryFilter(e.target.value)}
               >
                 {allCategories.map(cat => (
                   <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                 ))}
               </select>
               <ChevronLeft className="absolute right-5 top-1/2 -translate-y-1/2 rotate-[-90deg] text-slate-400 pointer-events-none" size={16} />
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="responsive-table w-full text-left md:min-w-[1000px]">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6">Date Used</th>
                    <th className="px-10 py-6">Medicine</th>
                    <th className="px-10 py-6 text-center">Amount Used</th>
                    <th className="px-10 py-6">Staff Name</th>
                    <th className="px-10 py-6">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredHistory.map((log) => (
                    <tr key={log.id} className="group hover:bg-emerald-50/10 transition-colors">
                      <td className="px-10 py-7">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 tracking-tight leading-none mb-2">#{log.id.toUpperCase()}</span>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-[#005F54] uppercase tracking-widest bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                             <Clock size={10} /> {log.dateTime}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                             {(log.medicineName || '?').charAt(0)}
                           </div>
                           <span className="text-sm font-black text-slate-800">{log.medicineName}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100">
                          {log.quantity}
                        </span>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-[10px]">
                             {log.takenBy.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                             <p className="text-sm font-black text-slate-800 tracking-tight leading-none">{log.takenBy}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Location: {log.ward || 'General'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="max-w-[300px]">
                          <p className="text-xs font-medium text-slate-600 italic leading-relaxed">
                            "{log.purpose}"
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                          <div className="p-8 bg-slate-50 rounded-full">
                            <FileSearch size={64} className="opacity-10" />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">No results found</p>
                            <p className="text-xs text-slate-400 font-medium mt-1">Try changing your search or filters.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
