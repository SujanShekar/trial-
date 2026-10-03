import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  AlertTriangle, 
  PlusCircle,
  IndianRupee,
  ChevronRight,
  Pill,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { CaseStatus, User } from '../types';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../lib/api';

interface DashboardProps {
  user: User;
}

const MainActionTile = ({ title, value, icon: Icon, color, onClick, subtext, alert, isAction }: any) => (
  <button 
    onClick={onClick}
    className={`relative w-full text-left p-8 rounded-[2.5rem] border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden h-full min-h-[240px] flex flex-col justify-between ${alert ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100 shadow-sm'}`}
  >
    <div className={`absolute -right-6 -top-6 p-8 opacity-[0.07] group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12 ${alert ? 'text-rose-600' : 'text-slate-800'}`}>
       <Icon size={180} />
    </div>
    
    <div className="relative z-10">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 ${color}`}>
        <Icon size={32} />
      </div>
      
      <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${alert ? 'text-rose-400' : 'text-slate-400'}`}>{title}</p>
      <h3 className={`text-3xl lg:text-4xl font-black tracking-tight leading-tight ${alert ? 'text-rose-700' : 'text-slate-900'}`}>
        {value}
      </h3>
    </div>

    <div className="relative z-10 pt-6 mt-auto">
       <div className={`flex items-center justify-between border-t pt-4 ${alert ? 'border-rose-200' : 'border-slate-100'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${alert ? 'text-rose-500' : 'text-slate-500'}`}>{subtext}</p>
          <div className={`p-2 rounded-full ${alert ? 'bg-rose-200 text-rose-700' : 'bg-slate-100 text-slate-400'} group-hover:bg-[#005F54] group-hover:text-white transition-colors`}>
            <ChevronRight size={16} />
          </div>
       </div>
    </div>
  </button>
);

const DashboardPage: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { medicines, isLoading } = useAppContext();
  const [stats, setStats] = React.useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(true);
  const isAdmin = user.role === 'Admin';

  const lowStockCount = useMemo(() => medicines.filter(m => m.quantity <= m.minStockLevel).length, [medicines]);
  
  React.useEffect(() => {
    apiFetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsStatsLoading(false);
      })
      .catch(err => {
        console.error('Stats fetch failed', err);
        setIsStatsLoading(false);
      });
  }, []);

  const recentActivities = useMemo(() => {
    if (!stats || !stats.recentActivities || !Array.isArray(stats.recentActivities)) return [];
    return stats.recentActivities.map((c: any) => {
      const animalType = c.title?.split(' ')[0] || 'Animal';
      return {
        id: c.id,
        animal: animalType,
        action: c.description ? c.description.substring(0, 30) + (c.description.length > 30 ? '...' : '') : '',
        time: 'Recently',
        status: c.status
      };
    });
  }, [stats]);


  if (isLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005F54]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Shelter Home
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Overview of what is happening today.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-black text-slate-800 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <Calendar size={20} className="text-[#005F54]" />
          <span className="uppercase tracking-widest text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Main 4 Tiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Tile 1: Create New Case */}
            {(user.role === 'Admin' || user.role === 'Doctor' || user.role === 'Data Entry') && (
            <MainActionTile 
              title="Rescues" 
              value="Add New Animal" 
              icon={PlusCircle} 
              color="bg-[#005F54]" 
              onClick={() => navigate('/cases/new')}
              subtext="Register intake"
              isAction={true}
            />
            )}

            {/* Tile 2: Donations */}
            {user.role === 'Admin' && (
            <MainActionTile 
              title="Donations" 
              value={`₹ ${(stats?.totalDonations || 0).toLocaleString('en-IN')}`} 
              icon={IndianRupee} 
              color="bg-indigo-600" 
              onClick={() => navigate('/donations')}
              subtext="Total Money Collected"
            />
            )}

            {/* Tile 3: Stock Level */}
            {(user.role === 'Admin' || user.role === 'Doctor' || user.role === 'Data Entry') && (
            <MainActionTile 
              title="Stock Level" 
              value={`${lowStockCount} Items Low`} 
              icon={lowStockCount > 0 ? AlertTriangle : CheckCircle} 
              color={lowStockCount > 0 ? "bg-rose-600" : "bg-emerald-600"} 
              onClick={() => navigate('/inventory', { state: { filter: 'LowStock' } })}
              subtext={lowStockCount > 0 ? "Need to order more" : "Stock is good"}
              alert={lowStockCount > 0}
            />
            )}

            {/* Tile 4: Reports (Replaces Medicines check stock) */}
            {(user.role === 'Admin' || user.role === 'Doctor') && (
            <MainActionTile 
              title="Reports" 
              value="View Analytics" 
              icon={BarChart3} 
              color="bg-blue-600" 
              onClick={() => navigate('/analytics')}
              subtext="Download & Data View"
              isAction={true}
            />
            )}
          </div>
        </div>

        <div className="space-y-10">
          {/* Recent Activity Feed */}
          {(user.role === 'Admin' || user.role === 'Doctor') && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Recent Updates</h3>
              <button onClick={() => navigate('/cases')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ChevronRight size={22} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-6 flex-1">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-5 group cursor-pointer hover:bg-slate-50/50 p-2 rounded-2xl transition-colors">
                  <div className={`mt-0.5 w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm transition-all group-hover:scale-110 ${
                    activity.status === CaseStatus.CRITICAL ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                    activity.status === CaseStatus.UNDER_TREATMENT ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-[#005F54] border border-emerald-100'
                  }`}>
                    {activity.animal.charAt(0)}
                  </div>
                  <div className="flex-1 pb-4 border-b border-slate-50 group-last:border-none">
                    <p className="text-sm font-black text-slate-800 leading-tight mb-1">{activity.animal} • {activity.action}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/cases')}
              className="w-full mt-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm"
            >
              See All Cases
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
