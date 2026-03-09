import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { toast } from 'react-toastify';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        toast.error("Session expired. Please log in again.");
        navigate('/signin');
        return;
      }

      try {
        setLoading(true);
        // Fetching all past meetings
        const response = await api.get(`/api/user/meeting-history?username=${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setHistory(response.data);
        
        
      } catch (err) {
        console.error("History Fetch Error:", err);
        toast.error("We couldn't retrieve your swap history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-sky-500 border-slate-200 mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Loading your archive...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Navigation */}
        <div className="w-full mb-8">
          <button 
            onClick={() => navigate('/user-dashboard')}
            className="text-slate-400 hover:text-zinc-800 font-bold flex items-center gap-2 transition-all group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </button>
        </div>
        
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-lg shadow-slate-200">
              Archive
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Swap History</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Review your journey of teaching and learning.
          </p>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-sky-100/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Topic & Duration</th>
                  <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Participants</th>
                  <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Date & Time</th>
                  <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="p-8">
                        <p className="font-black text-slate-900 text-xl leading-tight group-hover:text-sky-500 transition-colors">{item.topicName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                            ⏱ {item.duration} Min
                          </span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Teacher</p>
                              <p className="text-sm font-bold text-slate-700">{item.receiverName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Learner</p>
                              <p className="text-sm font-bold text-slate-700">{item.senderName}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <p className="font-black text-slate-700 text-base">
                          {new Date(item.meetingTimeAndDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-slate-400 font-bold text-sm">
                          {new Date(item.meetingTimeAndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="p-8">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border shadow-sm ${
                          item.status === 'COMPLETED' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-red-50 text-red-400 border-red-100'
                        }`}>
                          {item.status === 'COMPLETED' ? '● ' : '○ '} {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl opacity-50">📂</div>
                        <div>
                          <p className="text-slate-900 font-black text-xl">Your archive is empty.</p>
                          <p className="text-slate-400 font-medium">Start swapping skills to build your history!</p>
                        </div>
                        <button 
                          onClick={() => navigate('/user-dashboard')}
                          className="mt-4 px-8 py-3 bg-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-400 transition-all shadow-lg shadow-sky-100"
                        >
                          Find a Mentor
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="text-center mt-12 text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
          End of Records
        </p>
      </div>
    </div>
  );
};

export default HistoryPage;