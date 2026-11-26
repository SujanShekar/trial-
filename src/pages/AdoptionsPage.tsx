import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Printer, 
  Calendar, 
  BarChart, 
  X, 
  CheckCircle, 
  Clock,
  ArrowRight,
  ArrowLeft,
  PenTool,
  FileSearch,
  ChevronRight,
  ClipboardList,
  User,
  ShieldCheck,
  Eye,
  FileText,
  Search
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AdoptionApplication } from '../types';

const UnderlineInput = ({ label, value, onChange, placeholder, width = "full", type = "text", disabled = false }: any) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  return (
    <div 
      className={`flex items-baseline gap-2 cursor-text ${width === "full" ? "w-full" : ""}`}
      onClick={() => inputRef.current?.focus()}
    >
      {label && <span className="text-slate-800 font-bold text-[13px] whitespace-nowrap uppercase tracking-tight">{label} :</span>}
      <div className="flex-1 relative">
        <input 
          ref={inputRef}
          type={type}
          disabled={disabled}
          className={`w-full bg-transparent border-b border-slate-400 focus:border-[#005F54] focus:outline-none py-1 px-2 text-sm font-bold text-[#1e40af] placeholder:text-slate-200 ${disabled ? 'cursor-default' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

const FormContent = ({ 
  data, 
  isPreview = false, 
  onDataChange 
}: { 
  data: any; 
  isPreview?: boolean; 
  onDataChange?: (newData: any) => void; 
}) => {
  const handleChange = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ ...data, [field]: value });
    }
  };

  return (
    <div className="relative min-w-0 bg-white min-h-0 md:min-h-[1100px] shadow-2xl rounded-sm p-4 sm:p-8 md:p-20 overflow-visible md:overflow-hidden text-left">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#005F54] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-sm">PFA</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-none">People for Animals (PFA)</h2>
            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">Survey No. 280, Near Roopanagar, Bogadi Village, Mysore</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Phone: 0821-2598213</p>
          </div>
        </div>
        <div className="text-right w-full md:w-auto">
          <div className="bg-slate-900 text-white px-6 py-2 text-xs font-black uppercase tracking-[0.2em] rounded-sm shadow-md mb-2 inline-block">ADOPTION FORM</div>
          <div className="flex items-center justify-end gap-2 text-sm font-bold text-slate-800">No.<span className="text-rose-600 font-black underline underline-offset-4 decoration-slate-300"> {data.appNumber}</span></div>
        </div>
      </div>

      <div className="space-y-8">
        <UnderlineInput disabled={isPreview} label="Your Name" value={data.adopterName} onChange={(e: any) => handleChange('adopterName', e.target.value)} placeholder="Full Name" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <UnderlineInput disabled={isPreview} label="Age" value={data.adopterAge} onChange={(e: any) => handleChange('adopterAge', e.target.value)} placeholder="Years" />
          <div className="flex items-center gap-4 text-[13px] font-bold text-slate-800 uppercase tracking-tight">
            GENDER : 
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input disabled={isPreview} type="radio" checked={data.adopterGender === 'Male'} onChange={() => handleChange('adopterGender', 'Male')} className="w-4 h-4 border-slate-300 accent-[#005F54]" /> 
              <span>Male</span>
            </label>
            <span>/</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input disabled={isPreview} type="radio" checked={data.adopterGender === 'Female'} onChange={() => handleChange('adopterGender', 'Female')} className="w-4 h-4 border-slate-300 accent-[#005F54]" /> 
              <span>Female</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <UnderlineInput 
            disabled={isPreview} 
            label="Mobile No" 
            value={data.phone} 
            onChange={(e: any) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              handleChange('phone', value);
            }}
            placeholder="10 digit mobile number"
            type="tel"
          />          
          <UnderlineInput
            disabled={isPreview}
            label="Email"
            value={data.email}
            onChange={(e: any) => {
              const value = e.target.value.replace(/\s/g, '');
              handleChange('email', value);
            }}
            placeholder="email@address.com"
            type="email"
          />
        </div>

        <UnderlineInput disabled={isPreview} label="Home Address" value={data.address} onChange={(e: any) => handleChange('address', e.target.value)} placeholder="Street, Colony, Landmark" />

        <div className="pt-6 space-y-4">
          <p className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">I want to adopt a dog / cat / pup / kitten / other :</p>
          <input disabled={isPreview} className="w-full bg-transparent border-b border-slate-400 focus:outline-none py-1 text-[#1e40af] font-bold italic" value={data.animalType} onChange={e => handleChange('animalType', e.target.value)} placeholder="Animal type" />
        </div>

        <div className="flex items-center gap-4 text-[13px] font-bold text-slate-800 uppercase tracking-tight">
          GENDER OF ANIMAL : 
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input disabled={isPreview} type="radio" checked={data.targetGender === 'Male'} onChange={() => handleChange('targetGender', 'Male')} className="w-4 h-4 border-slate-300 accent-[#005F54]" /> 
            <span>Male</span>
          </label>
          <span>/</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input disabled={isPreview} type="radio" checked={data.targetGender === 'Female'} onChange={() => handleChange('targetGender', 'Female')} className="w-4 h-4 border-slate-300 accent-[#005F54]" /> 
            <span>Female</span>
          </label>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <span className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">Colour preference:</span>
          <input disabled={isPreview} className="flex-1 bg-transparent border-b border-slate-400 text-[#1e40af] font-bold w-full md:w-auto mt-2 md:mt-0" value={data.targetColor} onChange={e => handleChange('targetColor', e.target.value)} placeholder="Color pattern" />
        </div>

        <UnderlineInput disabled={isPreview} label="Why do you want to adopt?" value={data.reason} onChange={(e: any) => handleChange('reason', e.target.value)} placeholder="Reason" />

        <div className="pt-8 p-6 bg-slate-50 border border-slate-100 rounded-sm">
          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            Note: Adoption is a lifelong commitment. People for Animals (PFA), Mysore will conduct background checks and regular follow-ups for all adopted animals to ensure their well-being and welfare standards are maintained.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-10 pt-12">
          <UnderlineInput label="Date" width="auto" value={data.date} disabled />
        </div>
      </div>
    </div>
  );
};

const DeclarationContent = ({ data, isPreview = false }: { data: any, isPreview?: boolean }) => (
  <div className="relative min-w-0 bg-white min-h-0 md:min-h-[1100px] shadow-2xl rounded-sm p-4 sm:p-8 md:p-20 overflow-visible md:overflow-hidden text-left">
    <div className="flex flex-col items-center text-center gap-4 mb-12">
      <div className="w-16 h-16 bg-[#005F54] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-sm">PFA</div>
      <div>
        <h2 className="text-3xl font-black text-slate-900 leading-none uppercase">People for Animals (PFA)</h2>
        <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-wide">Survey No. 280, Roopanagar, Bogadi Village, Mysuru.</p>
      </div>
      <div className="w-full h-px bg-slate-200 my-4"></div>
      <h3 className="text-xl font-black text-slate-800 underline underline-offset-8 tracking-[0.2em]">ADOPTION AGREEMENT</h3>
    </div>

    <div className="space-y-10 leading-[3]">
      <div className="text-sm font-bold text-slate-700 leading-loose text-justify">
        I, Mr. / Mrs. / Ms. <span className="inline-block max-w-full break-words px-4 font-black text-[#1e40af] border-b border-slate-300 min-w-[8rem] md:min-w-[250px] italic leading-tight">{data.adopterName || "...................................................."}</span> residing at <span className="inline-block max-w-full break-words px-4 font-black text-[#1e40af] border-b border-slate-300 min-w-[8rem] md:min-w-[300px] italic leading-tight">{data.address || "...................................................."}</span> Tel/Mob: <span className="inline-block max-w-full break-words px-4 font-black text-[#1e40af] border-b border-slate-300 min-w-[8rem] md:min-w-[150px] italic leading-tight">{data.phone || "................................"}</span> Email: <span className="inline-block max-w-full break-words px-4 font-black text-[#1e40af] border-b border-slate-300 min-w-[8rem] md:min-w-[200px] italic leading-tight">{data.email || "................................"}</span> declare as follows:
      </div>

      <div className="space-y-6 text-sm font-bold text-slate-600 text-justify bg-slate-50/30 p-4 md:p-8 rounded-lg border border-slate-100 leading-relaxed">
        <p>1. I am freely adopting an animal from <span className="text-slate-900 font-black uppercase">People For Animals</span>, and from now on the animal will be my responsibility.</p>
        <p>2. I will give good food, water, medical care, and shelter to the animal and treat it kindly.</p>
        <p>3. PFA can visit and check the animal. If the animal is not treated well, PFA can take it back.</p>
        <p>4. I will not sell or abandon the animal. If I cannot care for it, I will return it to PFA.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-10 pt-20">
        <div className="space-y-4 w-full md:w-auto">
          <UnderlineInput label="Date" value={data.date} width="auto" disabled />
          <UnderlineInput label="Time" value={data.time} width="auto" disabled />
        </div>
      </div>
    </div>
  </div>
);

const AdoptionsPage: React.FC = () => {
  const { adoptionApplications, addAdoptionApplication, updateAdoptionApplication, isLoading } = useAppContext();
  const [view, setView] = useState<'register' | 'summary'>('register');
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingRecord, setViewingRecord] = useState<AdoptionApplication | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<AdoptionApplication | null>(null);

  const [formData, setFormData] = useState({
    adopterName: '',
    adopterAge: '',
    adopterGender: 'Male',
    phone: '',
    email: '',
    animalType: 'Dog',
    targetGender: 'Male',
    targetColor: '',
    reason: '',
    address: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    location: 'Main Sanctuary'
  });

  const handleFinalize = async () => {
  const requiredFields = [
    formData.adopterName,
    formData.adopterAge,
    formData.phone,
    formData.email,
    formData.address,
    formData.animalType,
    formData.targetColor,
    formData.reason,
    formData.date,
    formData.time,
    formData.location
  ];

  const isEmpty = requiredFields.some(
    field => !field || field.toString().trim() === ''
  );

  if (isEmpty) {
    alert("Please complete all fields.");
    return;
  }

  const newRecord = {
    id: `APP-${Date.now().toString().slice(-4)}`,
    ...formData,
    status: 'In Review',
    createdAt: new Date().toISOString()
  };

  const saved = await addAdoptionApplication(newRecord as AdoptionApplication);
  if (!saved) return;

  alert("Adoption Application successfully registered.");

  setView('summary');
  setFormStep(1);

  setFormData({
    adopterName: '',
    adopterAge: '',
    adopterGender: 'Male',
    phone: '',
    email: '',
    animalType: 'Dog',
    targetGender: 'Male',
    targetColor: '',
    reason: '',
    address: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    location: 'Main Sanctuary'
  });
};
  const filteredRecords = useMemo(() => {
    return adoptionApplications.filter(r => {
      return r.adopterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             r.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
             r.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [adoptionApplications, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const handleEditClick = () => {
    if (viewingRecord) {
      setEditData({ ...viewingRecord });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (editData) {
      const saved = await updateAdoptionApplication(editData);
      if (!saved) {
        alert("Unable to save the adoption record. Please try again.");
        return;
      }
      setViewingRecord(saved);
      setIsEditing(false);
      setEditData(null);
      alert("Adoption record updated successfully.");
    }
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase tracking-widest">
            {view === 'register' ? 'New Adoption Form' : 'Adoption List'}
          </h1>
          <p className="text-slate-500 font-medium italic">
            {view === 'register' 
              ? 'Form to adopt an animal.' 
              : 'List of all adoptions.'}
          </p>
        </div>
        <div className="flex bg-white p-1.5 border border-slate-200 rounded-[1.5rem] shadow-sm">
          <button 
            onClick={() => { setView('register'); setFormStep(1); }} 
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'register' ? 'bg-[#005F54] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Plus size={16} /> New Form
          </button>
          <button 
            onClick={() => setView('summary')} 
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'summary' ? 'bg-[#005F54] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ClipboardList size={16} /> View List
          </button>
        </div>
      </div>

      {view === 'register' ? (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
           {formStep === 1 ? (
             <div className="space-y-6">
               <FormContent data={formData} onDataChange={setFormData} />
               <div className="flex justify-end pt-12 no-print">
                  <button onClick={() => {
  const requiredFields = [
    formData.adopterName,
    formData.adopterAge,
    formData.phone,
    formData.email,
    formData.address,
    formData.animalType,
    formData.targetColor,
    formData.reason,
  ];

  const isEmpty = requiredFields.some(
    field => !field || field.toString().trim() === ''
  );
if (formData.phone.length !== 10) {
  alert("Phone number must be exactly 10 digits.");
  return;
}

  if (isEmpty) {
    alert('Please fill all fields before continuing.');
    return;
  }
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(formData.email)) {
  alert("Please enter a valid email address.");
  return;
}
  setFormStep(2);
}} className="flex items-center gap-3 bg-[#005F54] text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 active:scale-95 transition-all">
                    Next Step <ArrowRight size={20} />
                  </button>
               </div>
             </div>
           ) : (
             <div className="space-y-6">
               <DeclarationContent data={formData} />
               <div className="flex flex-col md:flex-row justify-between gap-6 pt-16 no-print">
                  <button onClick={() => setFormStep(1)} className="flex items-center justify-center gap-3 bg-slate-100 text-slate-400 px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                    <ArrowLeft size={20} /> Go Back
                  </button>
                  <button onClick={handleFinalize} className="flex items-center justify-center gap-3 bg-[#005F54] text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-600 active:scale-95 transition-all">
                    <CheckCircle size={20} /> Finish
                  </button>
               </div>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
          {/* Total Count Card */}
          <div className="grid grid-cols-1 gap-8">
            <div className="p-10 rounded-[3rem] shadow-xl bg-[#005F54] text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100/70 mb-4">Total Applications Registered</p>
                 <h3 className="text-6xl font-black tracking-tighter">{adoptionApplications.length}</h3>
                 <p className="text-sm font-bold mt-2 italic text-emerald-100/50">Current Registry Census</p>
               </div>
               <FileSearch className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500" size={160} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                <FileSearch className="text-[#005F54]" size={24} /> Applications
              </h3>
              <div className="relative flex-1 max-w-lg w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by Name or ID..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#005F54]/5 outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="responsive-table w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                    <tr>
                      <th className="px-10 py-6">Name</th>
                      <th className="px-10 py-6">Animal</th>
                      <th className="px-10 py-6">Date</th>
                      <th className="px-10 py-6">Phone</th>
                      <th className="px-10 py-6 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-emerald-50/10 transition-colors group">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-lg">
                              {(r.adopterName || '?').charAt(0)}
                            </div>
                            <div>
                               <p className="text-base font-black text-slate-800 tracking-tight leading-none mb-1">{r.adopterName}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {r.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                           <span className="px-3 py-1 bg-[#005F54] text-white text-[10px] font-black uppercase tracking-widest rounded-lg">{r.animalType}</span>
                        </td>
                        <td className="px-10 py-7">
                          <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5"><Calendar size={14} className="text-[#005F54]" /> {r.date}</span>
                        </td>
                        <td className="px-10 py-7">
                          <span className="text-sm font-black text-slate-700">{r.phone}</span>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => setViewingRecord(r)}
                              className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-[#005F54] hover:text-white transition-all shadow-sm"
                            >
                               <Eye size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingRecord && (
        <div className="fixed inset-0 z-[200] block p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto pt-6 md:pt-20 no-print">
          <div className="relative mx-auto w-full max-w-5xl min-w-0 animate-in slide-in-from-bottom-8 duration-300 mb-20 space-y-6 sm:space-y-12">
            <div className="flex flex-wrap gap-3 justify-between items-center bg-white/20 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/20 shadow-2xl">
               <div className="flex min-w-0 items-center gap-4">
                 <div className="w-12 h-12 bg-[#005F54] text-white rounded-2xl flex items-center justify-center shadow-xl"><FileText size={24} /></div>
                 <div>
                   <h2 className="text-white text-xl font-black uppercase tracking-widest">{isEditing ? 'Editing Form' : 'Form View'}</h2>
                   <p className="max-w-full break-all text-emerald-100/70 text-[10px] font-black uppercase tracking-widest">ID: {viewingRecord.id.slice(0, 8)}…</p>
                 </div>
               </div>
               <div className="flex flex-wrap gap-3">
                 {isEditing ? (
                   <>
                     <button onClick={handleSaveEdit} className="flex items-center gap-2 px-6 py-3 bg-[#005F54] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-600 transition-all"><CheckCircle size={16} /> Save Changes</button>
                     <button onClick={() => { setIsEditing(false); setEditData(null); }} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-100 transition-all"><X size={16} /> Cancel</button>
                   </>
                 ) : (
                   <>
                     <button aria-label="Edit form" onClick={handleEditClick} className="flex min-h-11 items-center gap-2 px-3 sm:px-6 py-3 bg-[#005F54] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-600 transition-all"><PenTool size={16} /><span className="hidden sm:inline">Edit</span></button>
                     <button aria-label="Print form" onClick={handlePrint} className="flex min-h-11 items-center gap-2 px-3 sm:px-6 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-50 transition-all"><Printer size={16} /><span className="hidden sm:inline">Print</span></button>
                     <button aria-label="Close form" onClick={() => { setViewingRecord(null); setIsEditing(false); setEditData(null); }} className="min-h-11 min-w-11 p-3 bg-rose-500 text-white rounded-2xl shadow-xl hover:bg-rose-600 transition-all"><X size={24} /></button>
                   </>
                 )}
               </div>
            </div>
            <div className="space-y-12 pb-20">
               <FormContent data={isEditing ? editData : viewingRecord} isPreview={!isEditing} onDataChange={isEditing ? setEditData : undefined} />
               <DeclarationContent data={isEditing ? editData : viewingRecord} isPreview={!isEditing} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          aside, header { display: none !important; }
          main { padding: 0 !important; width: 100% !important; margin: 0 !important; }
          .p-8, .p-20 { padding: 2rem !important; }
          .bg-white { background: white !important; }
          .min-h-[1100px] { min-height: auto !important; }
        }
      `}</style>
    </div>
  );
};

export default AdoptionsPage;
