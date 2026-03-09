import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; 
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', fullname: '', role: '' });
  const [allProfiles, setAllProfiles] = useState([]); 
  const [showAll, setShowAll] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchKey, setSearchKey] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [stats, setStats] = useState({ coins: 0, incomingRequests: 0 });

  // 1. UPDATED: No filter on initial fetch
  const fetchInitialData = useCallback(async (token, currentUsername) => {
    try {
      setIsLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        api.get(`/api/user/allProfiles?username=${currentUsername}`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/api/user/user-dashboard?username=${currentUsername}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Using raw data from endpoint
      setAllProfiles(Array.isArray(profileRes.data) ? profileRes.data : []);
      setStats({ coins: statsRes.data.coins || 0, incomingRequests: statsRes.data.requests || 0 });
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to sync dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/signin');
    } else {
      setUser({ 
        username: storedUser, 
        fullname: localStorage.getItem('fullname') || storedUser, 
        role: localStorage.getItem('role') 
      });
      fetchInitialData(token, storedUser);
    }
  }, [navigate, fetchInitialData]);

  // 2. UPDATED: No filter on search results
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchKey.trim()) {
      setHasSearched(false);
      fetchInitialData(localStorage.getItem('token'), localStorage.getItem('username'));
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);
      
      const token = localStorage.getItem('token');
      const currentUsername = localStorage.getItem('username');

      const response = await api.get(`/api/user/searched-profile`, {
        params: { 
          keyword: searchKey, 
          username: currentUsername 
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Directly setting all profiles received from endpoint
      setAllProfiles(Array.isArray(response.data) ? response.data : []);
      
      if (Array.isArray(response.data) && response.data.length === 0) {
        toast.info("No matches found in the SkillSwap network.");
      }
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Search failed. Check your connection.");
      setAllProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (receiverUsername) => {
    const token = localStorage.getItem('token');
    const toastId = toast.loading("Transmitting request...");
    try {
      setIsSendingRequest(true);
      const response = await api.get(`/api/user/send-request`, {
        params: { sender: user.username, receiver: receiverUsername },
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.update(toastId, { render: response.data, type: "success", isLoading: false, autoClose: 3000 });
      setSelectedProfile(null);
      fetchInitialData(token, user.username);
    } catch (error) {
      const errorMsg = error.response?.data || "Request failed.";
      toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleLoogedOut = async () => {
    const toastId = toast.loading("Terminating session..."); 
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    try {
      const response = await api.get(`/api/user/user-logout/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.update(toastId, { 
        render: response.data || "Logged out successfully!", 
        type: "info", 
        isLoading: false, 
        autoClose: 1500 
      });

      localStorage.clear();
      setTimeout(() => navigate('/signin'), 1000);
    } catch (err) {
      toast.update(toastId, { render: "Local session cleared.", type: "warning", isLoading: false, autoClose: 1500 });
      localStorage.clear();
      setTimeout(() => navigate('/signin'), 1000);
    }
  };

  const safeProfiles = Array.isArray(allProfiles) ? allProfiles : [];
  const displayedProfiles = (showAll || hasSearched) ? safeProfiles : safeProfiles.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex selection:bg-sky-100">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-100 hidden lg:flex flex-col p-10 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white text-xl font-black shadow-2xl shadow-slate-200">S</div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">SkillSwap</span>
        </div>
        
        <nav className="flex-1 space-y-3">
          <NavItem icon="🏠" label="Dashboard" active onClick={() => {}} />
          <NavItem icon="👤" label="My Profile" onClick={() => navigate('/my-profile')} />
          <NavItem icon="🎯" label="Skill Arena" onClick={() => navigate('/quiz-intro')} />
          <NavItem icon="📅" label="Meetings" onClick={() => navigate('/meetings')} />
          <NavItem icon="🕰️" label="History" onClick={() => navigate('/history')} />
        </nav>

        <button 
          onClick={handleLoogedOut}
          className="group flex items-center gap-3 px-6 py-4 text-slate-400 font-black text-sm hover:text-rose-500 transition-all"
        >
          <span className="group-hover:rotate-12 transition-transform">🚪</span> Logout
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
              Hello, {user.fullname.split(' ')[0]}
            </h1>
            <p className="text-slate-400 font-bold text-lg">Who will you learn from today?</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex items-center gap-3 w-full max-w-lg group">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="Search skills (React, Java, UI...)"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-sky-50 focus:border-sky-500 transition-all font-bold text-slate-700 shadow-sm"
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔎</span>
            </div>
            <button type="submit" className="h-16 px-10 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-zinc-700 transition-all shadow-xl active:scale-95 uppercase text-xs tracking-widest">
              Scan
            </button>
          </form>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="group bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden transition-all hover:-translate-y-2">
              <div className="relative z-10">
                <p className="text-sky-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Capital Balance</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-6xl font-black text-white">{stats.coins}</h2>
                  <span className="text-sky-400 font-black text-sm italic">SSC</span>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 text-white/[0.03] text-[12rem] font-black italic select-none">COINS</div>
          </div>

          <div 
            onClick={() => navigate('/requests')}
            className="group bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl flex items-center justify-between cursor-pointer transition-all hover:-translate-y-2"
          >
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Incoming Intel</p>
              <h2 className="text-6xl font-black text-slate-900">{stats.incomingRequests}</h2>
            </div>
            <div className="w-24 h-24 bg-sky-50 text-sky-500 rounded-[2.5rem] flex items-center justify-center text-4xl group-hover:bg-slate-900 group-hover:text-white transition-all">
              📩
            </div>
          </div>
        </section>

        {/* PROFILES GRID */}
        <section className="bg-white rounded-[4rem] border border-slate-50 shadow-2xl p-10 md:p-14 min-h-[500px]">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {hasSearched ? `Direct Hits: "${searchKey}"` : "Global Practitioners"}
            </h3>
            
            <div className="flex items-center gap-6">
              {!hasSearched && safeProfiles.length > 3 && (
                <button onClick={() => setShowAll(!showAll)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-sky-500 transition-colors">
                  {showAll ? "Minimize" : `Expand Grid (${safeProfiles.length})`}
                </button>
              )}

              {hasSearched && (
                <button 
                  onClick={() => { setHasSearched(false); setSearchKey(''); fetchInitialData(localStorage.getItem('token'), user.username); }}
                  className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-sky-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Filtering Talent...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {displayedProfiles.map((profile, index) => (
                <div 
                  key={index} 
                  className="p-8 bg-slate-50 rounded-[3rem] border border-transparent hover:bg-white hover:border-sky-100 hover:shadow-2xl transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black text-slate-900 shadow-md mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    {profile.fullName?.substring(0, 1)}
                  </div>
                  <h4 className="font-black text-xl text-slate-900 truncate mb-1">{profile.fullName}</h4>
                  <p className="text-[10px] text-sky-500 mb-8 font-black uppercase tracking-[0.2em]">{profile.professionalTitle || "Generalist"}</p>
                  
                  <button 
                    onClick={() => setSelectedProfile(profile)} 
                    className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all"
                  >
                    Inspect Profile
                  </button>
                </div>
              ))}
              
              {safeProfiles.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-20 italic">
                  <span className="text-8xl mb-6">🛰️</span>
                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-widest">No User Found</h4>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl p-12 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all font-bold">✕</button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black mb-6 shadow-2xl">
                {selectedProfile.fullName?.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{selectedProfile.fullName}</h2>
              <div className="px-6 py-2 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10">
                {selectedProfile.professionalTitle}
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] w-full mb-8 text-left border border-slate-100">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Professional Dossier</p>
                <p className="text-slate-700 font-bold leading-relaxed">{selectedProfile.bio || "No description provided."}</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mb-12">
                {selectedProfile.skills?.split(",").map((s, i) => (
                  <span key={i} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {s.trim()}
                  </span>
                ))}
              </div>

              <button 
                disabled={isSendingRequest}
                onClick={() => handleSendRequest(selectedProfile.username)}
                className={`w-full py-6 text-white rounded-[2rem] font-black text-lg shadow-2xl transition-all uppercase tracking-widest active:scale-95 ${
                  isSendingRequest ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-zinc-700'
                }`}
              >
                {isSendingRequest ? "Transmitting..." : "Initiate Connection"}
              </button>
              <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Costs 1 Skill Coin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] font-black text-sm transition-all ${
      active 
        ? "bg-slate-900 text-white shadow-xl" 
        : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
    }`}
  >
    <span className="text-xl">{icon}</span> {label}
  </button>
);

export default UserDashboard;