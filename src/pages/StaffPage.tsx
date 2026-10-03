
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Plus, 
  HeartHandshake, 
  ShieldCheck, 
  X,
  IdCard,
  Hash,
  Cake,
  Edit2,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Home,
  Briefcase,
  CreditCard,
  Calendar,
  IndianRupee,
  Search,
  Banknote,
  LayoutGrid,
  Info,
  // Added User and Save icons to fix errors on lines 481, 490, and 648
  User,
  Save
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StaffMember } from '../types';

const StaffPage: React.FC = () => {
  const { 
  staff, 
  addStaff, 
  updateStaff, 
  deleteStaff,
  isLoading 
} = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    role: '',
    phone: '',
    joinedDate: new Date().toISOString().split('T')[0],
    bankFullName: '',
    bankName: '',
    bankBranch: '',
    ifscCode: '',
    accountNumber: '',
    salary: ''
  });

  const designations = [
    'Senior Vet', 
    'Junior Vet', 
    'Paravet', 
    'Staff Nurse', 
    'Shelter Manager', 
    'Rescue Lead', 
    'Driver', 
    'Helper', 
    'Admin', 
    'Security',
    'Coordinator',
    'Other'
  ];

  const openRegisterModal = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      type: 'Staff',
      role: 'Staff',
      phone: '',
      joinedDate: new Date().toISOString().split('T')[0],
      bankFullName: '',
      bankName: '',
      bankBranch: '',
      ifscCode: '',
      accountNumber: '',
      salary: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsEditMode(true);
    setFormData({
      name: member.name,
      type: member.salary ? 'Employee' : 'Volunteer', // Heuristic for type
      role: member.role,
      phone: member.phone,
      joinedDate: member.joinedDate,
      bankFullName: member.bankFullName || '',
      bankName: member.bankName || '',
      bankBranch: member.bankBranch || '',
      ifscCode: member.ifscCode || '',
      accountNumber: member.accountNumber || '',
      salary: member.salary?.toString() || ''
    });
    setIsDetailOpen(false);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
  if (!selectedStaff) return;

  await deleteStaff(selectedStaff.id);

  setIsDeleteConfirmOpen(false);
  setIsDetailOpen(false);
  setSelectedStaff(null);
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.phone.length < 10) {
      alert("Phone number must be at least 10 digits.");
      return;
    }

    if (isEditMode && selectedStaff) {
      updateStaff({
        ...selectedStaff,
        ...formData,
      });
    } else {
      const newStaff: StaffMember = {
        id: `s-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString()
      };
      addStaff(newStaff);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      role: '',
      phone: '',
      joinedDate: new Date().toISOString().split('T')[0],
      bankFullName: '',
      bankName: '',
      bankBranch: '',
      ifscCode: '',
      accountNumber: '',
      salary: ''
    });
  };

  const openDetail = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsDetailOpen(true);
  };

  const filteredStaff = useMemo(() => {
    return staff.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [staff, searchTerm]);

  const typeColorMap = {
    'Employee': 'bg-blue-50 text-blue-700 border-blue-100',
    'Staff': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Volunteer': 'bg-amber-50 text-amber-700 border-amber-100',
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Employees, Staff and Volunteers</h1>
          <p className="text-slate-500 font-medium">Registry of everyone contributing to the sanctuary.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={openRegisterModal}
            className="flex items-center gap-2 bg-[#005F54] text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10 hover:bg-[#004a42] transition-all"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {/* Search/Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or designation..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#005F54]/5 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredStaff.map((s) => (
          <div 
            key={s.id} 
            onClick={() => openDetail(s)}
            className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group flex flex-col items-center cursor-pointer overflow-hidden"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 text-[#005F54] flex items-center justify-center text-3xl font-black shadow-xl border-4 border-white ring-8 ring-slate-50 group-hover:scale-110 transition-transform duration-500">
                {(s.name || '?').charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#005F54] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                <ShieldCheck size={14} />
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 text-center tracking-tight leading-none mb-1">{s.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{s.role}</p>
            
            <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 bg-emerald-50 text-emerald-600 border border-emerald-100">
              Active
            </div>

            <div className="w-full pt-6 border-t border-slate-50 flex justify-center gap-4">
              <Phone size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        ))}
        {filteredStaff.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <div className="flex flex-col items-center gap-4 text-slate-300">
               <Users size={64} className="opacity-10" />
               <p className="text-xs font-black uppercase tracking-widest">No matching registry entries found</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedStaff && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsDetailOpen(false)}></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300 border border-white/50">
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex justify-between items-start">
                <div className="flex gap-6 items-center">
                  <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 text-[#005F54] flex items-center justify-center text-3xl font-black border-4 border-slate-50 shadow-lg">
                    {(selectedStaff.name || '?').charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedStaff.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-100">Staff</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Contact</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-800 font-bold text-sm">
                        <Phone size={16} className="text-[#005F54]" /> {selectedStaff.phone}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Role & History</p>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                      <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">{selectedStaff.role}</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-2">Joined: {selectedStaff.joinedDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleEdit(selectedStaff)}
                  className="flex-1 px-8 py-5 bg-[#005F54] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#004a42] transition-all shadow-xl shadow-emerald-900/10 active:scale-[0.98]"
                >
                  <Edit2 size={16} /> Edit Info
                </button>
                <button 
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex-1 px-8 py-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all border border-rose-100 active:scale-[0.98]"
                >
                  <Trash2 size={16} /> Remove Registry Entry
                </button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Overlay */}
          {isDeleteConfirmOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeleteConfirmOpen(false)}></div>
              <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm p-10 space-y-8 animate-in zoom-in duration-200 shadow-2xl border border-white/20">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto border-2 border-rose-100">
                  <AlertTriangle size={40} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Revoke Registry?</h3>
                  <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                    This will permanently remove <span className="font-bold text-slate-900">{selectedStaff.name}</span> from our system.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleDelete}
                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all active:scale-[0.98]"
                  >
                    Confirm Deletion
                  </button>
                  <button 
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Register/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300 border border-white/20">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-10 py-8 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#005F54] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                  {isEditMode ? <Edit2 size={24} /> : <Users size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {isEditMode ? `Edit Entry` : `Add New Member`}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                    Registry Intake Form
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-2xl transition-all">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Type of Member</label>
                <div className="flex gap-4">
                  {['Employee', 'Volunteer', 'Doctor/Admin'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t, role: t === 'Volunteer' ? 'Volunteer' : formData.role })}
                      className={`flex-1 py-4 px-6 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.type === t 
                          ? 'bg-[#005F54] text-white border-[#005F54] shadow-lg' 
                          : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* PERSONAL DETAILS */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                   <User className="text-[#005F54]" size={20} />
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Full Legal Name *</label>
                      <input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        minLength={10}
                        maxLength={10}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
                        placeholder="10-digit Number" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Date of Joining</label>
                      <input type="date" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.joinedDate} onChange={e => setFormData({...formData, joinedDate: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Designation / Role</label>
                      <div className="relative">
                        <select 
                          required 
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-black focus:outline-none appearance-none cursor-pointer" 
                          value={formData.role} 
                          onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                          <option value="" disabled>Select Designation</option>
                          {designations.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                </div>
              </div>

              {/* FINANCIAL DETAILS - ONLY FOR EMPLOYEE & DOCTOR/ADMIN */}
              {(formData.type === 'Employee' || formData.type === 'Doctor/Admin') && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                     <Banknote className="text-[#005F54]" size={20} />
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Financial Details</h3>
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full ml-auto">Optional Information</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name as per Bank</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.bankFullName} onChange={e => setFormData({...formData, bankFullName: e.target.value})} placeholder="Same as bank records" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Name</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="e.g. SBI, HDFC" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Branch</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.bankBranch} onChange={e => setFormData({...formData, bankBranch: e.target.value})} placeholder="Mysuru Main" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IFSC Code</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all uppercase" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} placeholder="SBIN0001234" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Number</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-black focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} placeholder="0000 0000 0000" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Offered Monthly Salary (₹)</label>
                        <div className="relative">
                          <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="number" className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-emerald-700 focus:ring-4 focus:ring-[#005F54]/5 focus:border-[#005F54] focus:outline-none transition-all" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="35000" />
                        </div>
                      </div>
                  </div>
                </div>
              )}

              <div className="pt-10 border-t border-slate-100 flex flex-col items-center">
                <button 
                  type="submit" 
                  disabled={!isEditMode && !formData.type}
                  className={`w-full max-w-lg py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${(!isEditMode && !formData.type) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-[#005F54] text-white hover:bg-[#004a42] shadow-emerald-900/30 active:scale-[0.98]'}`}
                >
                  <Save size={20} />
                  {isEditMode 
                    ? 'Update Member Profile' 
                    : formData.type 
                      ? `Add ${formData.type}` 
                      : 'Add'}
                </button>
                <p className="mt-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                   <Info size={12} /> Data is secured via PFA internal registry protocols
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
