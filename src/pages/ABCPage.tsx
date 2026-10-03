
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Scissors, 
  Search, 
  Plus, 
  Calendar, 
  BarChart, 
  ChevronDown, 
  X, 
  FileSearch, 
  MapPin, 
  Save, 
  AlertCircle,
  Layers,
  Edit3,
  PawPrint,
  Filter
} from 'lucide-react';
import { MYSURU_AREAS as GLOBAL_MYSURU_AREAS } from '../constants';
import { ABCRecord } from '../types';
import { useAppContext } from '../context/AppContext';

const ABCPage: React.FC = () => {
  const { abcRecords, addABCRecord, updateABCRecord, animals, isLoading } = useAppContext();
  const [view, setView] = useState<'log' | 'summaries'>('log');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    animalType: 'Dog',
    maleCount: '',
    femaleCount: '',
    area: '',
    sterilized: true,
    vaccinationDone: true,
    surgeryDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const handleRegisterClick = () => {
    setEditingId(null);
    setFormData({
      animalType: 'Dog',
      maleCount: '',
      femaleCount: '',
      area: '',
      sterilized: true,
      vaccinationDone: true,
      surgeryDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (record: ABCRecord) => {
    setEditingId(record.id);
    setFormData({
      animalType: record.animalType || animals.find(animal => animal.id === record.animalId)?.species || 'Dog',
      maleCount: record.maleCount?.toString() || '',
      femaleCount: record.femaleCount?.toString() || '',
      area: record.area || '',
      sterilized: record.sterilized,
      vaccinationDone: record.vaccinationDone,
      surgeryDate: record.surgeryDate,
      remarks: record.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const preparedData = {
      ...formData,
      maleCount: formData.maleCount ? parseInt(formData.maleCount) : undefined,
      femaleCount: formData.femaleCount ? parseInt(formData.femaleCount) : undefined,
    };

    if (!formData.animalType && !formData.maleCount && !formData.femaleCount) {
      alert("Please select an animal type or enter male/female counts.");
      return;
    }

    if (editingId) {
      updateABCRecord({ ...preparedData, id: editingId } as ABCRecord);
      alert("Surgery record updated.");
    } else {
      const newRecord: ABCRecord = {
        id: `abc-${Date.now()}`,
        ...preparedData,
        createdAt: new Date().toISOString()
      } as ABCRecord;
      addABCRecord(newRecord);
      alert("New entry successfully saved.");
    }
    
    setIsModalOpen(false);
    setEditingId(null);
  };

  const stats = useMemo(() => {
    const monthly: Record<string, number> = {};
    const yearly: Record<string, number> = {};
    abcRecords.forEach(r => {
      const date = new Date(r.surgeryDate);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const year = date.getFullYear().toString();
      monthly[monthYear] = (monthly[monthYear] || 0) + 1;
      yearly[year] = (yearly[year] || 0) + 1;
    });
    return { monthly, yearly };
  }, [abcRecords]);

  const filteredRecords = useMemo(() => {
    return abcRecords.filter(r => {
      const animal = animals.find(a => a.id === r.animalId);
      const animalName = animal ? `${animal.name} (${animal.species})` : r.animalType || 'Unknown Animal';
      const matchesSearch = animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (r.remarks || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [abcRecords, searchTerm, animals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  const resetFilters = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Birth Control Program</h1>
          <p className="text-slate-500 font-medium">Tracking surgeries to control animal population.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 border border-slate-200 rounded-2xl shadow-sm">
            <button 
              onClick={() => setView('log')} 
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'log' ? 'bg-[#005F54] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Surgery List
            </button>
            <button 
              onClick={() => setView('summaries')} 
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'summaries' ? 'bg-[#005F54] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Summary
            </button>
          </div>
          <button 
            onClick={handleRegisterClick} 
            className="flex items-center gap-2 bg-[#005F54] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all"
          >
            <Plus size={18} /> Add Surgery
          </button>
        </div>
      </div>

      {view === 'log' ? (
        <div className="space-y-6">
          {/* Advanced Filters */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="relative">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by animal name or remarks..." 
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] text-slate-700 font-bold shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Filter size={14} className="text-[#005F54]" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {searchTerm.trim() ? <>Found <span className="text-[#005F54] font-black">{filteredRecords.length}</span> matching surgery records</> : <>Total <span className="text-[#005F54] font-black">{abcRecords.length}</span> surgery records</>}
                </p>
              </div>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1.5 transition-all"
                >
                  <X size={14} /> Reset Search
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6">Animal / Area</th>
                    <th className="px-10 py-6 text-center">Counts</th>
                    <th className="px-10 py-6 text-center">Date</th>
                    <th className="px-10 py-6 text-center">Sterilized</th>
                    <th className="px-10 py-6 text-center">Vaccinated</th>
                    <th className="px-10 py-6">Remarks</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRecords.map((r) => {
                    const animal = animals.find(a => a.id === r.animalId);
                    return (
                      <tr key={r.id} className="hover:bg-emerald-50/5 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#005F54] flex items-center justify-center font-black shadow-sm group-hover:bg-[#005F54] group-hover:text-white transition-all">
                              {animal?.species.charAt(0) || r.animalType?.charAt(0) || <MapPin size={18} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base font-black text-slate-800 tracking-tight">{animal?.name || r.animalType || r.area || 'Unknown'}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{animal?.species || r.animalType || 'Batch Program'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                          {r.maleCount || r.femaleCount ? (
                            <div className="flex flex-col text-[10px] font-black">
                              {r.maleCount && <span className="text-blue-600">M: {r.maleCount}</span>}
                              {r.femaleCount && <span className="text-rose-600">F: {r.femaleCount}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-slate-500 text-center">{r.surgeryDate}</td>
                        <td className="px-10 py-6 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.sterilized ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {r.sterilized ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.vaccinationDone ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                            {r.vaccinationDone ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-xs font-medium text-slate-500 line-clamp-1 max-w-[200px]">{r.remarks || 'No remarks'}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button 
                            onClick={() => handleEditClick(r)}
                            className="p-3 text-slate-300 hover:text-[#005F54] hover:bg-emerald-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-emerald-100"
                          >
                            <Edit3 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-5 text-slate-300">
                          <div className="p-10 bg-slate-50 rounded-full">
                            <FileSearch size={64} className="opacity-10" />
                          </div>
                          <div>
                            <p className="text-base font-black uppercase tracking-[0.2em] text-slate-400">Registry search returned zero results</p>
                            <p className="text-sm text-slate-400 font-medium mt-2 italic">Try adjusting your filters or search term.</p>
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
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
                <Calendar className="text-[#005F54]" size={18} /> Monthly (Total Animals)
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.monthly).map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group">
                    <span className="text-sm font-black text-slate-700">{month}</span>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-[#005F54] shadow-sm">{count}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total ABC</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
                <BarChart className="text-[#005F54]" size={18} /> Yearly (Total Animals)
              </h3>
              <div className="space-y-8">
                {Object.entries(stats.yearly).map(([year, count]) => (
                  <div key={year} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-700">{year} Total</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tighter">{count}</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                      <div 
                        className="h-full bg-gradient-to-r from-[#005F54] to-emerald-400 rounded-full"
                        style={{ width: `${Math.min(((count as any) / 200) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <AlertCircle size={16} className="text-[#005F54]" />
                      <p className="text-[10px] text-emerald-800 font-bold leading-tight">{count} total surgeries tracked this year.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-visible animate-in zoom-in duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-[2.5rem]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#005F54] text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Scissors size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                  {editingId ? 'Edit Surgery' : 'Add New Surgery'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Animal Type</label>
                    <div className="relative">
                      <select 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] appearance-none cursor-pointer transition-all"
                        value={formData.animalType}
                        onChange={e => setFormData({...formData, animalType: e.target.value})}
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area / Location</label>
                    <input 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                      placeholder="e.g. Alanahalli"
                      value={formData.area}
                      onChange={e => setFormData({...formData, area: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Male Count</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                      placeholder="0"
                      value={formData.maleCount}
                      onChange={e => setFormData({...formData, maleCount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Female Count</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                      placeholder="0"
                      value={formData.femaleCount}
                      onChange={e => setFormData({...formData, femaleCount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Surgery Date</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <input 
                        type="date"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                        value={formData.surgeryDate}
                        onChange={e => setFormData({...formData, surgeryDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 items-end">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-slate-200 text-[#005F54] focus:ring-[#005F54]/10"
                        checked={formData.sterilized}
                        onChange={e => setFormData({...formData, sterilized: e.target.checked})}
                      />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Sterilized</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-slate-200 text-[#005F54] focus:ring-[#005F54]/10"
                        checked={formData.vaccinationDone}
                        onChange={e => setFormData({...formData, vaccinationDone: e.target.checked})}
                      />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Vaccinated</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks / Medical Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Enter any specific notes about the surgery..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all"
                    value={formData.remarks}
                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <button 
                  type="submit" 
                  className="w-full py-5 bg-[#005F54] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <Save size={18} />
                  {editingId ? 'Update Record' : 'Save Surgery Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABCPage;
