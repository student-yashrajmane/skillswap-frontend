import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; 
import { toast } from 'react-toastify';

const RequestsManagement = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshSpin, setRefreshSpin] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setRefreshSpin(true);
      // Fetching from your requests endpoint
      const res = await api.get('/api/admin/all-requests');
      setRequests(res.data);
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
      toast.error("Sync Error: Request Registry Unreachable");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshSpin(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000); 
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const filteredRequests = requests.filter(r => 
    r.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.receiverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics based on your specific status fields
  const totalRequests = requests.length;
  const completedCount = requests.filter(r => r.status?.toUpperCase() === 'COMPLETED').length;
  const pendingCount = requests.filter(r => r.status?.toUpperCase() === 'PENDING').length;
  const activecount = requests.filter(r => r.status?.toUpperCase() === 'ACCEPT').length;
    const cancelledCount = requests.filter(r => r.status?.toUpperCase() === 'CANCELLED').length;
      const expiredCount = requests.filter(r => r.status?.toUpperCase() === 'EXPIRED').length;
       const rejectedCount = requests.filter(r => r.status?.toUpperCase() === 'REJECT').length;

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: 'N/A', time: 'N/A' };
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
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">S</div>
          <span className="text-xl font-black text-white tracking-tighter italic uppercase">Arena<span className="text-blue-500">.OS</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <AdminNavItem label="Overview" onClick={() => navigate('/admin-dashboard')} />
          <AdminNavItem label="Users" onClick={() => navigate('/admin-users')} />
          <AdminNavItem label="Meetings" onClick={() => navigate('/admin-meetings')} />
          <AdminNavItem label="Requests" active={true} onClick={() => navigate('/admin-requests')} />
          <AdminNavItem label="Quiz Details" onClick={() => navigate('/admin-quiz')} />
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        <header className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Network Traffic</p>
            <h1 className="text-4xl font-black tracking-tight uppercase italic flex items-center gap-4">
              Requests
              <button onClick={fetchRequests} className={`${refreshSpin ? 'animate-spin' : ''} p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:text-blue-600 transition-colors`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </h1>
          </div>

          <div className={`px-6 py-3 rounded-2xl border bg-white flex items-center gap-3 transition-all duration-500 ${!isOnline ? 'border-rose-200 shadow-rose-100 shadow-lg' : 'border-slate-200 shadow-sm'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-slate-500' : 'text-rose-600'}`}>
                {isOnline ? 'System Online' : 'Core Offline'}
            </span>
          </div>
        </header>

        {/* --- STATS BAR --- */}
        <div className="grid grid-cols-7 gap-6 mb-10">
            <QuickStat label="Total Requests" value={totalRequests} color="text-slate-900" />
            <QuickStat label="Completed" value={completedCount} color="text-emerald-600" />
            <QuickStat label="Pending" value={pendingCount} color="text-amber-600" />
            <QuickStat label="Active" value={activecount} color="text-sky-600" />
             <QuickStat label="Cancelled" value={cancelledCount} color="text-red-600" />
              <QuickStat label="Expired" value={expiredCount} color="text-rose-600" />
                <QuickStat label="Rejected" value={rejectedCount} color="text-zinc-600" />
        </div>

        {/* --- SEARCH --- */}
        <div className="flex justify-between items-center mb-6 px-4">
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="Search by sender or receiver..." 
                    className="pl-12 pr-6 py-4 bg-white rounded-2xl text-xs font-bold border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all w-96 shadow-sm"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="w-4 h-4 absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredRequests.length} Transactions</p>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Request Path (From ➔ To)</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Request Date</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!loading && filteredRequests.map((r, index) => {
                const { date, time } = formatDateTime(r.requestDate);

                return (
                  <tr key={index} className="hover:bg-blue-50/40 transition-all duration-300 group">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase mb-1">Sender</span>
                          <span className="font-bold text-slate-900 tracking-tight italic">@{r.senderName}</span>
                        </div>
                        
                        <div className="flex items-center px-2">
                           <div className="h-[2px] w-8 bg-slate-200 rounded-full relative">
                              <div className="absolute -right-1 -top-1 border-t-2 border-r-2 border-slate-200 w-2 h-2 rotate-45"></div>
                           </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-blue-600 uppercase mb-1">Receiver</span>
                          <span className="font-bold text-slate-900 tracking-tight italic">@{r.receiverName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">{date}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</span>
                      </div>
                    </td>

                    <td className="p-8 text-right">
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border font-black text-[9px] uppercase tracking-[0.15em] shadow-sm transition-all ${getStatusStyles(r.status)}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${r.status?.toUpperCase() === 'ACCEPTED' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                            {r.status || 'UNKNOWN'}
                        </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" className="p-20 text-center font-black text-slate-300 uppercase tracking-widest italic text-sm">
                    No Request Logs Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

const QuickStat = ({ label, value, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
);

const getStatusStyles = (status) => {
    const s = status?.toUpperCase();
    switch(s) {
        case 'ACCEPTED': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
        case 'PENDING': return 'bg-amber-50 border-amber-100 text-amber-600';
        case 'CANCELLED': return 'bg-rose-50 border-rose-100 text-rose-600';
        case 'COMPLETED': return 'bg-blue-50 border-blue-100 text-blue-600';
        default: return 'bg-slate-50 border-slate-100 text-slate-600';
    }
}

const AdminNavItem = ({ label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
      active 
      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 translate-x-2" 
      : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
    }`}
  >
    {label}
  </button>
);

export default RequestsManagement;