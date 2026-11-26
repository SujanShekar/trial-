
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { 
  ChevronLeft, 
  Camera, 
  MapPin, 
  Phone, 
  User, 
  Info, 
  Save,
  PawPrint,
  ChevronDown,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Case, CaseStatus } from '../types';
import { uploadFile, base64ToFile } from '../lib/storage';
import { retryBiometrics } from '../lib/biometrics';

const EditCasePage: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { updateCase, isLoading: isGlobalLoading } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [targetCase, setTargetCase] = useState<Case | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noseVideoInputRef = useRef<HTMLInputElement>(null);
  const bodyVideoInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [noseVideo, setNoseVideo] = useState<File | null>(null);
  const [bodyVideo, setBodyVideo] = useState<File | null>(null);
  const [caseNumberError, setCaseNumberError] = useState('');

  const [formData, setFormData] = useState({
    caseNumber: '',
    dateTime: '',
    location: '',
    compName: '',
    compPhone: '',
    compAddress: '',
    animalType: 'Dog',
    customAnimalType: '',
    age: 'Unknown',
    gender: 'Male',
    description: '',
    status: CaseStatus.UNDER_TREATMENT
  });

  useEffect(() => {
    const fetchCase = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/cases/${caseId}`);
        const foundCase = await res.json();
        
        if (foundCase && !foundCase.error) {
          setTargetCase(foundCase);
          const titleParts = foundCase.title.split(' - ');
          const caseNumber = foundCase.caseNumber || titleParts[1] || '';
          const animalTypeRaw = titleParts[0]?.split(' ')[0] || 'Dog';
          
          setFormData({
            caseNumber: caseNumber,
            dateTime: foundCase.createdAt || '',
            location: foundCase.location,
            compName: foundCase.reporter?.name || '', 
            compPhone: foundCase.reporter?.phone || '',
            compAddress: foundCase.reporter?.address || '',
            animalType: ['Dog', 'Cat', 'Cow'].includes(animalTypeRaw) ? animalTypeRaw : 'Other',
            customAnimalType: ['Dog', 'Cat', 'Cow'].includes(animalTypeRaw) ? '' : animalTypeRaw,
            age: 'Unknown',
            gender: 'Male',
            description: foundCase.description,
            status: foundCase.status as CaseStatus
          });
          setSelectedImage(foundCase.imageUrl || null);
        } else {
          alert("Case not found.");
          navigate('/cases');
        }
      } catch (error) {
        console.error('Fetch case failed', error);
        navigate('/cases');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) fetchCase();
  }, [caseId, navigate]);

  const handleUpdate = async () => {
    if (!formData.caseNumber.trim()) {
      alert("Please enter a Case Number.");
      return;
    }

    if (formData.compPhone && formData.compPhone.length !== 10 && formData.compPhone !== '') {
      alert("Reporter phone number must be exactly 10 digits.");
      return;
    }

    const finalAnimalType = formData.animalType === 'Other' ? (formData.customAnimalType || 'Other') : formData.animalType;

    if (targetCase) {
      let finalImageUrl = selectedImage || undefined;
      let noseVideoUrl = targetCase.noseVideoUrl;
      let bodyVideoUrl = targetCase.bodyVideoUrl || targetCase.videoUrl;

      // Simulation Upload Logic (only if it's a new base64 image)
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
      if (noseVideo) noseVideoUrl = await uploadFile(noseVideo) || undefined;
      if (bodyVideo) bodyVideoUrl = await uploadFile(bodyVideo) || undefined;

      const updatedCase: Case = {
        ...targetCase,
        caseNumber: formData.caseNumber.trim(),
        title: `${finalAnimalType} Rescue - ${formData.caseNumber}`,
        location: formData.location,
        description: formData.description,
        status: formData.status,
        imageUrl: finalImageUrl,
        noseVideoUrl,
        bodyVideoUrl,
      };

      const savedCase = await updateCase(updatedCase);
      if (!savedCase) {
        setCaseNumberError('Case number already exists. Please choose a different number.');
        return;
      }
      alert(`Case ${formData.caseNumber} has been updated.`);
      navigate('/cases', { state: { openCaseId: caseId } });
    }
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

  if (isGlobalLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-slate-500 shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Case Registry</h1>
          <p className="text-slate-500 font-medium">Modifying official intake records for {formData.caseNumber}.</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        
        {/* Section 1: Rescue Information */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Rescue Details</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="caseNumber" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Number *</label>
                <input 
                  id="caseNumber"
                  required
                  placeholder="Enter Case ID..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black"
                  value={formData.caseNumber}
                  onChange={e => { setFormData({...formData, caseNumber: e.target.value}); setCaseNumberError(''); }}
                />
                {caseNumberError && <p className="mt-2 text-xs font-bold text-rose-600">{caseNumberError}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black appearance-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as CaseStatus})}
                  >
                    {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rescue Location</label>
              <textarea 
                rows={3}
                placeholder="Enter detailed rescue location..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="my-12 h-px bg-slate-100"></div>

        {/* Section 2: Complainant Details */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Reporter Details</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporter Name</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black"
                  value={formData.compName}
                  onChange={e => setFormData({...formData, compName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="compPhone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  id="compPhone"
                  type="tel" 
                  minLength={10}
                  maxLength={10}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black"
                  value={formData.compPhone}
                  onChange={e => setFormData({...formData, compPhone: e.target.value.replace(/\D/g, '')})}
                  placeholder="10-digit Number"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nose video</label><input ref={noseVideoInputRef} className="mt-2 block w-full text-sm" type="file" accept="video/*" onChange={e => setNoseVideo(e.target.files?.[0] || null)} /><p className="text-xs text-slate-400">Close-up of the snout. A replacement re-enrols this stream.</p></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body video</label><input ref={bodyVideoInputRef} className="mt-2 block w-full text-sm" type="file" accept="video/*" onChange={e => setBodyVideo(e.target.files?.[0] || null)} /><p className="text-xs text-slate-400">Full body in frame. A replacement re-enrols this stream.</p></div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm"><b>Biometrics:</b> {targetCase?.biometricStatus || 'Not enrolled'} {targetCase?.biometricStatus === 'failed' && <button className="ml-3 min-h-11 rounded-lg bg-[#005F54] px-3 text-xs font-bold text-white" onClick={async () => { if (targetCase) { await retryBiometrics(targetCase.id); setTargetCase({ ...targetCase, biometricStatus: 'pending' }); } }}>Retry</button>}</div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Detail</label>
              <textarea 
                rows={2}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black"
                value={formData.compAddress}
                onChange={e => setFormData({...formData, compAddress: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="my-12 h-px bg-slate-100"></div>

        {/* Section 3: Animal Details */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <PawPrint size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Animal Details</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Animal Category</label>
              <div className="relative">
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black appearance-none"
                  value={formData.animalType}
                  onChange={e => setFormData({...formData, animalType: e.target.value})}
                >
                  {['Dog', 'Cat', 'Cow', 'Other'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            {formData.animalType === 'Other' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specify Species</label>
                <input 
                  type="text" 
                  placeholder="Enter specific animal type..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black"
                  value={formData.customAnimalType}
                  onChange={e => setFormData({...formData, customAnimalType: e.target.value})}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Age</label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 focus:outline-none transition-all text-sm font-bold text-black appearance-none"
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                  >
                    <option>Kitten/Puppy</option>
                    <option>Young</option>
                    <option>Adult</option>
                    <option>Senior</option>
                    <option>Unknown</option>
                  </select>
                  <Info size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                <div className="flex gap-2">
                  {['Male', 'Female'].map(g => (
                    <button 
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex-1 py-4 bg-slate-50 rounded-2xl border-2 font-black text-[10px] uppercase tracking-wider transition-all ${formData.gender === g ? 'border-amber-600 text-amber-700 bg-amber-50' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identification Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 border-dashed transition-all group cursor-pointer ${selectedImage ? 'bg-amber-50 border-amber-600' : 'bg-slate-50 border-slate-200 hover:border-amber-600/50'}`}
              >
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-sm overflow-hidden ${selectedImage ? 'bg-white border-amber-600/20' : 'bg-white border-slate-200 text-slate-300 group-hover:text-amber-600 group-hover:scale-110'}`}>
                    {selectedImage ? (
                      <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} />
                    )}
                 </div>
                 <div className="text-sm flex-1">
                   <p className={`font-black uppercase text-xs tracking-widest ${selectedImage ? 'text-amber-700' : 'text-slate-700'}`}>
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
          </div>
        </div>

        {/* Update Action */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          <button 
            onClick={handleUpdate}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-amber-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Save size={20} />
            Update Registry Record
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditCasePage;
