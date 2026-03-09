import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { toast } from "react-toastify";

const QuizIntro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const startQuiz = async () => {
    setLoading(true);
    setBackendError(null);
    const toastId = toast.loading("Generating your skill set Quiz...");

    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      const res = await api.post(
        `/api/quiz/generate?username=${username}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.update(toastId, { 
        render: "Arena Ready! Good luck.", 
        type: "success", 
        isLoading: false, 
        autoClose: 2000 
      });

      // Navigate to quiz with data
      setTimeout(() => {
        navigate("/quiz/start", { state: { quiz: res.data } });
      }, 1000);

    } catch (error) {
      if (error.response && error.response.status === 403) {
        setBackendError(error.response.data);
        toast.update(toastId, { 
          render: "Access Denied", 
          type: "error", 
          isLoading: false, 
          autoClose: 3000 
        });
      } else {
        toast.update(toastId, { 
          render: "System error. Please try again.", 
          type: "error", 
          isLoading: false, 
          autoClose: 3000 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center selection:bg-sky-100">
      <div className="max-w-3xl w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Navigation */}
        <button
          onClick={() => navigate("/user-dashboard")}
          className="text-slate-400 hover:text-zinc-800 font-bold mb-8 transition-all flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
        </button>

        <div className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-2xl shadow-slate-200 border border-slate-100 text-center relative overflow-hidden">
          
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-50"></div>

          {backendError ? (
            /* --- LOCKED STATE --- */
            <div className="animate-in fade-in zoom-in duration-500 relative z-10">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner border border-rose-100">
                ⏳
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Arena <span className="text-rose-500">Locked</span>
              </h1>
              <div className="bg-rose-50/50 border border-rose-100 p-8 rounded-[2.5rem] mb-10">
                <p className="text-rose-600 text-lg font-black leading-relaxed">
                  {backendError}
                </p>
              </div>
              <button 
                onClick={() => navigate("/user-dashboard")}
                className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Return to Base
              </button>
            </div>
          ) : (
            /* --- AVAILABLE STATE --- */
            <div className="animate-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="inline-block px-4 py-1.5 bg-sky-50 text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
                Knowledge Assessment
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">
                Skill Quiz <span className="text-sky-500 italic">Arena</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto">
                Validate your expertise to earn <span className="text-slate-900 font-bold">Skill Credits</span> and unlock premium mentors.
              </p>

              <div className="text-left mb-12 bg-slate-50/80 backdrop-blur-sm p-10 rounded-[3rem] border border-slate-100">
                <h3 className="text-xs font-black mb-8 text-slate-400 uppercase tracking-[0.3em]">Arena Protocol</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold text-slate-700">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">📝</div>
                    <div>
                      <p className="text-slate-900">10 Questions</p>
                      <p className="text-[10px] text-slate-400 uppercase">Multiple Choice</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">💰</div>
                    <div>
                      <p className="text-slate-900">1 Coin / Correct</p>
                      <p className="text-[10px] text-slate-400 uppercase">Instant Reward</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">⏱️</div>
                    <div>
                      <p className="text-slate-900">10 Minute Limit</p>
                      <p className="text-[10px] text-slate-400 uppercase">Auto-Submit enabled</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">🚫</div>
                    <div>
                      <p className="text-slate-900">Single Attempt</p>
                      <p className="text-[10px] text-slate-400 uppercase">Resets every 24h</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={startQuiz}
                disabled={loading}
                className="w-full py-6 bg-zinc-800 text-white font-black rounded-[2rem] hover:bg-zinc-400 transition-all shadow-2xl shadow-zinc-200 active:scale-[0.98] flex items-center justify-center text-xl tracking-tight group"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin h-6 w-6 border-4 border-white/30 border-t-white rounded-full"></div>
                    <span>Initializing Arena...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-3">
                    🚀 Start Challenge
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Secure Assessment Environment v3.0
        </p>
      </div>
    </div>
  );
};

export default QuizIntro;