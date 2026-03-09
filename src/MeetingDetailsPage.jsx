import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { toast } from 'react-toastify';

const MeetingListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learning'); // 'learning' or 'teaching'
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());


  const expiredSyncedIds = useRef(new Set());

  useEffect(() => {
    const fetchMeetings = async () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      try {
        setLoading(true);
        const endpoint = activeTab === 'learning' 
          ? `/api/user/meeting-learner-list?username=${username}`
          : `/api/user/meeting-teacher-list?username=${username}`;

        const response = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMeetings(response.data);
      } catch (err) {
        setError(`Failed to load your ${activeTab} sessions.`);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // NEW: Handle Join Logic
  const handleJoinClick = async (meeting) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    try {
      // 1. Notify Spring Boot via Request Params
     const response =  await api.post(`/api/user/join-meeting`, null, {
        params: { 
          meetingId: meeting.id,
          username: username 
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.info(response.data)

      // 2. Open the link in a new tab after successful API call
      window.open(meeting.meetingLink, '_blank');
      
    } catch (err) {
      console.error("Error joining meeting:", err);
      toast.error("System could not verify your join status. Please try again.");
    }
  };

  const markAsExpiredInBackend = async (id) => {
    if (expiredSyncedIds.current.has(id)) return;
    try {
      const token = localStorage.getItem('token');
      const msg = await api.post(`/api/user/update-meeting-status`, null, {
        params: { id: id },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (msg.status === 200) {
        expiredSyncedIds.current.add(id);
      }
    } catch (err) {
      console.error("Failed to sync expiration:", err);
    }
  };

  const getMeetingStatus = (m) => {
    const start = new Date(m.meetingDatetime);
    const end = new Date(start.getTime() + m.duration * 60000);
    if (currentTime > end) {
      markAsExpiredInBackend(m.id);
      return 'EXPIRED';
    }
    if(currentTime >= start && currentTime <= end) return 'ACTIVE';
    return 'UPCOMING';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      
      <div className="max-w-5xl mx-auto">
         <div className="w-full max-w-3xl mb-8">
        <button 
          onClick={() => navigate('/user-dashboard')}
          className="text-slate-500 hover:text-zinc-800 font-bold flex items-center gap-2 transition-all"
        >
          ← Back to Dashboard
        </button>
      </div>
        
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-amber-200">
              Portal
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Sessions</h1>
          <p className="text-slate-500 font-medium mt-1 tracking-tight">
            Current Time: <span className="text-slate-900 font-bold">{currentTime.toLocaleTimeString()}</span>
          </p>
        </header>

        <div className="flex bg-white p-2 rounded-[2rem] border-2 border-slate-100 mb-10 w-fit">
          <button 
            onClick={() => setActiveTab('learning')}
            className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all ${
              activeTab === 'learning' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            📚 AS LEARNER
          </button>
          <button 
            onClick={() => setActiveTab('teaching')}
            className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all ${
              activeTab === 'teaching' ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            👨‍🏫 AS TEACHER
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {meetings.length > 0 ? (
            meetings.map((m, index) => {
              const status = getMeetingStatus(m);
              return (
                <div key={m.id || index} className={`bg-white rounded-[2.5rem] p-8 border-2 flex flex-col md:flex-row items-center gap-8 transition-all duration-300 ${
                  status === 'ACTIVE' ? 'border-emerald-400 shadow-xl scale-[1.02]' : 'border-slate-100'
                }`}>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`${activeTab === 'learning' ? 'bg-amber-500' : 'bg-sky-500'} text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm`}>
                        {activeTab === 'learning' ? '🎓 Learning' : '📢 Teaching'}
                      </span>
                      {status === 'ACTIVE' && (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-3 leading-tight tracking-tight">
                      {m.topicName}
                    </h3>
                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-slate-500 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{activeTab === 'learning' ? '👨‍🏫' : '👤'}</span>
                        <span className="text-slate-400 text-xs font-black uppercase">
                          {activeTab === 'learning' ? 'Teacher:' : 'Student:'}
                        </span>
                        <span className="text-slate-700">{activeTab === 'learning' ? m.senderName : m.receiverName || 'Student'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⏳</span>
                        <span className="text-slate-700">{m.duration} Minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0">
                    <div className="text-left md:text-right min-w-[140px]">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Scheduled For</p>
                      <p className="text-slate-900 font-black text-lg whitespace-nowrap leading-tight">
                        {new Date(m.meetingDatetime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        <br />
                        <span className={status === 'ACTIVE' ? "text-emerald-600" : "text-amber-600"}>
                           {new Date(m.meetingDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>

                    {status === 'ACTIVE' ? (
                      <button 
                        onClick={() => handleJoinClick(m)}
                        className="flex-1 md:flex-none text-center px-12 py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:-translate-y-1 transition-all animate-pulse"
                      > 
                        JOIN 
                      </button>
                    ) : status === 'EXPIRED' ? (
                      <div className="flex-1 md:flex-none px-10 py-5 bg-red-50 text-red-400 font-black rounded-2xl border border-red-100 text-center cursor-not-allowed text-xs tracking-widest uppercase">
                        Expired
                      </div>
                    ) : (
                      <div className="flex-1 md:flex-none px-10 py-5 bg-slate-50 text-slate-300 font-black rounded-2xl border border-slate-200 text-center cursor-not-allowed text-xs tracking-widest uppercase">
                        Not Started
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="text-5xl mb-4 grayscale">📚</div>
              <p className="text-slate-400 font-bold text-lg tracking-tight">
                Your {activeTab} list is currently empty.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingListPage;