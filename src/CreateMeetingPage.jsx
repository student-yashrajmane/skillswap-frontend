import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api'; 
import { toast } from 'react-toastify';

const CreateMeetingPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [meetingData, setMeetingData] = useState({
    topic: '',
    duration: '',
    dateTime: '',
    meetingLink: ''
  });

  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCurrentDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleGenerateClick = () => {
    if (!meetingData.topic) {
      toast.warn("Please enter a meeting topic first.");
      return;
    }
    toast.info("Opening Google Meet to generate your link...");
    window.open('https://meet.google.com/landing', '_blank');
    setIsGenerated(true);
  };

  const handleFinalProceed = async (e) => {
    e.preventDefault();
    
    if (new Date(meetingData.dateTime) < new Date()) {
      toast.error("The scheduled time cannot be in the past.");
      return;
    }

    const { topic, duration, dateTime, meetingLink } = meetingData;

    if (!topic || !duration || !dateTime || !meetingLink) {
      toast.warning("Please fill in all details before confirming.");
      return;
    }

    setLoading(true); 
    const toastId = toast.loading("Finalizing your meeting schedule...");
    
    const token = localStorage.getItem('token');
    const meetingPayload = {
      requestId: Number(id),
      topicName: topic,
      durationMinutes: Number(duration),
      meetingDateTime: dateTime,
      meetingLink: meetingLink
    };

    try {
      const response = await api.post(`/api/user/set-meeting`, meetingPayload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      if (response.status === 200) {
        toast.update(toastId, { 
          render: "Meeting scheduled! The requester has been notified.", 
          type: "success", 
          isLoading: false, 
          autoClose: 3000 
        });
        navigate('/user-dashboard'); 
      }

    } catch (error) {
      console.error("Detailed Error:", error);
      const serverMsg = error.response?.data;
      toast.update(toastId, { 
        render: typeof serverMsg === 'string' ? serverMsg : "Unable to schedule meeting. Please check your connection.", 
        type: "error", 
        isLoading: false, 
        autoClose: 4000 
      });
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      <div className="w-full max-w-lg mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-sky-500 font-bold flex items-center gap-2 transition-all"
        >
          ← Back to Requests
        </button>
      </div>

      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Schedule Session</h2>
          <p className="text-slate-500 font-medium mt-1">
            Finalize details for request <span className="text-sky-500 font-bold">#{id}</span>
          </p>
        </div>

        <form onSubmit={handleFinalProceed} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Topic Name</label>
            <input 
              required
              type="text" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ring-sky-500 outline-none transition-all"
              placeholder="e.g., Advanced React Hooks"
              value={meetingData.topic}
              onChange={(e) => setMeetingData({...meetingData, topic: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Duration (min)</label>
              <input 
                required
                type="number" 
                placeholder="60"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ring-sky-500 outline-none"
                value={meetingData.duration}
                onChange={(e) => setMeetingData({...meetingData, duration: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Date & Time</label>
              <input 
                required
                type="datetime-local" 
                min={getCurrentDateTimeString()}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ring-sky-500 outline-none"
                value={meetingData.dateTime}
                onChange={(e) => setMeetingData({...meetingData, dateTime: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Meeting Link</label>
            {!isGenerated ? (
              <button
                type="button"
                onClick={handleGenerateClick}
                className="w-full p-4 bg-white border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl font-bold hover:border-sky-400 hover:text-sky-500 transition-all group"
              >
                ✨ Click to Generate Link
              </button>
            ) : (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="url"
                  required
                  placeholder="Paste your Google Meet link here..."
                  value={meetingData.meetingLink}
                  onChange={(e) => setMeetingData({...meetingData, meetingLink: e.target.value})}
                  className="flex-1 p-5 bg-emerald-50 border-2 border-emerald-100 rounded-[1.5rem] font-bold text-sm outline-none text-emerald-700 placeholder:text-emerald-300"
                />
                <button 
                  type="button"
                  title="Reset Link"
                  onClick={() => { setIsGenerated(false); setMeetingData({...meetingData, meetingLink: ''}); }}
                  className="px-4 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
                >
                  🔄
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-2 ml-1 italic font-medium">
              Note: Generate a link in Google Meet, then paste it in the box above.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-100'
            }`}
          >
            {loading ? 'SCHEDULING...' : 'CONFIRM & SCHEDULE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingPage;