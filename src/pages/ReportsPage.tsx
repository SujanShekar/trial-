
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Heart, Activity, Pill, Users, Scissors, LayoutGrid, ShieldCheck, Filter, FileDown, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CaseStatus } from '../types';
import { User } from '../types';
import { apiFetch } from '../lib/api';

interface ReportsPageProps {
  user: User | null;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const { medicines, staff, abcRecords, donations, adoptions, isLoading } = useAppContext();
  const [reportCases, setReportCases] = React.useState<any[]>([]);
  const [isFetchingCases, setIsFetchingCases] = React.useState(false);
  const [adoptionStats, setAdoptionStats] = React.useState<{ total: number; byMonth: Record<string, number>; byAnimalType: Record<string, number> }>({ total: 0, byMonth: {}, byAnimalType: {} });

  React.useEffect(() => {
    setIsFetchingCases(true);
    apiFetch('/api/cases/export')
      .then(res => res.json())
      .then(data => {
        setReportCases(data);
        setIsFetchingCases(false);
      })
      .catch(() => setIsFetchingCases(false));
  }, []);

  React.useEffect(() => {
    apiFetch('/api/adoptions/stats')
      .then(async (res) => res.ok ? res.json() : Promise.reject(new Error('Unable to load adoption statistics')))
      .then(setAdoptionStats)
      .catch(() => undefined);
  }, []);

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header], (key, value) => value === null ? "" : value)).join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDonations = () => {
    const formattedDonations = donations.map(d => {
      const dDate = new Date(d.date || d.createdAt || Date.now());
      return {
        ...d,
        Day: dDate.toLocaleString('default', { weekday: 'long' }),
        Month: dDate.toLocaleString('default', { month: 'long' }),
        Year: dDate.getFullYear()
      };
    });
    generateCSV(formattedDonations, 'pfa_donations_annual_report');
  };

  const handleExportAll = () => {
    generateCSV(medicines, 'pfa_meds_stock');
    generateCSV(staff, 'pfa_staff_volunteer_list');
    generateCSV(abcRecords, 'pfa_abc_detailed_report');
    exportDonations();
    generateCSV(adoptions, 'pfa_adoption_annual_report');
    
    const censusData = reportCases.filter(c => c.status === CaseStatus.RELEASED || c.status === CaseStatus.PERMANENT);
    generateCSV(censusData, 'pfa_census_report');
    
    alert("Exporting all reports. Check your downloads folder.");
  };

  const reportItems = [
    { 
      id: 'meds', 
      title: 'Medicine Stock List', 
      desc: 'List of all medicines we have.',
      icon: Pill, 
      color: 'bg-blue-50 text-blue-600',
      roles: ['Admin', 'Doctor'],
      action: () => generateCSV(medicines, 'pfa_meds_stock')
    },
    { 
      id: 'staff', 
      title: 'Staff List', 
      desc: 'List of all staff and volunteers.',
      icon: Users, 
      color: 'bg-emerald-50 text-emerald-600',
      roles: ['Admin', 'Doctor'],
      action: () => generateCSV(staff, 'pfa_staff_volunteer_list')
    },
    { 
      id: 'abc', 
      title: 'Birth Control Report', 
      desc: 'List of all surgeries done.',
      icon: Scissors, 
      color: 'bg-amber-50 text-amber-600',
      roles: ['Admin', 'Doctor'],
      action: () => generateCSV(abcRecords, 'pfa_abc_detailed_report')
    },
    { 
      id: 'donations', 
      title: 'Donations Report', 
      desc: 'List of all money received.',
      icon: IndianRupee, 
      color: 'bg-indigo-50 text-indigo-600',
      roles: ['Admin'],
      action: exportDonations
    },
    { 
      id: 'adoptions', 
      title: 'Adoption Report', 
      desc: 'List of animals adopted.',
      icon: Heart, 
      color: 'bg-rose-50 text-rose-600',
      roles: ['Admin'],
      action: () => generateCSV(adoptions, 'pfa_adoption_annual_report')
    },
    { 
      id: 'census', 
      title: 'Rescue & Resident Count', 
      desc: 'Released & Permanent resident tracking.',
      icon: Activity, 
      color: 'bg-teal-50 text-teal-600',
      roles: ['Admin', 'Doctor'],
      action: () => navigate('/reports/census')
    }
  ].filter(item => item.roles.includes(user?.role || ''));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reports & Downloads</h1>
          <p className="text-slate-500 font-medium">Download lists and data files.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleExportAll}
             className="bg-[#005F54] text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.15em] shadow-xl shadow-emerald-900/20 hover:bg-[#004a42] transition-all flex items-center gap-3 active:scale-95"
           >
             <Download size={20} />
             Download All
           </button>
        </div>
      </div>

      {/* Audit Repository Section */}
      <section className="space-y-8 no-print">
        <div className="flex items-center justify-between">
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
             <LayoutGrid size={16} /> Available Reports
           </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {reportItems.map((report) => (
             <div 
               key={report.id} 
               onClick={report.action}
               className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer relative overflow-hidden"
             >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg shadow-current/5 ${report.color}`}>
                   <report.icon size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 tracking-tight mb-2 group-hover:text-[#005F54] transition-colors">{report.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{report.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-[#005F54] uppercase tracking-widest pt-4 border-t border-slate-50">
                  <FileDown size={14} />
                  {report.id === 'census' ? 'Open Census Page' : 'Download List'}
                </div>
                
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
           ))}
        </div>
      </section>

      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Heart size={22} /></div><div><h3 className="font-black text-slate-800">Adoption overview</h3><p className="text-xs text-slate-500">Current adoption totals and breakdowns.</p></div></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-rose-50 p-5"><p className="text-xs font-bold text-rose-700">Total adoptions</p><p className="text-3xl font-black text-rose-900 mt-1">{adoptionStats.total}</p></div>
          <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold text-slate-500 mb-2">By animal type</p>{Object.keys(adoptionStats.byAnimalType).length ? Object.entries(adoptionStats.byAnimalType).map(([type, count]) => <p key={type} className="text-sm font-bold text-slate-700">{type}: {count}</p>) : <p className="text-sm text-slate-400">No adoptions recorded.</p>}</div>
          <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold text-slate-500 mb-2">By month</p>{Object.keys(adoptionStats.byMonth).length ? Object.entries(adoptionStats.byMonth).slice(-4).map(([month, count]) => <p key={month} className="text-sm font-bold text-slate-700">{month}: {count}</p>) : <p className="text-sm text-slate-400">No adoptions recorded.</p>}</div>
        </div>
      </section>

      {/* Legacy Registry Table (kept for visual context as per PFA standards) */}
      {user?.role === 'Admin' && (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between print:px-0">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" size={24} />
              Recent Donations
            </h3>
            <p className="text-xs text-slate-400 font-medium no-print">List of recent donations.</p>
          </div>
          <div className="no-print">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all">
               <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest print:bg-white print:border-b-2 print:border-slate-800">
              <tr>
                <th className="px-10 py-5">Donor Name</th>
                <th className="px-10 py-6">Type</th>
                <th className="px-10 py-5">Date</th>
                <th className="px-10 py-5 text-right">Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 print:divide-slate-200">
              {donations.slice(0, 10).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-6">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                          {(row.donorName || 'D').charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800">{row.donorName || 'Anonymous'}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {row.id}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <span className="text-[9px] font-black px-2.5 py-1 bg-white border border-slate-200 text-slate-500 rounded-md uppercase tracking-widest">{row.paymentId || 'Direct'}</span>
                  </td>
                  <td className="px-10 py-6">
                     <span className="text-xs font-bold text-slate-500">{new Date(row.createdAt || Date.now()).toLocaleDateString('en-GB')}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                     <span className="text-sm font-black text-slate-900 tracking-tighter">₹ {row.amount.toLocaleString('en-IN')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          aside { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; width: 100% !important; margin: 0 !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .shadow-sm, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
          .border { border: 1px solid #e2e8f0 !important; }
          .rounded-[2.5rem], .rounded-[3rem], .rounded-3xl { border-radius: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border-bottom: 1px solid #f1f5f9 !important; }
          .bg-slate-50 { background-color: transparent !important; }
          .bg-slate-900 { color: black !important; background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
