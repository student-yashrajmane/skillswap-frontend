import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; 
import { toast } from 'react-toastify';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [isOnline, setIsOnline] = useState(true);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0, 
    activeUsers: 0, 
    blockedUsers: 0
  });

  // --- 1. INITIAL HYDRATION (Fetch Stats & History) ---
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const statsRes = await api.get('/api/admin/overview-data');
        setStats({
          totalUsers: statsRes.data.totalUsers || 0,
          activeUsers: statsRes.data.activeUsers || 0,
          blockedUsers: statsRes.data.blockedUsers || 0
        });

        // Fetch Activity History from DB
        const historyRes = await api.get('/api/admin/activities');
        // IMPORTANT: Sort history so the newest ID/Timestamp is at index 0
        const sortedHistory = historyRes.data.sort((a, b) => b.id - a.id);
        setLogs(sortedHistory);
        
        setIsOnline(true);
      } catch (err) {
        setIsOnline(false);
        toast.error("Handshake with central server failed");
      }
    };

    initDashboard();
    const interval = setInterval(fetchQuickStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. LIVE WEBSOCKET CONNECTION ---
 // --- 2. LIVE WEBSOCKET CONNECTION ---
  useEffect(() => {
    const stompClient = new Client({
      // Keeping your exact port and path
      webSocketFactory: () => new SockJS('https://skillswap-backend-5o3p.onrender.com/ws-activity'),
      reconnectDelay: 5000,
    });

    stompClient.onConnect = (frame) => {
      setIsOnline(true);
      console.log('Pulse Connected');
      
      stompClient.subscribe('/topic/logs', (message) => {
        if (message.body) {
          const newLog = JSON.parse(message.body);
          
          // CRITICAL: Functional update ensures "Live" behavior without refresh
          setLogs((prevLogs) => {
            // Check to avoid duplicates (optional but recommended)
            const isDuplicate = prevLogs.some(log => log.id === newLog.id && log.time === newLog.time);
            if (isDuplicate) return prevLogs;

            const updated = [newLog, ...prevLogs]; // Prepend new message to top
            return updated.slice(0, 50); // Maintain sliding window
          });
        }
      });
    };

    stompClient.onStompError = () => setIsOnline(false);
    stompClient.onWebSocketClose = () => setIsOnline(false);
    stompClient.activate();

    return () => stompClient.deactivate();
  }, []); // Empty dependency array ensures this only runs once

  // --- 3. AUTO-SCROLL TO TOP ---
  // Since newest messages are at the top, we keep scroll at 0
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const fetchQuickStats = async () => {
    try {
      const response = await api.get('/api/admin/overview-data');
      setStats({
        totalUsers: response.data.totalUsers || 0,
        activeUsers: response.data.activeUsers || 0,
        blockedUsers: response.data.blockedUsers || 0
      });
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
    }
  };


  const handleLoggedOut = async () => {
    // 1. Start the loading state
    const toastId = toast.loading("Admin Logging out!"); 
    
 
    const token = localStorage.getItem('token');
  
    try {
      // 2. Call your Spring Boot endpoint
      const response = await api.get(`/api/admin/admin-logout`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // 3. Update the toast to SUCCESS
      toast.update(toastId, { 
        render: response.data || "Logged out successfully!", 
        type: "info", 
        isLoading: false, 
        autoClose: 2000 
      });
  
      // 4. Clear data and wait briefly so they see the toast
      localStorage.clear();
      setTimeout(() => {
        navigate('/signin');
      }, 500);
  
    } catch (err) {
      console.error("Logout Error:", err);
      
      // 5. Update the toast to ERROR if the server fails
      toast.update(toastId, { 
        render: "Server sync failed, but logging out locally.", 
        type: "warning", 
        isLoading: false, 
        autoClose: 2000 
      });
  
      localStorage.clear();
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    }
  };



  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-950 flex flex-col p-8 sticky top-0 h-screen shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">S</div>
          <span className="text-xl font-black text-white tracking-tighter italic uppercase">SkillSwap<span className="text-blue-500">.ADMIN</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <AdminNavItem label="Overview" active={true} onClick={() => navigate('/admin-dashboard')} />
          <AdminNavItem label="Users" onClick={() => navigate('/admin-users')} />
          <AdminNavItem label="Meetings" onClick={() => navigate('/admin-meetings')} />
          <AdminNavItem label="Requests" onClick={() => navigate('/admin-requests')} />
          <AdminNavItem label="Quiz Details" onClick={() => navigate('/admin-quiz')} />
        </nav>

        <button onClick={handleLoggedOut} 
                className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-rose-500 transition-all">
          Terminate Session
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic text-slate-900">Control Center</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">
                {isOnline ? "System synchronized with MySQL database" : "Connection error detected"}
            </p>
          </div>

          <div className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors duration-500 ${!isOnline ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200'}`}>
             <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></div>
             <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-slate-500' : 'text-rose-600'}`}>
                {isOnline ? 'Node Active' : 'Node Offline'}
             </span>
          </div>
        </header>

        <div className="space-y-12 animate-in fade-in duration-500">
          
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">User Population</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Registered" value={stats.totalUsers} color="text-slate-900" />
              <StatCard label="Active" value={stats.activeUsers} color="text-emerald-600" bg="bg-emerald-50/30" />
              <StatCard label="Blocked" value={stats.blockedUsers} color="text-rose-600" bg="bg-rose-50/30" />
            </div>
          </section>

          {/* --- SYSTEM LOGS (Newest First) --- */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative border border-white/5 overflow-hidden">
             <div className="absolute -right-4 -top-4 opacity-5 font-black text-9xl italic select-none">
                {isOnline ? 'LIVE' : 'HALT'}
             </div>
             
             <h2 className={`text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2 ${isOnline ? 'text-blue-400' : 'text-rose-500'}`}>
               <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-400 animate-pulse' : 'bg-rose-500'}`}></span>
               System Pulse Monitoring
             </h2>

             <div 
               ref={scrollRef} 
               className="space-y-3 font-mono text-[11px] h-64 overflow-y-auto scrollbar-hide flex flex-col"
             >
                {isOnline && <p className="animate-pulse text-blue-400 mb-2 font-bold tracking-widest">[LISTENING_FOR_PACKETS]</p>}
                
                {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="animate-in slide-in-from-top-2 fade-in duration-300 border-l border-white/10 pl-4 py-1 hover:bg-white/5 transition-colors">
                        <span className="text-slate-500 mr-2">[{log.time}]</span>
                        <span className={`font-bold mr-2 ${log.type === 'ERROR' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          [{log.type}]
                        </span>
                        <span className="text-slate-200">{log.message}</span>
                      </div>
                    ))
                ) : (
                    <p className="text-slate-600 italic">No activity logs found in database.</p>
                )}

                {!isOnline && (
                    <div className="pt-4 border-t border-white/5 bg-rose-950/20 p-4 rounded-xl">
                        <p className="text-rose-500 font-bold">[CRITICAL] Peer connection lost.</p>
                        <p className="text-rose-400 animate-pulse text-[9px]">Handshake failed at port 4041...</p>
                    </div>
                )}
             </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ label, value, color, bg = "bg-white" }) => (
  <div className={`${bg} p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:translate-y-[-4px] transition-all duration-300`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{label}</p>
    <div className={`text-5xl font-black ${color}`}>{value.toLocaleString()}</div>
  </div>
);

const AdminNavItem = ({ label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
      active 
      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
      : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
    }`}
  >
    {label}
  </button>
);

export default AdminDashboard;