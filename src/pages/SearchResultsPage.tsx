
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { 
  Search, 
  BriefcaseMedical, 
  Bird, 
  PawPrint, 
  ChevronRight, 
  Clock, 
  MapPin, 
  AlertCircle,
  Undo2,
  FileSearch,
  Loader2
} from 'lucide-react';
import { Case, WildlifeCase, Animal } from '../types';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<{ cases: Case[], wildlife: WildlifeCase[], animals: Animal[] }>({
    cases: [],
    wildlife: [],
    animals: []
  });
  const [isSearching, setIsSearching] = useState(false);
  
  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      
      setIsSearching(true);
      try {
        const response = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search fetch failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalResults = results.cases.length + results.wildlife.length + results.animals.length;

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
          <Loader2 className="text-[#005F54] animate-spin" size={32} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Searching sanctuary records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <Search className="text-[#005F54]" size={32} />
            Search Results
          </h1>
          <p className="text-slate-500 font-medium">
            Found {totalResults} matches for "{query}"
          </p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
        >
          <Undo2 size={16} /> Back
        </button>
      </div>

      {totalResults === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-6 border border-slate-100 shadow-sm">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
             <FileSearch size={48} />
           </div>
           <div>
             <h3 className="text-xl font-black text-slate-800">No results found</h3>
             <p className="text-slate-400 font-medium mt-2 max-w-sm mx-auto">
               We couldn't find any records matching your search. Try checking for typos or using broader terms.
             </p>
           </div>
           <Link to="/" className="px-8 py-4 bg-[#005F54] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 active:scale-95">
             Return Home
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {/* Rescue Cases */}
          {results.cases.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <BriefcaseMedical size={14} /> Local Rescues ({results.cases.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.cases.map(c => (
                  <Link 
                    key={c.id} 
                    to="/cases" 
                    state={{ openCaseId: c.id }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:ring-2 hover:ring-[#005F54]/10 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#005F54] font-black border border-emerald-100 group-hover:bg-[#005F54] group-hover:text-white transition-all">
                        {c.title.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight">#{c.caseNumber} • {c.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {c.location || 'General'}
                          </span>
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded">
                            {c.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Wildlife Cases */}
          {results.wildlife.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Bird size={14} /> Wildlife Registry ({results.wildlife.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.wildlife.map(w => (
                  <Link 
                    key={w.id} 
                    to="/wildlife"
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:ring-2 hover:ring-blue-100 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        W
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight">#{w.caseNumber} • {w.animal}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                             <Clock size={10} /> {w.dateTime}
                          </span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{w.complainantName}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Animals */}
          {results.animals.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <PawPrint size={14} /> Animal Profiles ({results.animals.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.animals.map(a => (
                  <div 
                    key={a.id} 
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 font-black border border-amber-100">
                        {a.species.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight">{a.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded">
                             ID: #{a.id.slice(0,6)}
                           </span>
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{a.species}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
