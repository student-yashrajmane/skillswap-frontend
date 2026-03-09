import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; 
import { toast } from 'react-toastify';

const QuizDataManagement = () => {
  const navigate = useNavigate();
  const [quizRecords, setQuizRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshSpin, setRefreshSpin] = useState(false);

  const fetchQuizData = useCallback(async () => {
    try {
      setRefreshSpin(true);
      const res = await api.get('/api/admin/all-quizData');
      setQuizRecords(res.data);
    } catch (err) {
      toast.error("Registry Sync Failure: Quiz Data Unreachable");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshSpin(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  const filteredRecords = quizRecords.filter(r => 
    r.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: "---", time: "" };
    const dateObj = new Date(dateTimeStr);
    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-950 flex flex-col p-8 sticky top-0 h-screen shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">Q</div>
          <span className="text-xl font-black text-white tracking-tighter italic uppercase">Arena<span className="text-indigo-500">.OS</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <AdminNavItem label="Overview" onClick={() => navigate('/admin-dashboard')} />
          <AdminNavItem label="Users" onClick={() => navigate('/admin-users')} />
          <AdminNavItem label="Meetings" onClick={() => navigate('/admin-meetings')} />
          <AdminNavItem label="Requests" onClick={() => navigate('/admin-requests')} />
          <AdminNavItem label="Quiz Details" active={true} onClick={() => navigate('/admin-quiz')} />
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        <header className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Performance Metrics</p>
            <h1 className="text-4xl font-black tracking-tight uppercase italic flex items-center gap-4">
              Quiz Registry
              <button onClick={fetchQuizData} className={`${refreshSpin ? 'animate-spin' : ''} p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:text-indigo-600 transition-colors`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </h1>
          </div>

          <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Search participant..." 
                className="pl-6 pr-6 py-3 bg-white rounded-2xl text-xs font-bold border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all w-64 shadow-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </header>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="w-[35%] p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Participant</th>
                <th className="w-[30%] p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Earned Coins & Score</th>
                <th className="w-[35%] p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Activity Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!loading && filteredRecords.map((r, index) => {
                const { date, time } = formatDateTime(r.lastAttempted);

                return (
                  <tr key={index} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                    {/* Participant Column */}
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-slate-200">
                            {r.username?.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 tracking-tight text-base">@{r.username}</span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Player</span>
                        </div>
                      </div>
                    </td>

                    {/* Score Column */}
                    <td className="p-8">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                <span className="text-xs font-black text-amber-600">🪙 {r.earnedCoins?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                <span className="text-xs font-black text-indigo-600">PTS: {r.lastQuizScore}</span>
                            </div>
                        </div>
                        <div className="w-full max-w-[150px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                                style={{ width: `${Math.min(r.lastQuizScore, 100)}%` }}
                            ></div>
                        </div>
                      </div>
                    </td>

                    {/* Timeline Column */}
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{date}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredRecords.length === 0 && !loading && (
            <div className="p-24 text-center">
                <div className="inline-flex p-6 rounded-full bg-slate-50 mb-4">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="font-black text-slate-300 uppercase tracking-widest italic text-sm">
                    No performance data found in registry
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const AdminNavItem = ({ label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
      active 
      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-2" 
      : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
    }`}
  >
    {label}
  </button>
);

export default QuizDataManagement;