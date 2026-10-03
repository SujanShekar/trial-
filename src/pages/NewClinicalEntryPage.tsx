
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { 
  ChevronLeft, 
  Stethoscope, 
  Save, 
  Clock, 
  Calendar, 
  Pill, 
  Activity, 
  User, 
  AlertCircle,
  ChevronDown,
  PlusCircle,
  Trash2,
  Package,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Case, ClinicalEntry, StaffMember } from '../types';

const NewClinicalEntryPage: React.FC = () => {
  const { caseId, logId } = useParams();
  const navigate = useNavigate();
  const { medicines, addClinicalEntry, updateClinicalEntry, clinicalEntries, isLoading: isGlobalLoading } = useAppContext();
  const [targetCase, setTargetCase] = useState<Case | null>(null);
  const [isCaseLoading, setIsCaseLoading] = useState(true);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [doctorSelection, setDoctorSelection] = useState('');
  const [otherDoctorName, setOtherDoctorName] = useState('');

  const isEditMode = !!logId;

  const createInitialEntry = () => ({
    date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    treatment: '',
    doctorName: ''
  });

  const [entry, setEntry] = useState(createInitialEntry());
  const [selectedMeds, setSelectedMeds] = useState<{ id: string, quantity: number }[]>([]);

  useEffect(() => {
    if (isEditMode && clinicalEntries.length > 0) {
      const existing = clinicalEntries.find(ce => ce.id === logId);
      if (existing) {
        setEntry({
          date: existing.date,
          symptoms: existing.symptoms || '',
          diagnosis: existing.diagnosis,
          treatment: existing.treatment,
          doctorName: existing.doctorName
        });
      }
    }
  }, [isEditMode, logId, clinicalEntries]);

  useEffect(() => {
    apiFetch('/api/staff')
      .then(async response => response.ok ? response.json() : Promise.reject(new Error('Unable to load staff')))
      .then((members: StaffMember[]) => {
        setDoctors(members.filter(member =>
          [member.type, member.role].some(value => value?.toLowerCase().includes('doctor'))
        ));
      })
      .catch(error => console.error('Unable to load doctors', error));
  }, []);

  useEffect(() => {
    if (!entry.doctorName || doctors.length === 0) return;
    if (doctors.some(doctor => doctor.name === entry.doctorName)) {
      setDoctorSelection(entry.doctorName);
    } else {
      setDoctorSelection('__other__');
      setOtherDoctorName(entry.doctorName);
    }
  }, [doctors, entry.doctorName]);

  useEffect(() => {
    const fetchCase = async () => {
      setIsCaseLoading(true);
      try {
        const res = await apiFetch(`/api/cases/${caseId}`);
        const found = await res.json();
        if (found && !found.error) {
          setTargetCase(found);
        } else {
          alert("Case not found.");
          navigate('/cases');
        }
      } catch (error) {
        console.error('Fetch case failed', error);
        navigate('/cases');
      } finally {
        setIsCaseLoading(false);
      }
    };

    if (caseId) fetchCase();
  }, [caseId, navigate]);

  const handleUpdateEntry = (field: string, value: string) => {
    setEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMed = (medId: string) => {
    if (selectedMeds.find(m => m.id === medId)) return;
    setSelectedMeds(prev => [...prev, { id: medId, quantity: 1 }]);
  };

  const handleRemoveMed = (medId: string) => {
    setSelectedMeds(prev => prev.filter(m => m.id !== medId));
  };

  const handleUpdateMedQty = (medId: string, qty: number) => {
    setSelectedMeds(prev => prev.map(m => m.id === medId ? { ...m, quantity: Math.max(1, qty) } : m));
  };

  const { addMedicineUsage } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetCase) {
      if (!entry.diagnosis || !entry.treatment) {
        alert("Please provide diagnosis and treatment.");
        return;
      }

      if (isEditMode) {
        const updatedEntry: ClinicalEntry = {
          id: logId!,
          caseId: targetCase.id,
          date: entry.date,
          symptoms: entry.symptoms,
          diagnosis: entry.diagnosis,
          treatment: entry.treatment,
          doctorName: entry.doctorName,
          createdAt: new Date().toISOString() // Or keep original createdAt if available
        };
        updateClinicalEntry(updatedEntry);
      } else {
        const newEntry: ClinicalEntry = {
          id: `ce-${Date.now()}`,
          caseId: targetCase.id,
          date: entry.date,
          symptoms: entry.symptoms,
          diagnosis: entry.diagnosis,
          treatment: entry.treatment,
          doctorName: entry.doctorName,
          createdAt: new Date().toISOString()
        };
        addClinicalEntry(newEntry);
      }
      
      // Handle medicine usage
      selectedMeds.forEach(m => {
        const medicine = medicines.find(med => med.id === m.id);
        if (medicine) {
          addMedicineUsage({
            medicineId: m.id,
            medicineName: medicine.name,
            quantity: m.quantity,
            takenBy: entry.doctorName,
            purpose: `Treatment for ${targetCase.title} (#${targetCase.id.toUpperCase()})`,
            ward: targetCase.location || 'Clinic'
          });
        }
      });

      alert("Clinical entry saved and medicine stock updated.");
      
      navigate('/cases', { state: { openCaseId: caseId } });
    }
  };

  if (isGlobalLoading || isCaseLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  if (!targetCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="font-black uppercase tracking-[0.2em] text-xs">Case not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-slate-500 shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{isEditMode ? 'Edit Treatments' : 'Add Treatments'}</h1>
          <p className="text-slate-500 font-medium">{isEditMode ? 'Update' : 'Add'} medicines given to {targetCase.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-[#005F54] p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Stethoscope size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Case</p>
              <h3 className="text-xl font-black tracking-tight">{targetCase.id.slice(0, 8).toUpperCase()} • {targetCase.title}</h3>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Status</p>
            <p className="text-xs font-black bg-white/20 px-4 py-1.5 rounded-xl mt-1 uppercase tracking-wider">{targetCase.status}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
          <div className="space-y-8 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#005F54] flex items-center justify-center text-xs font-black border border-emerald-100">
                  1
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Clinical Record</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Calendar size={12} /> Date
                </label>
                <input 
                  type="date"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:bg-white focus:outline-none transition-all text-sm font-bold text-black shadow-inner"
                  value={entry.date}
                  onChange={e => handleUpdateEntry('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <User size={12} /> Attending Doctor
                </label>
                <select
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:bg-white focus:outline-none transition-all text-sm font-bold text-black shadow-inner"
                  value={doctorSelection}
                  onChange={e => {
                    const value = e.target.value;
                    setDoctorSelection(value);
                    if (value === '__other__') {
                      setOtherDoctorName('');
                      handleUpdateEntry('doctorName', '');
                    } else {
                      handleUpdateEntry('doctorName', value);
                    }
                  }}
                >
                  <option value="" disabled>Select a doctor</option>
                  {doctors.map(doctor => <option key={doctor.id} value={doctor.name}>{doctor.name}</option>)}
                  <option value="__other__">Other</option>
                </select>
                {doctorSelection === '__other__' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter attending doctor's name"
                    className="w-full mt-3 px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:bg-white focus:outline-none transition-all text-sm font-bold text-black shadow-inner"
                    value={otherDoctorName}
                    onChange={e => {
                      setOtherDoctorName(e.target.value);
                      handleUpdateEntry('doctorName', e.target.value);
                    }}
                  />
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Activity size={12} /> Symptoms
                </label>
                <textarea 
                  rows={2}
                  placeholder="Describe observed symptoms..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:bg-white focus:outline-none transition-all text-sm font-medium text-black shadow-inner"
                  value={entry.symptoms}
                  onChange={e => handleUpdateEntry('symptoms', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diagnosis</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Enter clinical diagnosis..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:bg-white focus:outline-none transition-all text-sm font-medium text-black shadow-inner"
                  value={entry.diagnosis}
                  onChange={e => handleUpdateEntry('diagnosis', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Treatment Plan</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Describe medicines and procedures..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:bg-white focus:outline-none transition-all text-sm font-medium text-black shadow-inner"
                  value={entry.treatment}
                  onChange={e => handleUpdateEntry('treatment', e.target.value)}
                />
              </div>
            </div>

            {/* Medicine Inventory Link */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black border border-blue-100">
                    2
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Inventory Deduction</h4>
                </div>
                <div className="relative">
                  <select 
                    className="pl-4 pr-10 py-2 bg-slate-100 border-none rounded-xl text-xs font-black uppercase tracking-widest text-[#005F54] focus:ring-0 appearance-none cursor-pointer hover:bg-emerald-50 transition-colors"
                    onChange={(e) => handleAddMed(e.target.value)}
                    value=""
                  >
                    <option value="" disabled>+ Add Medicine from Stock</option>
                    {medicines.filter(m => !selectedMeds.find(sm => sm.id === m.id)).map(med => (
                      <option key={med.id} value={med.id}>{med.name} ({med.quantity} {med.unit})</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600" />
                </div>
              </div>

              {selectedMeds.length > 0 ? (
                <div className="space-y-3">
                  {selectedMeds.map(sm => {
                    const med = medicines.find(m => m.id === sm.id);
                    return (
                      <div key={sm.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#005F54] border border-slate-200">
                            <Pill size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">{med?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Available: {med?.quantity} {med?.unit}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-white rounded-xl border border-slate-200 px-2 py-1 shadow-sm">
                            <button 
                              type="button"
                              onClick={() => handleUpdateMedQty(sm.id, sm.quantity - 1)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} className={sm.quantity === 1 ? 'text-rose-400' : 'text-slate-300'} />
                            </button>
                            <input 
                              type="number"
                              className="w-12 text-center text-sm font-black focus:outline-none border-none bg-transparent"
                              value={sm.quantity}
                              onChange={(e) => handleUpdateMedQty(sm.id, parseInt(e.target.value) || 1)}
                            />
                            <button 
                              type="button"
                              onClick={() => handleUpdateMedQty(sm.id, sm.quantity + 1)}
                              className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                            >
                              <PlusCircle size={14} className="text-emerald-500" />
                            </button>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveMed(sm.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem]">
                   <Package size={32} className="mx-auto text-slate-200 mb-3" />
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 italic">No medicines linked</p>
                   <p className="text-[10px] text-slate-400 font-medium">Use the dropdown above to deduct stock used for this case.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
            <button 
              type="submit"
              className="flex-1 py-5 bg-[#005F54] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Save size={18} />
              {isEditMode ? 'Update Clinical Entry' : 'Save Clinical Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClinicalEntryPage;
