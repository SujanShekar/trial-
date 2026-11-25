import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSignature, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  PawPrint, 
  Info, 
  CheckSquare, 
  Save, 
  History, 
  Search, 
  Edit3, 
  Printer,
  ChevronRight,
  FileText,
  AlertCircle,
  PenTool,
  Stethoscope,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Declaration } from '../types';

const AnimalDeclarationPage: React.FC = () => {
  const navigate = useNavigate();
  const { declarations, addDeclaration, updateDeclaration, isLoading } = useAppContext();
  const [view, setView] = useState<'form' | 'list'>('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    formNo: '',
    declarerName: '',
    address: '',
    phone: '',
    email: '',
    species: '',
    gender: 'Male',
    age: '',
    description: '',
    signature: '',
    date: new Date().toISOString().split('T')[0],
    agreed: false,
    needsTreatment: null as boolean | null
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleEdit = (record: Declaration) => {
    setFormData({
      formNo: record.formNo,
      declarerName: record.declarerName,
      address: record.address,
      phone: record.phone,
      email: record.email,
      species: record.species,
      gender: record.gender,
      age: record.age,
      description: record.description,
      signature: '',
      date: record.date,
      agreed: true,
      needsTreatment: null
    });
    setEditingId(record.id);
    setView('form');
  };
const isFormValid =
  formData.declarerName.trim() !== '' &&
  formData.address.trim() !== '' &&
  formData.phone.trim().length === 10 &&
  formData.email.trim() !== '' &&
  formData.species.trim() !== '' &&
  formData.gender.trim() !== '' &&
  formData.age.trim() !== '' &&
  formData.description.trim() !== '' &&
formData.signature.trim() !== '' &&
  formData.needsTreatment !== null &&
  formData.agreed;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    if (!formData.agreed) {
      alert("You must agree to the declaration terms.");
      return;
    }

    if (formData.needsTreatment === null) {
      alert("Please specify if treatment is needed.");
      return;
    }

    const newRecord: Declaration = {
      id: editingId || Date.now().toString(),
      // The server assigns a sequential form number for new declarations.
      formNo: editingId ? formData.formNo : '',
      declarerName: formData.declarerName,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      species: formData.species,
      gender: formData.gender,
      age: formData.age,
      description: formData.description,
      date: formData.date || new Date().toISOString().split('T')[0],
      createdAt: editingId ? (declarations.find(r => r.id === editingId)?.createdAt) : new Date().toISOString()
    };

    if (editingId) {
      updateDeclaration(newRecord);
      alert("Declaration record updated successfully.");
      setEditingId(null);
    } else {
      addDeclaration(newRecord);
      alert("Declaration form submitted and archived.");
    }

    // REDIRECTION LOGIC: If treatment is needed, navigate to New Case page with form data
    if (formData.needsTreatment) {
      navigate('/cases/new', { 
        state: { 
          fromDeclaration: true,
          declarerData: {
            name: formData.declarerName,
            address: formData.address,
            phone: formData.phone,
            species: `${formData.species}, ${formData.gender}`, // Concatenated for the mapper in NewCasePage
            age: formData.age,
            description: formData.description
          }
        } 
      });
      return;
    }
    
    setFormData(initialFormState);
    setView('list');
  };

  const filteredRecords = useMemo(() => {
    return declarations.filter(r => 
      r.declarerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.formNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [declarations, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase tracking-widest">Declaration Form</h1>
          <p className="text-slate-500 font-medium italic">Formal declaration and surrender documentation registry.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 border border-slate-200 rounded-[1.5rem] shadow-sm">
           <button 
             onClick={() => { setView('form'); setEditingId(null); setFormData(initialFormState); }}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'form' ? 'bg-[#005F54] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             New Declaration
           </button>
           <button 
             onClick={() => setView('list')}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'list' ? 'bg-[#005F54] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             View Ledger
           </button>
        </div>
      </div>

      {view === 'form' ? (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-[#005F54] p-8 text-white flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                   <FileSignature size={24} />
                 </div>
                 <div>
                   <h2 className="text-xl font-black uppercase tracking-widest">{editingId ? 'Edit Declaration' : 'New Declaration'}</h2>
                   <p className="text-emerald-100/70 text-[10px] font-black uppercase tracking-widest mt-1">
                     {editingId ? `Updating Record` : 'Digital Surrender Form'}
                   </p>
                 </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                   <User className="text-[#005F54]" size={20} />
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Declarer Information</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Form Number</label>
                     <input
  type="text"
  readOnly
  placeholder="Assigned automatically after submission"
  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
  value={formData.formNo}
/>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                     <input 
                       required 
                       placeholder="I, Mr. /Mrs. /Ms. ..." 
                       className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                       value={formData.declarerName}
                       onChange={e => setFormData({...formData, declarerName: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                     <textarea 
                       required
                       rows={2}
                       placeholder="Complete address including locality..." 
                       className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                       value={formData.address}
                       onChange={e => setFormData({...formData, address: e.target.value})}
                     />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                        <input 
                          required 
                          type="tel"
                          minLength={10}
                          maxLength={10}
                          placeholder="10-digit Number" 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input 
                        required
                          type="email"
                          placeholder="email@example.com" 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                     </div>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                   <PawPrint className="text-[#005F54]" size={20} />
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Animal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Species</label>
                      <input 
                        required
                        placeholder="e.g. Dog, Cat, Bird" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                        value={formData.species}
                        onChange={e => setFormData({...formData, species: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sex</label>
                      <div className="relative">
                        <select 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all appearance-none cursor-pointer"
                          value={formData.gender}
                          onChange={e => setFormData({...formData, gender: e.target.value})}
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Unknown</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                      <input 
                      required
                        placeholder="e.g. 1 Year" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                   <textarea 
                   required
                     rows={3}
                     placeholder="Color, breed markings, visible injuries, etc..." 
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] transition-all"
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                </div>
              </div>

              {/* TREATMENT NEED SECTION */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                   <Stethoscope className="text-[#005F54]" size={20} />
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Medical Assessment</h3>
                </div>
                
                <div className="bg-emerald-50/50 p-8 rounded-[2rem] border-2 border-emerald-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex-1">
                      <p className="text-base font-black text-[#005F54] leading-tight">Does this animal require immediate medical treatment?</p>
                      <p className="text-xs text-emerald-700 font-medium mt-1">If yes, this will auto-generate a domestic rescue case entry.</p>
                   </div>
                   <div className="flex gap-4 shrink-0">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, needsTreatment: true})}
                        className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${formData.needsTreatment === true ? 'bg-[#005F54] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-emerald-50'}`}
                      >
                        <Check size={18} /> Yes
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, needsTreatment: false})}
                        className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${formData.needsTreatment === false ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-rose-50'}`}
                      >
                        <X size={18} /> No
                      </button>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                   <Info className="text-[#005F54]" size={20} />
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Declaration Terms</h3>
                </div>

                <div className="space-y-4">
                  {[
                    "I am voluntarily and permanently handing over the animal to PFA.",
                    "PFA does not take responsibility if the pet escapes or succumbs to illness.",
                    "I understand I do not have visitation rights."
                  ].map((term, index) => (
                    <div key={index} className="flex items-center gap-4 bg-[#FDF8F6] border border-[#F5E6DE] p-4 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-[#005F54] text-white flex items-center justify-center text-xs font-black shrink-0">{index + 1}</div>
                      <p className="text-sm font-bold text-slate-700 italic">{term}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setFormData({...formData, agreed: !formData.agreed})}>
                   <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.agreed ? 'bg-[#005F54] border-[#005F54] text-white' : 'border-slate-300 bg-white'}`}>
                      {formData.agreed && <CheckSquare size={16} />}
                   </div>
                   <p className="text-sm font-black text-slate-800 uppercase tracking-wide select-none">I have read the above terms and conditions and I am agreeable for the same.</p>
                </div>
              </div>

              {/* Signature Section */}
              <div className="space-y-8 pt-10 border-t border-slate-100">
                <div className="flex items-center gap-3">
                   <PenTool className="text-[#005F54]" size={20} />
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Official Validation</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 italic">Digitally Stamp your Signature</p>
                     <div className="relative group">
                        <div className="absolute inset-0 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors"></div>
                        <input
  required
  type="text"
  placeholder="Type Name to Sign"
  value={formData.signature}
  onChange={e =>
    setFormData({
      ...formData,
      signature: e.target.value
    })
  }
  className="relative w-full px-6 py-8 bg-transparent border-b-2 border-slate-300 focus:border-[#005F54] outline-none text-2xl font-['Georgia'] italic text-[#1e40af]"
/>
                        <div className="absolute right-4 bottom-4 pointer-events-none opacity-20">
                          <FileSignature size={48} />
                        </div>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 text-center">Signature of Declarer</p>
                   </div>
                   
                   <div className="space-y-2">
                      <div className="px-6 py-8 bg-slate-50 border-b-2 border-slate-300 text-center rounded-2xl">
                        <span className="text-sm font-bold text-slate-400">Date:</span>
                        <span className="text-sm font-black text-slate-800 ml-2">{new Date().toLocaleDateString('en-GB')}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 text-center">Application Timestamp</p>
                   </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-end justify-center pt-10 gap-6">
  <button
    type="submit"
    disabled={!isFormValid}
    className={`w-full md:w-auto px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]
    ${
      isFormValid
        ? 'bg-[#005F54] text-white shadow-emerald-900/30 hover:bg-[#004a42] cursor-pointer'
        : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
    }`}
  >
    <Save size={20} />
    {formData.needsTreatment
      ? 'Commit & Proceed to Treatment'
      : editingId
      ? 'Update Record'
      : 'Commit & Archive'}
  </button>
</div>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <div className="relative flex-1 w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by Form No or Name..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
           </div>

           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="responsive-table w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                      <tr>
                        <th className="px-10 py-6">Form No</th>
                        <th className="px-10 py-6">Declarer</th>
                        <th className="px-10 py-6">Species & Sex</th>
                        <th className="px-10 py-6">Age</th>
                        <th className="px-10 py-6">Date</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-10 py-7">
                              <span className="text-sm font-black text-slate-800">{r.formNo}</span>
                           </td>
                           <td className="px-10 py-7">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{r.declarerName}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">{r.phone}</span>
                              </div>
                           </td>
                           <td className="px-10 py-7">
                              <span className="text-sm font-bold text-slate-700">{r.species} ({r.gender})</span>
                           </td>
                           <td className="px-10 py-7">
                              <span className="text-sm font-bold text-slate-700">{r.age}</span>
                           </td>
                           <td className="px-10 py-7">
                              <span className="text-xs font-bold text-slate-500">{r.date}</span>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleEdit(r)}
                                  className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-[#005F54] hover:text-white transition-all shadow-sm"
                                  title="Edit Record"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button 
                                  className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                                  title="Print Form"
                                  onClick={() => window.print()}
                                >
                                  <Printer size={18} />
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
      )}
    </div>
  );
};

export default AnimalDeclarationPage;
