
import React, { useState, useMemo } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  HandHeart, 
  Calendar, 
  Printer, 
  Search, 
  Table as TableIcon,
  FileText,
  ShieldCheck,
  Phone,
  User,
  QrCode,
  Banknote,
  Wallet,
  PenLine,
  AlertCircle,
  Clock,
  Save,
  CreditCard,
  IdCard,
  Info,
  Trash2
} from 'lucide-react';
import { Donation } from '../types';
import { useAppContext } from '../context/AppContext';
import { findDuplicate } from '../lib/uniqueness';

type TimeFilter = 'All' | 'Weekly' | 'Monthly' | 'Yearly';

const DonationsPage: React.FC = () => {
  const { donations, addDonation, deleteDonation, isLoading } = useAppContext();
  const [view, setView] = useState<'new-entry' | 'ledger'>('new-entry');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');

  // New Donation Form State
  const [newEntry, setNewEntry] = useState({
    donorName: '',
    amount: '',
    message: '',
    paymentId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = d.donorName.toLowerCase().includes(term) ||
                            d.id.toLowerCase().includes(term);
      
      let matchesTime = true;
      const dDateStr = d.date || d.createdAt || '';
      const dDate = new Date(dDateStr);
      const now = new Date();
      
      if (timeFilter === 'Weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        matchesTime = dDate >= oneWeekAgo;
      } else if (timeFilter === 'Monthly') {
        matchesTime = dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'Yearly') {
        matchesTime = dDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesTime;
    }).sort((a, b) => new Date(b.date || b.createdAt || '').getTime() - new Date(a.date || a.createdAt || '').getTime());
  }, [donations, searchTerm, timeFilter]);

  const donorAggregates = useMemo(() => {
    if (!searchTerm) return null;
    const exactMatches = filteredDonations;
    if (exactMatches.length === 0) return null;
    const total = exactMatches.reduce((acc, curr) => acc + curr.amount, 0);
    const count = exactMatches.length;
    const sample = exactMatches[0];
    const isSingleDonor = exactMatches.every(d => d.donorName === sample.donorName);
    if (isSingleDonor) {
      return {
        total,
        count,
        name: sample.donorName
      };
    }
    return null;
  }, [filteredDonations, searchTerm]);

  const totalAmount = useMemo(() => {
    return donations.reduce((sum, d) => sum + d.amount, 0);
  }, [donations]);

  const reportStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let weekly = 0, monthly = 0, yearly = 0;
    donations.forEach(d => {
      const dDateStr = d.date || d.createdAt || '';
      const dDate = new Date(dDateStr);
      if (dDate >= startOfWeek) weekly += d.amount;
      if (dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear) monthly += d.amount;
      if (dDate.getFullYear() === currentYear) yearly += d.amount;
    });
    return { weekly, monthly, yearly };
  }, [donations]);

  const handlePrint = () => {
    window.print();
  };

  const handleRemoveDonation = (id: string) => {
    if (window.confirm("Are you sure you want to remove this donation record?")) {
      deleteDonation(id);
    }
  };

  const handleNewDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duplicate = findDuplicate(newEntry.paymentId, donations.flatMap(donation => donation.paymentId ? [donation.paymentId] : []));
    if (duplicate) { alert(`Similar item exists: ${duplicate}`); return; }
    const amount = Number(newEntry.amount);
    if (!Number.isFinite(amount) || amount < 1 || amount > 10_000_000) {
      alert("Donation amount must be between ₹1 and ₹1,00,00,000.");
      return;
    }
    
    const entry: Donation = {
      id: `D${Math.floor(Math.random() * 1000) + 200}`,
      donorName: newEntry.donorName,
      amount,
      message: newEntry.message,
      paymentId: newEntry.paymentId,
      date: newEntry.date,
      createdAt: new Date().toISOString()
    };
    addDonation(entry);
    alert("Donation registered successfully.");
    setNewEntry({ donorName: '', amount: '', message: '', paymentId: '', date: new Date().toISOString().split('T')[0] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  const paymentModes = [
    { id: 'Cash', icon: Banknote, label: 'Cash' },
    { id: 'UPI', icon: QrCode, label: 'UPI' },
    { id: 'Cheque', icon: Wallet, label: 'Cheque' },
  ] as const;

  const SummarySection = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 no-print">
      <button 
        onClick={() => setTimeFilter('All')}
        className="bg-[#005F54] p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden md:col-span-1 text-left group transition-all hover:scale-[1.02]"
      >
         <div className="relative z-10">
           <div className="flex items-center justify-between mb-8">
             <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20"><IndianRupee size={24} /></div>
             <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Live</span>
           </div>
           <p className="text-emerald-100/80 text-xs font-black uppercase tracking-[0.2em] mb-1">Total Money</p>
           <h3 className="text-4xl font-black mb-6 tracking-tighter">₹ {totalAmount.toLocaleString('en-IN')}</h3>
           <div className="flex items-center gap-2 text-[10px] font-black bg-emerald-900/30 w-fit px-4 py-2 rounded-full uppercase tracking-widest">
             <TrendingUp size={14} />
             <span>Active</span>
           </div>
         </div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
      </button>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 md:col-span-3 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports</h4>
          <span className="text-[9px] font-black text-[#005F54] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            {timeFilter === 'All' ? 'Showing All' : `Filtering: ${timeFilter}`}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setTimeFilter('Weekly')}
            className={`p-6 rounded-3xl border text-left transition-all duration-300 ${timeFilter === 'Weekly' ? 'bg-blue-50 border-blue-200 ring-4 ring-blue-100' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
          >
             <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${timeFilter === 'Weekly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                   <Clock size={20} />
                </div>
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Weekly</h5>
             </div>
             <p className="text-xl font-black text-slate-900 tracking-tight">₹ {reportStats.weekly.toLocaleString('en-IN')}</p>
             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Last 7 Days</p>
          </button>

          <button 
            onClick={() => setTimeFilter('Monthly')}
            className={`p-6 rounded-3xl border text-left transition-all duration-300 ${timeFilter === 'Monthly' ? 'bg-indigo-50 border-indigo-200 ring-4 ring-indigo-100' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
          >
             <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${timeFilter === 'Monthly' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                   <Calendar size={20} />
                </div>
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Monthly</h5>
             </div>
             <p className="text-xl font-black text-slate-900 tracking-tight">₹ {reportStats.monthly.toLocaleString('en-IN')}</p>
             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">This Month</p>
          </button>

          <button 
            onClick={() => setTimeFilter('Yearly')}
            className={`p-6 rounded-3xl border text-left transition-all duration-300 ${timeFilter === 'Yearly' ? 'bg-emerald-50 border-emerald-200 ring-4 ring-emerald-100' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
          >
             <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${timeFilter === 'Yearly' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                   <TrendingUp size={20} />
                </div>
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Yearly</h5>
             </div>
             <p className="text-xl font-black text-slate-900 tracking-tight">₹ {reportStats.yearly.toLocaleString('en-IN')}</p>
             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">This Year</p>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="no-print">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Donations</h1>
          <p className="text-slate-500 font-medium">Track money and items given to us.</p>
        </div>
        
        <div className="hidden print:block mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#005F54] rounded-full flex items-center justify-center text-white font-black text-xl">PFA</div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">People For Animals (PFA)</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Donation Records</p>
            </div>
          </div>
          <div className="h-1 bg-slate-900 w-full mt-4"></div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <div className="flex bg-white p-1 border border-slate-200 rounded-xl shadow-sm">
            <button 
              onClick={() => setView('new-entry')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'new-entry' ? 'bg-[#005F54] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <PenLine size={16} />
              Add Donation
            </button>
            <button 
              onClick={() => setView('ledger')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'ledger' ? 'bg-[#005F54] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <TableIcon size={16} />
              View List
            </button>
          </div>
          {view === 'ledger' && (
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 ml-2"
            >
              <Printer size={18} />
              Print
            </button>
          )}
        </div>
      </div>

      {view === 'new-entry' ? (
        <div className="max-w-4xl mx-auto no-print space-y-8 animate-in slide-in-from-left duration-500">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-[#005F54] p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <HandHeart size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">Add New Donation</h2>
                  <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest mt-1">Donation Form</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleNewDonationSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <User size={12} /> Donor Name
                  </label>
                  <input 
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:outline-none transition-all shadow-sm" 
                    value={newEntry.donorName} 
                    onChange={e => setNewEntry({...newEntry, donorName: e.target.value})} 
                    placeholder="Enter Donor Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <IndianRupee size={12} /> Amount (₹)
                  </label>
                  <input 
                    required 
                    type="number"
                    min="1"
                    max="10000000"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:outline-none transition-all shadow-sm" 
                    value={newEntry.amount} 
                    onChange={e => setNewEntry({...newEntry, amount: e.target.value})} 
                    placeholder="0.00"
                  />
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
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:outline-none" 
                    value={newEntry.date} 
                    onChange={e => setNewEntry({...newEntry, date: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <CreditCard size={12} /> Payment ID / Reference
                  </label>
                  <input 
                  required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:outline-none shadow-sm" 
                    value={newEntry.paymentId} 
                    onChange={e => setNewEntry({...newEntry, paymentId: e.target.value})} 
                    placeholder="e.g. TXN123456"
                  />
                  {newEntry.paymentId && findDuplicate(newEntry.paymentId, donations.flatMap(donation => donation.paymentId ? [donation.paymentId] : [])) && <p className="text-xs font-bold text-amber-600">Similar item exists: {findDuplicate(newEntry.paymentId, donations.flatMap(donation => donation.paymentId ? [donation.paymentId] : []))}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <PenLine size={12} /> Message / Notes
                </label>
                <textarea 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-[#005F54]/10 focus:outline-none shadow-sm" 
                  value={newEntry.message} 
                  onChange={e => setNewEntry({...newEntry, message: e.target.value})} 
                  placeholder="Optional message from donor..."
                  rows={3}
                />
              </div>

              <div className="pt-8 flex justify-end">
                <button 
                  type="submit" 
                  className="py-6 px-12 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center gap-4 active:scale-95 group bg-[#1A3F33] text-white hover:bg-[#132E25]"
                >
                  <Save size={24} className="group-hover:scale-110 transition-transform" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right duration-500">
          <SummarySection />
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                 <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Search Records</h2>
                 <p className="text-xs text-slate-400 font-medium">Find by ID, Phone or Name.</p>
               </div>
               <div className="relative flex-1 max-w-xl w-full">
                  <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Type Name, ID, or Phone..." 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-[#005F54]/10 focus:border-[#005F54] font-bold text-slate-800 transition-all placeholder:text-slate-300 shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
          </div>

          {donorAggregates && (
            <div className="bg-[#005F54] p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 text-white font-black text-2xl">
                  {donorAggregates.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Donor Profile</p>
                  <h3 className="text-3xl font-black">{donorAggregates.name}</h3>
                  <div className="flex gap-4 mt-2 text-xs font-bold opacity-90">
                    <span className="flex items-center gap-1"><IdCard size={12} /> Regular Donor</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right bg-white/10 p-6 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Lifetime Contribution</p>
                <h3 className="text-4xl font-black tracking-tighter mt-1">₹ {donorAggregates.total.toLocaleString('en-IN')}</h3>
                <p className="text-xs font-bold opacity-70 mt-1">{donorAggregates.count} Transactions Found</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between print:px-0">
               <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                   <ShieldCheck className="text-emerald-500" size={24} />
                   Transaction History
                 </h3>
                 <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">
                   {donorAggregates ? `Filtered for: ${donorAggregates.name}` : 'Recent Donations'}
                 </p>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="responsive-table w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] print:bg-white print:border-b-2 print:border-slate-800">
                  <tr>
                    <th className="px-8 py-5">Entry ID</th>
                    <th className="px-8 py-5">Donor Name</th>
                    <th className="px-8 py-5">Payment ID</th>
                    <th className="px-8 py-5">Message</th>
                    <th className="px-8 py-5">Amount (₹)</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5 text-right no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 print:divide-slate-200">
                  {filteredDonations.map((row) => (
                    <tr key={row.id} className="hover:bg-emerald-50/5 transition-colors print:hover:bg-transparent">
                      <td className="px-8 py-6 text-xs font-mono text-slate-400">#{row.id}</td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-800">{row.donorName}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-600">{row.paymentId || 'N/A'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-medium text-slate-500 line-clamp-1 max-w-[150px]">{row.message || '-'}</span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900 text-sm tracking-tighter">₹ {row.amount.toLocaleString('en-IN')}</td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-500">{row.date || new Date(row.createdAt || '').toLocaleDateString('en-GB')}</td>
                      <td className="px-8 py-6 text-right no-print">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => alert(`Donation #${row.id}\nDonor: ${row.donorName}\nAmount: ₹${row.amount.toLocaleString('en-IN')}\nPayment reference: ${row.paymentId || 'N/A'}\nNotes: ${row.message || 'None'}`)}
                            aria-label={`View details for donation ${row.id}`}
                            className="p-2.5 text-slate-300 hover:text-[#005F54] hover:bg-emerald-50 rounded-xl transition-all"
                          >
                            <Info size={20} />
                          </button>
                          <button 
                            onClick={() => handleRemoveDonation(row.id)}
                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDonations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-24 text-center">
                         <div className="flex flex-col items-center gap-3 text-slate-300">
                            <Search size={48} className="opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">No matching records found</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          aside { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; width: 100% !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; }
          .border { border: 1px solid #e2e8f0 !important; }
          .rounded-[2.5rem], .rounded-3xl { border-radius: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border-bottom: 1px solid #f1f5f9 !important; }
          .bg-slate-50 { background-color: transparent !important; }
        }
      `}</style>
    </div>
  );
};

export default DonationsPage;
