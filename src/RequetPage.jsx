import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { toast } from 'react-toastify';

const RequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (!username || !token) {
      navigate('/signin');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/user/received-request?username=${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to sync requests.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReject = async (requestId) => {
    const token = localStorage.getItem('token');
    const toastId = toast.loading("Processing rejection...");
    try {
      await api.post(`/api/user/update-request-status`, null, {
        params: { requestId, status: 'REJECT' },
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.update(toastId, { render: "Request declined.", type: "info", isLoading: false, autoClose: 2000 });
      fetchRequests();
    } catch (error) {
      toast.update(toastId, { render: "Action failed.", type: "error", isLoading: false, autoClose: 2000 });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-6">
      
      {/* Top Navigation */}
      <div className="w-full max-w-5xl mb-10 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500">
        <button 
          onClick={() => navigate('/user-dashboard')}
          className="text-slate-400 hover:text-sky-500 font-bold flex items-center gap-2 transition-all group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 
          Back to Dashboard
        </button>

        <button 
          onClick={fetchRequests}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-sky-500 hover:text-sky-500 transition-all shadow-sm flex items-center gap-2 text-sm font-bold text-slate-600"
        >
          <span className={isLoading ? "animate-spin" : ""}>🔄</span> Refresh
        </button>
      </div>

      <div className="w-full max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inbox</h1>
            <span className="px-3 py-1 bg-sky-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-sky-200">
              {requests.length} NEW
            </span>
          </div>
          <p className="text-slate-500 font-medium text-lg">
            High-priority invitations from peers who want to learn from you.
          </p>
        </header>

        <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-sky-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Syncing Encrypted Data...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 border border-slate-100 shadow-inner">
                📩
              </div>
              <h4 className="text-2xl font-black text-slate-900">All Clear!</h4>
              <p className="text-slate-400 max-w-xs mt-2 font-medium">
                You've handled all pending requests. New opportunities will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Arrival</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {requests.map((req, idx) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-gradient-to-br from-white to-slate-100 text-slate-900 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-md border border-slate-200 group-hover:scale-110 transition-transform">
                            {req.senderName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-xl tracking-tight leading-none mb-1">
                              {req.senderName || "Knowledge Seeker"}
                            </span>
                            <span className="text-[11px] text-sky-500 font-bold uppercase tracking-widest bg-sky-50 px-2 py-0.5 rounded-md">
                              Connect Request
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-8">
                        <div className="text-slate-600 font-black text-sm uppercase tracking-tighter">
                          {new Date(req.requestDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {new Date(req.requestDate).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => navigate(`/create-meeting/${req.id}`)}
                            className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-zinc-400 shadow-xl shadow-slate-200 transition-all active:scale-95 uppercase tracking-widest"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleReject(req.id)}
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black rounded-2xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95 uppercase tracking-widest"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        
        <p className="text-center mt-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
          SkillSwap Communication Protocol • End-to-End Encrypted
        </p>
      </div>
    </div>
  );
};

export default RequestsPage;