
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { 
  ChevronLeft, 
  Download, 
  Activity, 
  Home, 
  CheckCircle,
  Search,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CaseStatus } from '../types';

const CensusReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading: isGlobalLoading } = useAppContext();
  const [reportCases, setReportCases] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'Permanent' | 'Released'>('Permanent');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsFetching(true);
    apiFetch('/api/cases/export')
      .then(res => res.json())
      .then(data => {
        setReportCases(data);
        setIsFetching(false);
      })
      .catch(() => setIsFetching(false));
  }, []);

  const censusData = useMemo(() => {
    const released = reportCases.filter(c => c.status === CaseStatus.RELEASED);
    const permanent = reportCases.filter(c => c.status === CaseStatus.PERMANENT);
    return {
      released,
      permanent,
      total: released.length + permanent.length
    };
  }, [reportCases]);

  const filteredList = useMemo(() => {
    const base = activeTab === 'Permanent' ? censusData.permanent : censusData.released;
    if (!searchTerm) return base;
    const term = searchTerm.toLowerCase();
    return base.filter(c => 
      c.title.toLowerCase().includes(term) || 
      c.caseNumber?.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term)
    );
  }, [activeTab, censusData, searchTerm]);

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header], (key, value) => value === null ? "" : value)).join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isGlobalLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-slate-500 shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Rescue & Resident Census</h1>
          <p className="text-slate-500 font-medium italic">Distinct registries for long-term sanctuary care and successful habitat returns.</p>
        </div>
      </div>

      <div className="bg-[#005F54] p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-12 flex-1">
            {/* Separate Permanent Total */}
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-indigo-400/30">
                <Home size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70">Permanent Residents</p>
                <h2 className="text-5xl font-black tracking-tighter">{censusData.permanent.length}</h2>
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-white/10"></div>

            {/* Separate Released Total */}
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-400/30">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70">Animals Released</p>
                <h2 className="text-5xl font-black tracking-tighter">{censusData.released.length}</h2>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => generateCSV([...censusData.released, ...censusData.permanent], 'pfa_census_full_report')}
              className="bg-white text-[#005F54] px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-xl active:scale-95"
            >
              <Download size={18} /> Export Full Registry
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-1.5 bg-slate-100 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('Permanent')}
              className={`flex-1 md:flex-none px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'Permanent' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Home size={16} /> Registry List
            </button>
            <button 
              onClick={() => setActiveTab('Released')}
              className={`flex-1 md:flex-none px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'Released' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <CheckCircle size={16} /> Release History
            </button>
          </div>
          <div className="relative flex-1 max-w-md w-full px-2">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab.toLowerCase()} list...`}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-[#005F54]/5 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="responsive-table w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-10 py-5">Record Entry</th>
                <th className="px-10 py-5">Animal Species</th>
                <th className="px-10 py-5">Status Change Date</th>
                <th className="px-10 py-5">Original Rescue Location</th>
                <th className="px-10 py-5 text-right">View Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredList.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${activeTab === 'Permanent' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {c.caseNumber}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{c.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry ID: {c.caseNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${activeTab === 'Permanent' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      {c.title.split(' ')[0]}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                      <Calendar size={14} className="text-slate-400" />
                      {c.createdAt?.split('T')[0] || 'N/A'}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs font-medium text-slate-500 italic max-w-xs truncate">{c.location}</p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => navigate('/cases', { state: { openCaseId: c.id } })}
                      className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-[#005F54] hover:text-white transition-all shadow-sm"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Layers size={48} className="opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">No matching census records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CensusReportPage;
