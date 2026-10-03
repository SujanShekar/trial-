
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { 
  Search, 
  Plus, 
  MapPin, 
  Stethoscope, 
  BriefcaseMedical, 
  X, 
  FileImage,
  Loader2,
  Trash2,
  AlertCircle,
  Edit2,
  Edit3,
  Check,
  MinusCircle,
  ChevronDown,
  Filter,
  Calendar,
  Clock,
  ArrowRight,
  Layout,
  PawPrint,
  FileText,
  Printer,
  ChevronLeft,
  User,
  History,
  Save,
  Info,
  Camera
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CaseStatus, Case, User as UserType, ClinicalEntry } from '../types';

const DOCTOR_OPTIONS = ['Dr. Anita Desai', 'Dr. Suresh Babu', 'Other'];

// --- High Fidelity Form Preview Component (Printable) ---
const CaseSheetPreview = ({ caseItem, clinicalEntries, onClose }: { caseItem: Case; clinicalEntries: ClinicalEntry[]; onClose: () => void }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-center items-start p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto pt-10 md:pt-20 no-print-modal">
      <div className="relative w-full max-w-4xl bg-[#F8FAF9] rounded-[2.5rem] shadow-2xl p-6 md:p-12 animate-in slide-in-from-bottom-8 duration-300 print:shadow-none print:my-0 print:p-0 mb-20">
        
        <div className="mb-10 no-print flex justify-between items-start">
          <div className="max-w-xl">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Official Case Sheet</h1>
            <p className="text-slate-500 font-medium text-lg mt-2">Comprehensive registry record for legal and clinical documentation.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="p-3 bg-white text-[#005F54] hover:bg-emerald-50 rounded-2xl shadow-sm border border-slate-100 transition-all hover:scale-110 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              <Printer size={20} /> Print
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm border border-slate-100 transition-all hover:scale-110"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-12 space-y-12 shadow-sm print:border-none print:p-0">
          {/* Header Section */}
          <div className="flex justify-between items-center border-b-4 border-[#005F54] pb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[#005F54] rounded-full flex items-center justify-center text-white font-black text-2xl">PFA</div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase">People For Animals</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mysuru Sanctuary • Animal Rescue Registry</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Registry #</p>
              <p className="text-2xl font-black text-[#005F54]">{caseItem.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Col: Reporter & Location */}
            <section className="space-y-6">
              <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2">
                <User size={14} /> Intake Details
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reporter ID</p>
                  <p className="text-sm font-black text-slate-800">{caseItem.reportedById || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Info</p>
                  <p className="text-sm font-bold text-slate-600">N/A</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rescue Location</p>
                  <p className="text-sm font-medium text-slate-600 italic flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#005F54]" /> {caseItem.location}
                  </p>
                </div>
              </div>
            </section>

            {/* Right Col: Animal Info */}
            <section className="space-y-6">
              <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2">
                <PawPrint size={14} /> Animal Profile
              </h3>
              <div className="space-y-4">
                <div className="flex gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Title</p>
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {caseItem.title}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="text-sm font-black text-slate-800">{caseItem.status}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Initial Assessment</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{caseItem.description}"</p>
                </div>
              </div>
            </section>
          </div>

          {caseItem.imageUrl && (
            <div className="pt-6 border-t border-slate-100">
               <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2 mb-4">
                <Camera size={14} /> Identification Photo
              </h3>
              <div className="w-full max-w-md h-64 rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner">
                <img src={caseItem.imageUrl} alt="Animal" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Clinical Log Section */}
          <section className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2">
              <Stethoscope size={14} /> Full Clinical History
            </h3>
            
            {clinicalEntries.length > 0 ? (
              <div className="space-y-4">
                {clinicalEntries.map((log, index) => (
                  <div key={log.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 print:bg-white">
                    <div className="md:w-32 shrink-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session {index + 1}</p>
                      <p className="text-xs font-black text-slate-800">{log.date}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-[#005F54] uppercase tracking-widest mb-2">Attending: {log.doctorName}</p>
                      <div className="space-y-2">
                        {log.symptoms && (
                          <p className="text-xs text-slate-600 font-medium"><span className="font-black uppercase text-[9px] text-slate-400 mr-2">Symptoms:</span> {log.symptoms}</p>
                        )}
                        <p className="text-xs text-slate-800 font-bold"><span className="font-black uppercase text-[9px] text-slate-400 mr-2">Diagnosis:</span> {log.diagnosis}</p>
                        <p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-3"><span className="font-black uppercase text-[9px] text-slate-400 mr-2">Treatment:</span> {log.treatment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No clinical logs recorded in registry.</p>
              </div>
            )}
          </section>

          {/* Footer Info */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 pt-12 mt-12 border-t border-slate-100">
            <div className="space-y-4">
               <div className="flex gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Registry Date</p>
                    <p className="text-sm font-black text-slate-800">{caseItem.createdAt?.split('T')[0] || 'N/A'}</p>
                  </div>
               </div>
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                 Generated via PFA Management Portal • Secure Digital Ledger Asset
               </p>
            </div>
            
            <div className="text-center">
               <div className="w-48 border-b-2 border-slate-300 pb-2 mb-1"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:my-0 { margin: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-white { background: white !important; }
          .fixed.inset-0, .fixed.inset-0 * { visibility: visible; }
          .fixed.inset-0 { position: absolute; left: 0; top: 0; width: 100%; height: auto; background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// --- Helper Dropdown Component for Doctors ---
const DoctorDropdown = ({ value, onChange, placeholder, className = "" }: { value: string, onChange: (val: string) => void, placeholder?: string, className?: string }) => {
  const [isOther, setIsOther] = useState(!DOCTOR_OPTIONS.includes(value) && value !== '');
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Other') {
      setIsOther(true);
      onChange('');
    } else {
      setIsOther(false);
      onChange(val);
    }
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <div className="relative">
        <select 
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] appearance-none cursor-pointer"
          value={isOther ? 'Other' : value}
          onChange={handleSelectChange}
        >
          <option value="" disabled>{placeholder || 'Select Doctor...'}</option>
          {DOCTOR_OPTIONS.map(doc => (
            <option key={doc} value={doc}>{doc}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {isOther && (
        <input 
        required
          type="text"
          placeholder="Enter Name Manually"
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] animate-in slide-in-from-top-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
};

// --- Specialized Image Component ---
const SanctuaryImage = ({ src, alt, className, onClick }: { src?: string, alt?: string, className?: string, onClick?: () => void }) => {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(src ? 'loading' : 'error');

  useEffect(() => {
    if (!src) setStatus('error');
    else setStatus('loading');
  }, [src]);

  return (
    <div 
      className={`relative flex items-center justify-center bg-slate-100 overflow-hidden group ${className} ${src && status === 'success' ? 'cursor-zoom-in' : ''}`}
      onClick={() => status === 'success' && onClick && onClick()}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-50/50 animate-pulse space-y-4">
           <div className="relative w-16 h-16 bg-white rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
             <Loader2 className="text-[#005F54] animate-spin" size={24} />
           </div>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <FileImage size={24} className="text-slate-300" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NO IMAGE</span>
        </div>
      )}
      {src && (
        <img 
          src={src} 
          alt={alt || "Animal Image"} 
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${status === 'success' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setStatus('success')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: CaseStatus }) => {
  const styles = {
    [CaseStatus.CRITICAL]: 'bg-rose-100 text-rose-700 border border-rose-200',
    [CaseStatus.UNDER_TREATMENT]: 'bg-amber-100 text-amber-700 border border-amber-200',
    [CaseStatus.RECOVERY]: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    [CaseStatus.RELEASED]: 'bg-blue-100 text-blue-700 border border-blue-200',
    [CaseStatus.PERMANENT]: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    [CaseStatus.DECEASED]: 'bg-slate-200 text-slate-700 border border-slate-300',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
};

interface CasesPageProps {
  user: UserType;
}

const CasesPage: React.FC<CasesPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clinicalEntries, medicines, updateCase } = useAppContext();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // -- ADVANCED FILTERS --
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterTimeRange, setFilterTimeRange] = useState('All');

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(null);
  
  const currentCaseLogs = useMemo(() => {
    if (!selectedCase) return [];
    return clinicalEntries.filter(log => log.caseId === selectedCase.id);
  }, [selectedCase, clinicalEntries]);

  const fetchCases = async () => {
    setIsPageLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PAGE_SIZE.toString(),
        search: debouncedSearchTerm,
        status: filterStatus,
        year: filterYear,
        month: filterMonth,
        timeRange: filterTimeRange,
      });

      const res = await apiFetch(`/api/cases?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setCases(result.data);
        setTotalCount(result.metadata.total);
        setTotalPages(result.metadata.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [currentPage, debouncedSearchTerm, filterStatus, filterYear, filterMonth, filterTimeRange]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 400);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const state = location.state as { openCaseId?: string } | null;
    if (state?.openCaseId) {
      // If we don't have the case in the current list, we fetch it
      const cached = cases.find(c => c.id === state.openCaseId);
      if (cached) {
        setSelectedCase(cached);
      } else {
        apiFetch(`/api/cases/${state.openCaseId}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) setSelectedCase(data);
          });
      }
      // Clear the state so it doesn't trigger again on filter/pagination changes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, cases.length]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterYear, filterMonth, filterTimeRange]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(medicines.map(m => m.category));
    return Array.from(cats).sort();
  }, [medicines]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const ys = [];
    for (let y = currentYear; y >= startYear; y--) {
      ys.push(y.toString());
    }
    return ['All', ...ys];
  }, []);

  const months = [
    { label: 'All', value: 'All' },
    { label: 'Jan', value: '01' }, { label: 'Feb', value: '02' }, { label: 'Mar', value: '03' },
    { label: 'Apr', value: '04' }, { label: 'May', value: '05' }, { label: 'Jun', value: '06' },
    { label: 'Jul', value: '07' }, { label: 'Aug', value: '08' }, { label: 'Sep', value: '09' },
    { label: 'Oct', value: '10' }, { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' }
  ];

  const timeRanges = [
    { label: 'Any Time', value: 'All' },
    { label: 'Today', value: 'Today' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'This Week', value: 'This Week' },
    { label: 'Last Week', value: 'Last Week' },
  ];

  const handleUpdateCaseField = (field: keyof Case, value: any) => {
    if (selectedCase) {
      const updatedCase = { ...selectedCase, [field]: value };
      setSelectedCase(updatedCase);
      updateCase(updatedCase).then(() => {
        // Refresh cases list to reflect status change in table
        fetchCases();
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterYear('All');
    setFilterMonth('All');
    setFilterTimeRange('All');
  };

  if (isPageLoading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Search and Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Rescue List</h1>
          <p className="text-slate-500 font-medium">Monitoring and medical log for sanctuary residents.</p>
        </div>
        <button onClick={() => navigate('/cases/new')} className="flex items-center gap-2 px-6 py-3 bg-[#005F54] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all">
          <Plus size={18} /> Add New Case
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
            required
              type="text" 
              placeholder="Search..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#005F54]/10 text-sm font-bold text-slate-700 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Time Range Filter */}
          <div className="relative">
            <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none text-sm font-bold text-slate-700 appearance-none shadow-sm"
              value={filterTimeRange}
              onChange={(e) => setFilterTimeRange(e.target.value)}
            >
              {timeRanges.map(tr => <option key={tr.value} value={tr.value}>{tr.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative md:col-span-2">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none text-sm font-bold text-slate-700 appearance-none shadow-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Year Filter */}
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none text-sm font-bold text-slate-700 appearance-none shadow-sm"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="All">All Years</option>
              {years.filter(y => y !== 'All').map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none text-sm font-bold text-slate-700 appearance-none shadow-sm"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="All">All Months</option>
              {months.filter(m => m.value !== 'All').map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Found <span className="text-[#005F54]">{totalCount}</span> matching cases
           </p>
           <div className="flex items-center gap-4">
             {isPageLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
             <button 
               onClick={resetFilters}
               className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1"
             >
               <X size={12} /> Clear All Filters
             </button>
           </div>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              <tr>
                <th className="px-10 py-6">Case Details</th>
                <th className="px-10 py-6">Case ID</th>
                <th className="px-10 py-6">Last Clinical Entry</th>
                <th className="px-10 py-8 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cases.map((c) => (
                <tr
  key={c.id}
  onClick={() => {
    if ((user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'DOCTOR')) {
      setSelectedCase(c);
    }
  }}
  className={`group transition-colors ${
    (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'DOCTOR')
      ? 'cursor-pointer hover:bg-emerald-50/10'
      : 'cursor-not-allowed opacity-95'
  }`}
>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-1 h-10 bg-[#005F54] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div>
                        <p className="text-base font-black text-slate-900 tracking-tight leading-none mb-2">{c.title}</p>
                        <StatusBadge status={c.status as CaseStatus} />
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="inline-block px-3 py-1 bg-[#005F54] text-white text-[10px] font-black uppercase tracking-widest rounded-lg">{c.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      {(() => {
                        const logs = clinicalEntries.filter(l => l.caseId === c.id);
                        if (logs.length > 0) {
                          const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                          return (
                            <>
                              <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <Calendar size={14} className="text-[#005F54]" /> 
                                {sorted[0].date}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-5 flex items-center gap-1">
                                {sorted[0].doctorName}
                              </p>
                            </>
                          );
                        }
                        return (
                          <>
                            <p className="text-sm font-bold text-slate-300 flex items-center gap-2 italic">
                              <AlertCircle size={14} className="text-slate-200" /> Not Logged
                            </p>
                            <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1 ml-5">Awaiting Clinic</p>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button
  disabled={(user?.role?.toUpperCase() !== 'ADMIN' && user?.role?.toUpperCase() !== 'DOCTOR')}
  className={`p-3 rounded-2xl transition-all shadow-sm ${
    (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'DOCTOR')
      ? 'bg-slate-50 text-slate-400 group-hover:bg-[#005F54] group-hover:text-white'
      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
  }`}
>
  <ArrowRight size={20} />
</button>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && !isPageLoading && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                       <Search size={48} className="opacity-20" />
                       <p className="text-xs font-black uppercase tracking-widest">No cases found matching these filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination Footer for list */}
        {totalCount > PAGE_SIZE && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-center gap-4">
            
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
             <button 
               onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
               disabled={currentPage === totalPages || isPageLoading}
               className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-[#005F54] transition-all disabled:opacity-30"
             >
                <ArrowRight size={16} />
             </button>
          </div>
        )}
      </div>

      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedCase(null)}></div>
          <div className="relative w-full max-w-7xl max-h-[95vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 duration-500 border border-white/20">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#005F54] border border-emerald-100">
                  <BriefcaseMedical size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedCase.title}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <StatusBadge status={selectedCase.status as CaseStatus} />
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> {selectedCase.createdAt}</span>
                    </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
    Current Status
  </label>

  <div className="relative min-w-[200px]">
    {(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'DOCTOR') ? (
      <>
        <select
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-[#005F54] focus:outline-none focus:ring-2 focus:ring-[#005F54]/10 appearance-none cursor-pointer"
          value={selectedCase.status}
          onChange={(e) =>
            handleUpdateCaseField('status', e.target.value)
          }
        >
          <option value={CaseStatus.UNDER_TREATMENT}>
            Under Treatment
          </option>
          <option value={CaseStatus.RECOVERY}>
            Recovery
          </option>
          <option value={CaseStatus.RELEASED}>
            Released
          </option>
          <option value={CaseStatus.PERMANENT}>
            Permanent
          </option>
          <option value={CaseStatus.DECEASED}>
            Deceased
          </option>
          <option value={CaseStatus.CRITICAL}>
            Critical
          </option>
        </select>

        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#005F54] pointer-events-none"
        />
      </>
    ) : (
      <div className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-black text-slate-700">
        {selectedCase.status}
      </div>
    )}
  </div>
</div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsPreviewing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#005F54]/5 text-[#005F54] border border-[#005F54]/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#005F54] hover:text-white transition-all shadow-sm active:scale-95 group"
                  >
                    <FileText size={16} className="group-hover:scale-110 transition-transform" />
                    View Case Sheet
                  </button>
{(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'DOCTOR') && (
  <button 
    onClick={() => navigate(`/cases/${selectedCase.id}/edit`)}
    className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95 group"
  >
    <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
    Edit Registry Info
  </button>
)}
                </div>

                <button onClick={() => setSelectedCase(null)} className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-2xl text-slate-300 transition-all"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0">
                       <SanctuaryImage src={selectedCase.imageUrl} alt="Animal" className="w-full h-full object-cover" onClick={() => selectedCase.imageUrl && setExpandedImage({ src: selectedCase.imageUrl, alt: selectedCase.title })} />
                    </div>
                    <div className="space-y-3 flex-1">
                       <div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Title</span>
                         <p className="text-base font-black text-slate-800">{selectedCase.title}</p>
                       </div>
                       <div className="flex justify-between items-end">
                         <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                            <p className="text-xs font-bold text-slate-600">{selectedCase.location}</p>
                         </div>
                       </div>
                    </div>
                 </div>
                 <div className="bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-sm space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Info size={14} /> Case Description
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{selectedCase.description}"</p>
                 </div>
              </div>

              {/* Clinical Entries Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#005F54] rounded-full"></div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Clinical History</h3>
                  </div>
                  {(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'DOCTOR') && (
  <button 
    onClick={() => navigate(`/cases/${selectedCase.id}/clinical/new`)}
    className="flex items-center gap-2 px-6 py-2.5 bg-[#005F54] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#004a42] transition-all"
  >
    <Plus size={16} /> Add New Entry
  </button>
)}
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-10 py-5 w-[20%]">Date</th>
                        <th className="px-10 py-5 w-[20%]">Doctor</th>
                        <th className="px-10 py-5 w-[40%]">Diagnosis & Treatment</th>
                        <th className="px-10 py-5 w-[20%] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {currentCaseLogs.length > 0 ? (
                        currentCaseLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-7 align-top">
                              <span className="text-sm font-black text-slate-800 block">{log.date}</span>
                            </td>
                            <td className="px-10 py-7 align-top">
                               <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#005F54] flex items-center justify-center font-black text-[10px] border border-emerald-100 uppercase">{(log.doctorName || '?').charAt(0)}</div>
                                  <span className="text-sm font-black text-slate-700">{log.doctorName}</span>
                               </div>
                            </td>
                            <td className="px-10 py-7 align-top">
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-800"><span className="text-[9px] uppercase text-slate-400 mr-2">Diagnosis:</span> {log.diagnosis}</p>
                                <p className="text-xs font-medium text-slate-600"><span className="text-[9px] uppercase text-slate-400 mr-2">Treatment:</span> {log.treatment}</p>
                                {log.symptoms && <p className="text-[10px] text-slate-400 italic">Symptoms: {log.symptoms}</p>}
                              </div>
                            </td>
                            <td className="px-10 py-7 text-right align-top">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   navigate(`/cases/${selectedCase.id}/clinical/${log.id}/edit`);
                                 }}
                                 className="p-3 text-slate-300 hover:text-[#005F54] hover:bg-emerald-50 rounded-2xl transition-all"
                               >
                                 <Edit2 size={18} />
                               </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-10 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-300">
                               <Stethoscope size={48} className="opacity-20" />
                               <p className="text-xs font-black uppercase tracking-widest">No clinical entries recorded for this case yet.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      
)}

      {selectedCase && isPreviewing && (
        <CaseSheetPreview caseItem={selectedCase} clinicalEntries={currentCaseLogs} onClose={() => setIsPreviewing(false)} />
      )}

      {expandedImage && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Full-size case image" onClick={() => setExpandedImage(null)}>
          <button aria-label="Close image" onClick={() => setExpandedImage(null)} className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"><X size={24} /></button>
          <img src={expandedImage.src} alt={expandedImage.alt} onClick={(event) => event.stopPropagation()} className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default CasesPage;
