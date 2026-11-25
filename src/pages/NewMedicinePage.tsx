
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Pill, 
  Package, 
  AlertCircle, 
  Tag, 
  Layers,
  Calendar
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { findDuplicate } from '../lib/uniqueness';
import { Medicine } from '../types';

const NewMedicinePage: React.FC = () => {
  const navigate = useNavigate();
  const { addMedicine, medicines } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Antibiotics',
    customCategory: '',
    quantity: '',
    minStockLevel: '',
    unit: 'Vials'
  });

  const categories = [
    'Antibiotics',
    'NSAIDs',
    'Vaccines',
    'Anaesthetics',
    'Steroids',
    'Antiparasitic',
    'Gastrointestinal (GI) drugs',
    'Supplements',
    'IV Fluids',
    'Wound disinfectants',
    'Others'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duplicate = findDuplicate(formData.name, medicines.map(medicine => medicine.name));
    if (duplicate) { alert(`Similar item exists: ${duplicate}`); return; }
    
    const finalCategory = formData.category === 'Others' ? (formData.customCategory || 'Others') : formData.category;

    const newMed: Medicine = {
      id: `m-${Date.now()}`,
      name: formData.name,
      category: finalCategory,
      quantity: parseInt(formData.quantity) || 0,
      unit: formData.unit,
      // Default to 10 if nothing is entered
      minStockLevel: formData.minStockLevel === '' ? 10 : parseInt(formData.minStockLevel),
      createdAt: new Date().toISOString()
    };

    addMedicine(newMed);
    
    alert(`Successfully registered ${formData.name} in PFA Pharmacy Inventory.`);
    navigate('/inventory');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-500 shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pharmacy Intake</h1>
          <p className="text-slate-500 font-medium">Adding new medicinal stock to the sanctuary inventory.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-[#005F54] p-8 text-white flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
            <Pill size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Sanctuary Pharmacy</p>
            <h3 className="text-xl font-black tracking-tight">New Stock Item Registration</h3>
            <p className="text-xs font-medium text-emerald-100/60 mt-1 italic">Authorized medical officer entry only.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Tag size={12} /> Commercial Name
              </label>
              <input 
                type="text"
                required
                placeholder="Enter medicine name..."
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black placeholder:text-slate-300"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              {findDuplicate(formData.name, medicines.map(medicine => medicine.name)) && <p className="text-xs text-amber-600 font-bold">Similar item exists: {findDuplicate(formData.name, medicines.map(medicine => medicine.name))}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Layers size={12} /> Category
              </label>
              <select 
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => <option key={cat}>{cat}</option>)}
              </select>
              {formData.category === 'Others' && (
                <input 
                  type="text"
                  placeholder="Specify Category"
                  className="w-full mt-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none animate-in fade-in text-sm font-medium"
                  value={formData.customCategory}
                  onChange={e => setFormData({...formData, customCategory: e.target.value})}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Package size={12} /> Current Stock Level
                </label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 50"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Layers size={12} /> Unit
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Vials, Tablets"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <AlertCircle size={12} /> Minimum Stock Value
              </label>
              <input 
                type="number"
                placeholder="Defaults to 10"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005F54]/10 focus:border-[#005F54] focus:outline-none transition-all text-sm font-bold text-black"
                value={formData.minStockLevel}
                onChange={e => setFormData({...formData, minStockLevel: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button 
              type="submit"
              className="w-full bg-[#005F54] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 hover:bg-[#004a42] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Save size={20} />
              Commit to Registry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMedicinePage;
