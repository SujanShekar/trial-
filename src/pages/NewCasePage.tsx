
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  Camera, 
  MapPin, 
  Phone, 
  User, 
  Info, 
  Layout, 
  Save,
  PawPrint,
  ChevronDown,
  Bird,
  Trees,
  ArrowRight,
  Home,
  Search,
  Plus,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MYSURU_AREAS as GLOBAL_MYSURU_AREAS } from '../constants';
import { Case, CaseStatus } from '../types';
import { uploadFile, base64ToFile } from '../lib/storage';

const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addCase, isLoading } = useAppContext();
  const areaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Skip selection view if coming from declaration redirection
  const fromDeclaration = location.state?.fromDeclaration || false;
  const declarerData = location.state?.declarerData || null;

  const [isSelectionView, setIsSelectionView] = useState(!fromDeclaration);
  const [availableAreas, setAvailableAreas] = useState<string[]>(GLOBAL_MYSURU_AREAS);
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [isCustomAreaMode, setIsCustomAreaMode] = useState(false);
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  
  // Helper to get formatted current time matching INITIAL_CASES format (24h)
  const getFormattedNow = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} ${time}`;
  };

  const [formData, setFormData] = useState({
    caseNumber: '',
    dateTime: getFormattedNow(),
    rescueArea: '',
    detailedAddress: '',
    compName: '',
    compPhone: '',
    compAddress: '',
    animalType: 'Dog',
    customAnimalType: '',
    age: 'Unknown',
    gender: 'Male',
    description: '',
    caseReason: 'Treatment'
  });

  // Handle outside clicks to close area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setShowAreaSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AUTO-FETCH LOGIC: Populate form if coming from a declaration
  useEffect(() => {
    if (fromDeclaration && declarerData) {
      // Determine animal type from passed text if possible
      const incomingSpecies = declarerData.species.toLowerCase();
      let animalType = 'Other';
      let customType = declarerData.species;
      
      if (incomingSpecies.includes('dog')) animalType = 'Dog';
      else if (incomingSpecies.includes('cat')) animalType = 'Cat';
      else if (incomingSpecies.includes('cow')) animalType = 'Cow';

      // Map age to available options
      const incomingAge = declarerData.age.toLowerCase();
      let mappedAge = 'Unknown';
      if (incomingAge.includes('puppy') || incomingAge.includes('kitten')) mappedAge = 'Kitten/Puppy';
      else if (incomingAge.includes('young')) mappedAge = 'Young';
      else if (incomingAge.includes('senior') || incomingAge.includes('old')) mappedAge = 'Senior';
      else if (incomingAge.includes('adult')) mappedAge = 'Adult';

      setFormData(prev => ({
        ...prev,
        compName: declarerData.name,
        compPhone: declarerData.phone,
        compAddress: declarerData.address,
        detailedAddress: declarerData.address, // Defaulting rescue location details to reporter's address
        animalType: animalType as any,
        customAnimalType: animalType === 'Other' ? customType : '',
        age: mappedAge as any,
        description: declarerData.description
      }));
    }
  }, [fromDeclaration, declarerData]);

  const filteredAreas = useMemo(() => {
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
      // Update state so it persists in the component's lifecycle
      setAvailableAreas(prev => [...prev, newArea].sort());
    }
    setFormData({ ...formData, rescueArea: newArea });
    setAreaSearch(newArea);
    setIsCustomAreaMode(false);
    setCustomAreaInput('');
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
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVideo(e.target.files?.[0] || null);
  };
const isFormValid =
  formData.caseNumber.trim() !== '' &&
  formData.rescueArea.trim() !== '' &&
  formData.detailedAddress.trim() !== '' &&
  formData.compName.trim() !== '' &&
  /^[0-9]\d{9}$/.test(formData.compPhone.trim()) &&
  formData.compAddress.trim() !== '' &&
  formData.animalType.trim() !== '' &&
  (formData.animalType !== 'Other' ||
    formData.customAnimalType.trim() !== '') &&
  formData.age.trim() !== '' &&
  formData.gender.trim() !== '' &&
  formData.description.trim() !== '' &&
  selectedImage !== null;
  const handleFinalize = async () => {
  // Trimmed values
  const trimmedCaseNumber = formData.caseNumber.trim();
  const trimmedDetailedAddress = formData.detailedAddress.trim();
  const trimmedCompName = formData.compName.trim();
  const trimmedCompPhone = formData.compPhone.trim();
  const trimmedCompAddress = formData.compAddress.trim();
  const trimmedDescription = formData.description.trim();
  const trimmedCustomAnimalType = formData.customAnimalType.trim();

  // Mandatory validations
  if (!trimmedCaseNumber) {
    alert("Case Number is required.");
    return;
  }

  if (!formData.rescueArea) {
    alert("Please select a Rescue Area.");
    return;
  }

  if (!trimmedDetailedAddress) {
    alert("Detailed Address / Landmark is required.");
    return;
  }

  if (!trimmedCompName) {
    alert("Reporter Name is required.");
    return;
  }

  if (!trimmedCompPhone) {
    alert("Reporter Phone Number is required.");
    return;
  }

  if (trimmedCompPhone.length !== 10) {
    alert("Reporter phone number must be exactly 10 digits.");
    return;
  }

  if (!trimmedCompAddress) {
    alert("Reporter Address is required.");
    return;
  }

  if (!formData.animalType) {
    alert("Animal Category is required.");
    return;
  }

  if (formData.animalType === 'Other' && !trimmedCustomAnimalType) {
    alert("Please specify the animal type.");
    return;
  }

  if (!formData.age) {
    alert("Animal Age is required.");
    return;
  }

  if (!formData.gender) {
    alert("Animal Gender is required.");
    return;
  }

  if (!trimmedDescription) {
    alert("Description / Look is required.");
    return;
  }

  if (!selectedImage) {
    alert("Identification Photo is required.");
    return;
  };

  const finalAnimalType =
    formData.animalType === 'Other'
      ? trimmedCustomAnimalType
      : formData.animalType;

  const combinedLocation = `${formData.rescueArea}${
    trimmedDetailedAddress ? `, ${trimmedDetailedAddress}` : ''
  }`;

  let finalImageUrl = selectedImage || undefined;
  let finalVideoUrl: string | undefined;

  // Simulation Upload Logic
  if (selectedImage && selectedImage.startsWith('data:')) {
    try {
      const file = base64ToFile(
        selectedImage,
        `${formData.caseNumber}-${Date.now()}.jpg`
      );

      const uploadedUrl = await uploadFile(file);

      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    } catch (error) {
      console.error('Simulation upload failed:', error);
    }
  };

  if (selectedVideo) {
    try {
      const uploadedUrl = await uploadFile(selectedVideo);
      if (uploadedUrl) finalVideoUrl = uploadedUrl;
    } catch (error) {
      console.error('Video upload failed:', error);
    }
  }

  // Get current user from local session
  const savedUser = localStorage.getItem('pfa_user_session');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const newCase: Case = {
    id: Math.random().toString(36).substr(2, 9),
    title: `${finalAnimalType} Rescue - ${trimmedCaseNumber}`,
    location: combinedLocation,
    description: `Age: ${formData.age}
Gender: ${formData.gender}

${trimmedDescription}

Reporter: ${trimmedCompName} (${trimmedCompPhone})
Reporter Address: ${trimmedCompAddress}`,

    status: CaseStatus.UNDER_TREATMENT,
    // reportedById: user?.id,
    imageUrl: finalImageUrl,
    videoUrl: finalVideoUrl,
    createdAt: new Date().toISOString()
  };

  addCase(newCase);

  alert(`Case ${trimmedCaseNumber} has been successfully registered.`);
  navigate('/cases');
}
    

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  if (isSelectionView) {
    return (
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 py-10 pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-slate-500 shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Select Category</h1>
            <p className="text-slate-500 font-medium">Choose the type of animal rescue to register.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => setIsSelectionView(false)}
            className="group relative bg-white hover:bg-emerald-50 border-2 border-slate-100 hover:border-[#005F54] p-10 rounded-[3rem] transition-all duration-300 shadow-sm hover:shadow-2xl text-left flex flex-col items-start gap-6 overflow-hidden h-96"
          >
            <div className="w-20 h-20 bg-emerald-100 text-[#005F54] rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-md">
              <PawPrint size={40} />
            </div>
            <div className="relative z-10 mt-auto">
              <h2 className="text-3xl font-black text-slate-900 group-hover:text-[#005F54] transition-colors tracking-tight">Domestic</h2>
              <p className="text-slate-500 font-medium mt-2 leading-relaxed max-w-xs">
                Registration for Dogs, Cats, Cows, and other domestic or farm animals.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-[#005F54] transition-colors">
                Proceed to Form <ArrowRight size={16} />
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-700">
              <Home size={300} />
            </div>
          </button>

          <button 
            onClick={() => navigate('/wildlife')}
            className="group relative bg-white hover:bg-amber-50 border-2 border-slate-100 hover:border-amber-600 p-10 rounded-[3rem] transition-all duration-300 shadow-sm hover:shadow-2xl text-left flex flex-col items-start gap-6 overflow-hidden h-96"
          >
            <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-md">
              <Bird size={40} />
            </div>
            <div className="relative z-10 mt-auto">
              <h2 className="text-3xl font-black text-slate-900 group-hover:text-amber-700 transition-colors tracking-tight">Wildlife</h2>
              <p className="text-slate-500 font-medium mt-2 leading-relaxed max-w-xs">
                For Snakes, Birds, Monkeys, and protected species transfers or intake.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-700 transition-colors">
                Open Wildlife Registry <ArrowRight size={16} />
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-700">
              <Trees size={300} />
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            if (fromDeclaration) navigate('/declaration');
            else setIsSelectionView(true);
          }} 
          className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-slate-500 shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">New Domestic Case</h1>
          <p className="text-slate-500 font-medium">
            {fromDeclaration ? 'Auto-populated from surrender declaration.' : 'Registering a new domestic animal intake.'}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        
        {/* Section 1: Rescue Information */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#005F54]/10 text-[#005F54] flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Rescue Details</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="caseNumber" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Number *</label>
                <input 
                required
                  id="caseNumber"
                  
                  placeholder="Enter Case ID..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black placeholder:text-slate-300"
                  value={formData.caseNumber}
                  onChange={e => setFormData({...formData, caseNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date & Time</label>
                <input disabled value={formData.dateTime} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-sm font-bold" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Typeable Dropdown for Rescue Area */}
              <div className="space-y-2 relative" ref={areaRef}>
                <label htmlFor="rescueArea" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rescue Area (Mysuru) *</label>
                <div className="relative">
                   <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-opacity ${areaSearch ? 'opacity-0' : 'opacity-100'}`}>
                      <Search size={16} />
                   </div>
                   <input 
                   required
                     id="rescueArea"
                     type="text"
                     placeholder="Search or select area..."
                     className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
                     value={areaSearch}
                     onFocus={() => setShowAreaSuggestions(true)}
                     onChange={(e) => { setAreaSearch(e.target.value); setShowAreaSuggestions(true); }}
                   />
                   <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${showAreaSuggestions ? 'rotate-180' : ''}`} />
                </div>

                {showAreaSuggestions && (
                  <div className="absolute z-[100] left-0 right-0 top-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
                    {filteredAreas.map(area => (
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
                  <div className="mt-3 p-6 bg-[#005F54]/5 border-2 border-dashed border-[#005F54]/20 rounded-2xl animate-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-[10px] font-black text-[#005F54] uppercase tracking-widest">Enter New Rescue Area</label>
                       <button onClick={() => setIsCustomAreaMode(false)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600">
                          <X size={14} />
                       </button>
                    </div>
                    <div className="flex gap-2">
                       <input 
                       required
                         autoFocus
                         placeholder="Type new area name..."
                         className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] outline-none"
                         value={customAreaInput}
                         onChange={(e) => setCustomAreaInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleAddCustomArea()}
                       />
                       <button 
                         type="button"
                         onClick={handleAddCustomArea}
                         className="px-6 bg-[#005F54] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                       >
                         Add
                       </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Address / Landmark</label>
                <input 
                required
                  type="text"
                  placeholder="Street No, Door No, Landmark..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black placeholder:text-slate-300"
                  value={formData.detailedAddress}
                  onChange={e => setFormData({...formData, detailedAddress: e.target.value})}
                />
              </div>
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
                required
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
                  value={formData.compName}
                  onChange={e => setFormData({...formData, compName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="compPhone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                required
                  id="compPhone"
                  type="tel" 
                  minLength={10}
                  maxLength={10}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
                  value={formData.compPhone}
                  onChange={e => setFormData({...formData, compPhone: e.target.value.replace(/\D/g, '')})}
                  placeholder="10-digit Number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Detail</label>
              <textarea 
              required
                rows={2}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
                value={formData.compAddress}
                onChange={e => setFormData({...formData, compAddress: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Video (optional)</label>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={videoInputRef}
                onChange={handleVideoChange}
              />
              <div
                onClick={() => videoInputRef.current?.click()}
                className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 border-dashed transition-all group cursor-pointer ${selectedVideo ? 'bg-emerald-50 border-[#005F54]' : 'bg-slate-50 border-slate-200 hover:border-[#005F54]/50'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-sm ${selectedVideo ? 'bg-white border-[#005F54]/20 text-[#005F54]' : 'bg-white border-slate-200 text-slate-300 group-hover:text-[#005F54]'}`}>
                  <Camera size={24} />
                </div>
                <div className="text-sm flex-1">
                  <p className={`font-black uppercase text-xs tracking-widest ${selectedVideo ? 'text-[#005F54]' : 'text-slate-700'}`}>{selectedVideo ? 'Video selected' : 'Scene video'}</p>
                  <p className="text-slate-400 text-xs font-medium mt-1">{selectedVideo?.name || 'Upload an optional video from the rescue scene.'}</p>
                </div>
                {selectedVideo && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedVideo(null); if (videoInputRef.current) videoInputRef.current.value = ''; }}
                    className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
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
              <label htmlFor="animalType" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Animal Category</label>
              <div className="relative">
                <select
                required 
                  id="animalType"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black appearance-none"
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
            
            {(formData.animalType === 'Other' || (fromDeclaration && formData.animalType === 'Other')) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specify Species</label>
                <input 
                required
                  type="text" 
                  placeholder="Enter specific animal type..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
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
                  required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black appearance-none"
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                  >
                    {formData.animalType === 'Dog' && <option>Puppy</option>}
                    {formData.animalType === 'Cat' && <option>Kitten</option>}
                    {formData.animalType === 'Cow' && <option>Calf</option>}
                    {(formData.animalType !== 'Dog' && formData.animalType !== 'Cat' && formData.animalType !== 'Cow') && <option>Young</option>}
                    <option>Young Adult</option>
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
                  {['Male', 'Female', 'Unknown'].map(g => (
                    <button 
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex-1 py-4 bg-slate-50 rounded-2xl border-2 font-black text-[10px] uppercase tracking-wider transition-all ${formData.gender === g ? 'border-[#005F54] text-[#005F54] bg-emerald-50' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Look</label>
              <textarea 
              required
                rows={4}
                placeholder="Markings, scars, color, or initial assessment notes..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black placeholder:text-slate-300"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identification Photo</label>
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
          </div>
        </div>

        {/* Finalize Action */}
        {isFormValid && (
  <div className="mt-16 pt-8 border-t border-slate-100 animate-in fade-in duration-300">
    <button 
    onClick={handleFinalize}
      className="w-full bg-[#005F54] hover:bg-[#004a42] text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
    >
      <Save size={20} />
      Save Case
    </button>
  </div>
)}

      </div>
    </div>
  );
};

export default NewCasePage;
