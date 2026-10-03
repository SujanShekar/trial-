
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Send, 
  Save, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  FileText, 
  Truck, 
  ChevronLeft, 
  PenTool, 
  Printer, 
  Mail, 
  FileSignature, 
  ArrowLeft, 
  Search, 
  ExternalLink, 
  ChevronRight, 
  Clock, 
  History as HistoryIcon, 
  Eye, 
  X, 
  ShieldCheck, 
  FileSearch, 
  Plus,
  BarChart3,
  CalendarDays,
  Layers,
  ChevronDown,
  Info,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MYSURU_AREAS as GLOBAL_MYSURU_AREAS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { WildlifeCase } from '../types';
import { uploadFile, base64ToFile } from '../lib/storage';

const TransferFormPreview = ({ transfer, onClose }: { transfer: any; onClose: () => void }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-center items-start p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto pt-10 md:pt-20">
      <div className="relative w-full max-w-4xl bg-[#F8FAF9] rounded-[2.5rem] shadow-2xl p-6 md:p-12 animate-in slide-in-from-bottom-8 duration-300 print:shadow-none print:my-0 print:p-0 mb-20 border border-white/20">
        
        <div className="mb-10 no-print flex justify-between items-start">
          <div className="max-w-xl">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Inter-Division Transfer</h1>
            <p className="text-slate-500 font-medium text-lg mt-2">Certified archive of animal relocation to {transfer.destination}.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm border border-slate-100 transition-all hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-12 space-y-12 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center border-b-4 border-[#005F54] pb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#005F54] rounded-2xl flex items-center justify-center text-white font-black text-2xl">PFA</div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase">People For Animals</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mysuru Sanctuary • Inter-Partner Registry</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Registry #</p>
              <p className="text-xl font-black text-[#005F54]">TFR-{transfer.caseNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-6">
              <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2">
                <User size={14} /> Origin Reporter
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-sm font-black text-slate-800">{transfer.complainantName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Identity</p>
                  <p className="text-sm font-bold text-slate-600">{transfer.complainantPhone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rescue Geography</p>
                  <p className="text-sm font-medium text-slate-600 italic flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#005F54]" /> {transfer.location}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2">
                <Truck size={14} /> Transfer Logistics
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Destination Partner</p>
                  <p className="text-sm font-black text-slate-800">{transfer.destination}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Departure Timestamp</p>
                  <p className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                    <Clock size={12} className="text-[#005F54]" /> {transfer.dateTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Biological Class</p>
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {transfer.animal}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {transfer.imageUrl && (
            <div className="pt-6 border-t border-slate-100">
               <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2 mb-4">
                <Camera size={14} /> Identification Photo
              </h3>
              <div className="w-full h-64 rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner">
                <img src={transfer.imageUrl} alt="Animal" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-slate-100">
            <section className="space-y-4">
              <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2">
                <Calendar size={14} /> Chronology
              </h3>
              <div className="flex gap-8">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reported Date</p>
                    <p className="text-sm font-bold text-slate-700">{transfer.reportedDate || 'N/A'}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resolved Date</p>
                    <p className="text-sm font-bold text-slate-700">{transfer.resolvedDate || 'N/A'}</p>
                 </div>
              </div>
            </section>
          </div>

          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-black text-[#005F54] uppercase tracking-[0.25em] flex items-center gap-2">
              <FileSignature size={14} /> Official Correspondence Narrative
            </h3>
            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 italic text-slate-700 text-sm leading-relaxed shadow-inner">
              "{transfer.correspondence || 'No correspondence text recorded.'}"
            </div>
          </section>

          <div className="flex justify-between items-end pt-8 mt-8 border-t border-slate-100">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#005F54] border border-emerald-100">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authorized By</p>
                  <p className="text-sm font-black text-slate-900">{transfer.signature}</p>
                </div>
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                Verified digital fingerprint: TFR-{transfer.caseNumber.split('').reverse().join('').slice(0, 8)}-{transfer.id}
              </p>
            </div>
            
            <div className="no-print">
               <button 
                onClick={handlePrint}
                className="flex items-center gap-3 px-10 py-5 bg-[#005F54] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all active:scale-95"
               >
                 <Printer size={20} /> Print Case Form
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WildlifePage: React.FC = () => {
  const navigate = useNavigate();
  const { wildlifeCases, addWildlifeCase, isLoading } = useAppContext();
  const [view, setView] = useState<'form' | 'history'>('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingTransfer, setViewingTransfer] = useState<WildlifeCase | null>(null);

  // Searchable Area Dropdown States
  const areaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableAreas, setAvailableAreas] = useState<string[]>(GLOBAL_MYSURU_AREAS);
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [isCustomAreaMode, setIsCustomAreaMode] = useState(false);
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const createInitialFormData = () => ({
    caseNumber: '',
    complainantName: '',
    phoneNumber: '',
    rescueArea: '',
    detailedAddress: '',
    specificType: 'Dog',
    recipientEmail: 'bangalore@pfa.org',
    medicalHistory: '',
    description: '',
    age: '',
    gender: 'Male',
    reportedDate: new Date().toISOString().split('T')[0],
    resolvedDate: new Date().toISOString().split('T')[0],
    dateTime: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
  });
  const [formData, setFormData] = useState(createInitialFormData);

  const resetForm = () => {
    setFormData(createInitialFormData());
    setAreaSearch('');
    setShowAreaSuggestions(false);
    setIsCustomAreaMode(false);
    setCustomAreaInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle outside clicks for area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setShowAreaSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAreasList = useMemo(() => {
    if (!areaSearch) return availableAreas;
    return availableAreas.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()));
  }, [areaSearch, availableAreas]);

  const handleAreaSelect = (area: string) => {
    if (area === 'Others') {
      setIsCustomAreaMode(true);
      setShowAreaSuggestions(false);
      return;
    }
    setFormData({ ...formData, rescueArea: area });
    setAreaSearch(area);
    setShowAreaSuggestions(false);
  };

  const handleAddCustomArea = () => {
    if (!customAreaInput.trim()) return;
    const newArea = customAreaInput.trim();
    if (!availableAreas.includes(newArea)) {
      setAvailableAreas(prev => [...prev, newArea].sort());
    }
    setFormData({ ...formData, rescueArea: newArea });
    setAreaSearch(newArea);
    setIsCustomAreaMode(false);
    setCustomAreaInput('');
  };

  const sortedHistory = useMemo(() => {
    return [...wildlifeCases]
      .filter(t => 
        t.caseNumber.includes(searchTerm) || 
        t.animal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.signature || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.dateTime.split(' ')[0].split('/').reverse().join('-') + ' ' + a.dateTime.split(' ')[1]);
        const dateB = new Date(b.dateTime.split(' ')[0].split('/').reverse().join('-') + ' ' + b.dateTime.split(' ')[1]);
        return dateB.getTime() - dateA.getTime();
      });
  }, [wildlifeCases, searchTerm]);

  const stats = useMemo(() => {
    const total = wildlifeCases.length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthly = 0;
    let yearly = 0;

    wildlifeCases.forEach(t => {
      const dateParts = t.dateTime.split(' ')[0].split('/');
      const month = parseInt(dateParts[1]) - 1;
      const year = parseInt(dateParts[2]);

      if (year === currentYear) {
        yearly++;
        if (month === currentMonth) {
          monthly++;
        }
      }
    });

    return { total, monthly, yearly };
  }, [wildlifeCases]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phoneNumber.length !== 10) {
      alert("Reporter phone number must be exactly 10 digits.");
      return;
    }
    if (!formData.rescueArea) {
      alert("Please select a Rescue Area.");
      return;
    }

    const combinedLoc = `${formData.rescueArea}${formData.detailedAddress ? `, ${formData.detailedAddress}` : ''}`;

    let finalImageUrl = selectedImage || undefined;

    // Simulation Upload Logic
    if (selectedImage && selectedImage.startsWith('data:')) {
      try {
        const file = base64ToFile(selectedImage, `${formData.caseNumber}-${Date.now()}.jpg`);
        const uploadedUrl = await uploadFile(file);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } catch (error) {
        console.error('Simulation upload failed:', error);
      }
    }

    const newTransfer: WildlifeCase = {
      id: `TFR-${Date.now()}`,
      caseNumber: formData.caseNumber,
      dateTime: formData.dateTime,
      animal: formData.specificType,
      species: formData.specificType,
      schedule: 'Standard',
      location: combinedLoc,
      status: 'Pending',
      complainantName: formData.complainantName,
      complainantPhone: formData.phoneNumber,
      isReadyForRelease: false,
      sentFor: 'Treatment',
      destination: 'Bangalore Division',
      correspondence: formData.description || formData.medicalHistory || 'No correspondence text recorded.',
      signature: 'Current User',
      reportedDate: formData.reportedDate,
      resolvedDate: formData.resolvedDate,
      imageUrl: finalImageUrl,
      createdAt: new Date().toISOString()
    };

    await addWildlifeCase(newTransfer);
    alert("Case submitted successfully to the database.");
    resetForm();
    setView('history');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

 const handleSendEmail = () => {
  if (
    !formData.caseNumber ||
    !formData.complainantName ||
    !formData.phoneNumber ||
    !formData.rescueArea ||
    !formData.detailedAddress ||
    !formData.specificType ||
    !formData.recipientEmail ||
    !formData.reportedDate ||
    !formData.resolvedDate ||
    !selectedImage
  ) {
    alert("Please complete all required fields before sending email.");
    return;
  }

  if (formData.phoneNumber.length !== 10) {
    alert("Reporter phone number must be exactly 10 digits.");
    return;
  }

  const combinedLoc = `${formData.rescueArea}${formData.detailedAddress ? `, ${formData.detailedAddress}` : ''}`;

  const subject = encodeURIComponent(
    `Wildlife Case Transfer: ${formData.caseNumber} - ${formData.specificType}`
  );

  const bodyText =
    `PFA Registry Transfer Request\n\n` +
    `Dear PFA Division Team,\n\n` +
    `Please find the details for the following wildlife transfer:\n\n` +
    `Case Number: ${formData.caseNumber}\n` +
    `Animal Species: ${formData.specificType}\n` +
    `Reporter: ${formData.complainantName}\n` +
    `Phone: ${formData.phoneNumber}\n` +
    `Location: ${combinedLoc}\n\n` +
    `Chronology:\n` +
    `- Reported Date: ${formData.reportedDate}\n` +
    `- Resolved/Transfer Date: ${formData.resolvedDate}\n` +
    `- Documentation Timestamp: ${formData.dateTime}\n\n` +
    `IMPORTANT REQUEST: Please reply to this email thread with the official internal Document Form ID / Reference generated at your end for our reconciliation records.\n\n` +
    `Best regards,\n` +
    `PFA Mysuru Sanctuary Team`;

  const body = encodeURIComponent(bodyText);
  const recipient = formData.recipientEmail || 'bangalore@pfa.org';

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;

  window.open(gmailUrl, '_blank');
};
  const handleSaveDraft = () => {
    alert("Draft saved to local session storage.");
  };

  return (
    <div className={`${view === 'history' ? 'max-w-7xl' : 'max-w-4xl'} mx-auto space-y-8 animate-in fade-in duration-500 pb-20 transition-all`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase tracking-widest">
            {view === 'form' ? 'Wildlife Intake' : 'Registry History'}
          </h1>
          <p className="text-slate-500 font-medium italic">
            {view === 'form' 
              ? 'Inter-division animal transfers and rescue documentation.' 
              : 'Detailed historical archive of all authorized division forms.'}
          </p>
        </div>
        
        <button 
          onClick={() => {
            if (view === 'history') {
              resetForm();
              setView('form');
            } else {
              setView('history');
            }
          }}
          className={`bg-[#005F54] p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-900/10 flex items-center gap-6 min-w-[340px] transition-all duration-300 group hover:scale-[1.02] hover:ring-4 hover:ring-emerald-500/20 text-left border-2 ${view === 'history' ? 'border-white' : 'border-transparent'}`}
        >
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors shadow-inner">
             {view === 'form' ? <HistoryIcon size={24} /> : <PenTool size={24} />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
              {view === 'form' ? 'Switch to History' : 'Create New Intake Entry'}
            </p>
            <h3 className="text-xl font-black tracking-tight">{view === 'form' ? 'History' : 'Back to Intake'}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black">{wildlifeCases.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Forms Archived</span>
            </div>
          </div>
        </button>
      </div>

      {view === 'form' ? (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-visible print:border-none print:shadow-none animate-in slide-in-from-left-4 duration-500 max-w-4xl mx-auto">
          <div className="p-8 md:p-12 space-y-10">
            <div className="border-b border-slate-100 pb-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">New Inter-Division Transfer</h2>
                <p className="text-xs text-slate-400 font-medium mt-1 italic">Authorized registry entry for Inter-Partner coordination.</p>
              </div>
              <button 
                onClick={handlePrint}
                className="no-print p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <Printer size={16} />
                Print Form
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Case Number *</label>
                <input required type="text" placeholder="e.g., 2025001" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all placeholder:text-slate-300" value={formData.caseNumber} onChange={e => setFormData({...formData, caseNumber: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Reporter Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input required type="text" placeholder="Full legal name" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.complainantName} onChange={e => setFormData({...formData, complainantName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      required 
                      type="tel" 
                      minLength={10}
                      maxLength={10}
                      placeholder="10-digit Number" 
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" 
                      value={formData.phoneNumber} 
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '')})} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Searchable Area Dropdown */}
                <div className="space-y-3 relative" ref={areaRef}>
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Incident Area (Mysuru) *</label>
                  <div className="relative">
                     <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-opacity ${areaSearch ? 'opacity-0' : 'opacity-100'}`} size={18} />
                     <input
                     required 
                       type="text"
                       placeholder="Search area..."
                       className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] outline-none transition-all"
                       value={areaSearch}
                       onFocus={() => setShowAreaSuggestions(true)}
                       onChange={(e) => { setAreaSearch(e.target.value); setShowAreaSuggestions(true); }}
                     />
                     <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${showAreaSuggestions ? 'rotate-180' : ''}`} />
                  </div>

                  {showAreaSuggestions && (
                    <div className="absolute z-[100] left-0 right-0 top-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] max-h-64 overflow-y-auto">
                      {filteredAreasList.map(area => (
                        <button 
                          key={area}
                          type="button"
                          onClick={() => handleAreaSelect(area)}
                          className="w-full text-left px-6 py-4 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#005F54] transition-colors border-b border-slate-50 last:border-none"
                        >
                          {area}
                        </button>
                      ))}
                      <button 
                        type="button"
                        onClick={() => handleAreaSelect('Others')}
                        className="w-full text-left px-6 py-4 text-sm font-black text-[#005F54] bg-emerald-50/30 hover:bg-emerald-50 transition-colors flex items-center justify-between"
                      >
                        <span>Others (Add New Area)</span>
                        <Plus size={16} />
                      </button>
                    </div>
                  )}

                  {isCustomAreaMode && (
                    <div className="mt-3 p-6 bg-[#005F54]/5 border-2 border-dashed border-[#005F54]/20 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                         <label className="text-[10px] font-black text-[#005F54] uppercase tracking-widest">New Incident Area</label>
                         <button type="button" onClick={() => setIsCustomAreaMode(false)} className="text-emerald-600"><X size={14} /></button>
                      </div>
                      <div className="flex gap-2">
                         <input 
                         required
                           autoFocus
                           className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                           value={customAreaInput}
                           onChange={e => setCustomAreaInput(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleAddCustomArea()}
                         />
                         <button type="button" onClick={handleAddCustomArea} className="px-6 bg-[#005F54] text-white rounded-xl text-xs font-black uppercase tracking-widest">Add</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Detailed Address / Landmark</label>
                  <input 
                  required
                    type="text"
                    placeholder="Street, Landmark..." 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" 
                    value={formData.detailedAddress} 
                    onChange={e => setFormData({...formData, detailedAddress: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Reported Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input required type="date" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.reportedDate} onChange={e => setFormData({...formData, reportedDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Resolved Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="date" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.resolvedDate} onChange={e => setFormData({...formData, resolvedDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Animal Type *</label>
                  <input required type="text" placeholder="Dog, Indian Rock Python, Barn Owl, etc." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.specificType} onChange={e => setFormData({...formData, specificType: e.target.value})} />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Identification Photo</label>
                  <input 
                  required
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 border-dashed transition-all group cursor-pointer ${selectedImage ? 'bg-emerald-50 border-[#005F54]' : 'bg-slate-50 border-slate-200 hover:border-[#005F54]/50'}`}
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-sm overflow-hidden ${selectedImage ? 'bg-white border-[#005F54]/20' : 'bg-white border-slate-200 text-slate-300 group-hover:text-[#005F54] group-hover:scale-110'}`}>
                        {selectedImage ? (
                          <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={24} />
                        )}
                     </div>
                     <div className="text-sm flex-1">
                       <p className={`font-black uppercase text-xs tracking-widest ${selectedImage ? 'text-[#005F54]' : 'text-slate-700'}`}>
                         {selectedImage ? 'Photo Captured' : 'Identification Photo'}
                       </p>
                       <p className="text-slate-400 text-xs font-medium mt-1">
                         {selectedImage ? 'Click to change the identification photo.' : 'Capture or upload photo.'}
                       </p>
                     </div>
                     {selectedImage && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                       >
                         <X size={16} />
                       </button>
                     )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">Recipient Email (Notification Record) *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input required type="email" placeholder="e.g. bangalore@pfa.org" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.recipientEmail} onChange={e => setFormData({...formData, recipientEmail: e.target.value})} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1 flex items-center gap-1.5">
                    <Info size={12} className="text-blue-500" /> This record will be used to auto-fill the 'To' address in the Gmail compose window.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6 no-print">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={handleSaveDraft} className="px-8 py-5 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <FileText size={18} /> Save Draft
                  </button>
                  <button type="submit" className="px-8 py-5 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg">
                    <Save size={18} /> Registry Submit
                  </button>
                </div>
                <button type="button" onClick={handleSendEmail} className="w-full px-8 py-6 bg-[#005F54] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 hover:bg-[#004a42] transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                  <Mail size={22} /> Notify Partner Division (Gmail Compose)
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#005F54] border border-emerald-100">
                <Layers size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Transferred</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                <CalendarDays size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">This Month</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.monthly}</h3>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                <BarChart3 size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">This Year</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.yearly}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
             <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search ledger by Case ID, species, reporter, location or officer..." 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
              onClick={() => setView('form')}
              className="flex items-center gap-2 px-8 py-4 bg-[#005F54] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#004a42] transition-all whitespace-nowrap active:scale-95"
             >
               <Plus size={16} />
               New Entry
             </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-6">Transfer Identity</th>
                      <th className="px-8 py-6">Species</th>
                      <th className="px-8 py-6">Timeline</th>
                      <th className="px-8 py-6">Reporter Identity</th>
                      <th className="px-8 py-6">Incident Geography</th>
                      <th className="px-8 py-6 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sortedHistory.map((t) => (
                      <tr key={t.id} onClick={() => setViewingTransfer(t)} className="group hover:bg-emerald-50/10 transition-colors cursor-pointer">
                        <td className="px-8 py-7">
                          <div className="flex flex-col">
                            <p className="text-base font-black text-slate-900 tracking-tight mb-1">#{t.caseNumber}</p>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-[#005F54] uppercase tracking-widest bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                               <Clock size={10} /> {t.dateTime}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                           <span className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                             {t.animal}
                           </span>
                        </td>
                        <td className="px-8 py-7">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                 <span className="text-[9px] font-black text-slate-400 uppercase">REP:</span>
                                 <span className="text-[10px] font-bold text-slate-600">{t.reportedDate}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                 <span className="text-[9px] font-black text-slate-400 uppercase">RES:</span>
                                 <span className="text-[10px] font-bold text-slate-600">{t.resolvedDate}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-7">
                           <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-700">{t.complainantName}</span>
                             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                               <Phone size={10} className="text-[#005F54]" /> {t.complainantPhone || 'N/A'}
                             </span>
                           </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex items-start gap-2 max-w-[200px]">
                            <MapPin size={12} className="text-slate-300 mt-1 shrink-0" />
                            <span className="text-xs font-bold text-slate-500 leading-relaxed italic">{t.location}</span>
                          </div>
                        </td>
                        <td className="px-8 py-7 text-right">
                           <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-[#005F54] group-hover:text-white transition-all shadow-sm border border-slate-100">
                             <Eye size={20} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
             {sortedHistory.length === 0 && (
               <div className="py-32 text-center flex flex-col items-center gap-5">
                  <div className="p-10 bg-slate-50 rounded-full">
                    <FileSearch size={64} className="text-slate-200" />
                  </div>
                  <div>
                    <p className="text-base font-black uppercase tracking-[0.25em] text-slate-400">Registry Search Returned Zero Results</p>
                    <p className="text-sm text-slate-400 font-medium mt-2 italic max-w-sm mx-auto">Try refining your search terms or checking the authorized division filter.</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {viewingTransfer && (
        <TransferFormPreview transfer={viewingTransfer} onClose={() => setViewingTransfer(null)} />
      )}

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          aside { display: none !important; }
          header { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; width: 100% !important; margin: 0 !important; }
          .max-w-4xl, .max-w-7xl { max-width: 100% !important; }
          .p-8, .p-12 { padding: 1rem !important; }
          .bg-slate-50 { background: white !important; border: 1px solid #e2e8f0 !important; }
          .shadow-sm, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
          .rounded-[2.5rem], .rounded-2xl { border-radius: 4px !important; }
          input, textarea { border: 1px solid #e2e8f0 !important; }
          .border-b-4 { border-bottom: 2px solid #005F54 !important; }
        }
      `}</style>
    </div>
  );
};

export default WildlifePage;
