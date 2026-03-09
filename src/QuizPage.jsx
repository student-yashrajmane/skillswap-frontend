import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./api";
import { toast } from "react-toastify";

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const quizData = location.state?.quiz || [];
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate completion percentage
  const answeredCount = Object.keys(userAnswers).length;
  const progress = (answeredCount / quizData.length) * 100;

  const submitQuiz = useCallback(async (isAutoSubmit = false) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const toastId = toast.loading(isAutoSubmit ? "Time's up! Auto-submitting..." : "Calculating your score...");

    try {
      const res = await api.post(
        "/api/quiz/submit",
        userAnswers,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        }
      );

      toast.update(toastId, { 
        render: `Quiz Completed! Score: ${res.data.score} Coins earned.`, 
        type: "success", 
        isLoading: false, 
        autoClose: 5000 
      });

      navigate("/user-dashboard");
    } catch (error) {
      toast.update(toastId, { 
        render: "Submission failed. Saving progress...", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      });
      navigate("/user-dashboard");
    } finally {
      setIsSubmitting(false);
    }
  }, [userAnswers, token, navigate, isSubmitting]);

 // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (quizData.length === 0) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          submitQuiz(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [quizData, submitQuiz]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOptionSelect = (index, selectedOption) => {
    setUserAnswers(prev => ({
      ...prev,
      [`${index}`]: selectedOption
    }));
  };

  if (!quizData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-xl mb-6">⚠️</div>
        <p className="text-xl font-black text-slate-800 mb-4">Arena Session Not Found</p>
        <button onClick={() => navigate("/user-dashboard")} className="px-8 py-3 bg-sky-500 text-white font-bold rounded-2xl shadow-lg">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-sky-100">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span className="bg-slate-900 text-white p-1.5 rounded-lg text-sm">IQ</span> 
                Skill Arena
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment in Progress</p>
            </div>

            <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-mono font-black text-xl transition-all shadow-inner border ${
              timeLeft < 60 
                ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" 
                : "bg-slate-50 text-slate-700 border-slate-100"
            }`}>
              <span className="text-sm opacity-50">⏳</span>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-sky-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Progress</p>
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-tighter">{answeredCount} of {quizData.length} Answered</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-8">
        {quizData.map((q, index) => (
          <div key={index} className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-10 border border-white hover:border-sky-100 transition-all duration-300">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                {index + 1}
              </span>
              <h3 className="font-black text-xl text-slate-800 leading-tight pt-1">
                {q.question}
              </h3>
            </div>

            <div className="grid gap-4">
              {q.options.map((option, i) => {
                const isChecked = userAnswers[`${index}`] === option;
                return (
                  <label
                    key={i}
                    className={`group flex items-center justify-between p-6 border-2 rounded-[2rem] cursor-pointer transition-all duration-300 ${
                      isChecked 
                        ? "border-sky-500 bg-sky-50 shadow-md translate-x-2" 
                        : "border-slate-50 bg-slate-50/50 hover:border-sky-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isChecked ? "border-sky-500 bg-sky-500" : "border-slate-300 group-hover:border-sky-400"
                      }`}>
                        {isChecked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`text-lg font-bold ${isChecked ? "text-sky-900" : "text-slate-600"}`}>
                        {option}
                      </span>
                    </div>
                    
                    <input
                      type="radio"
                      className="hidden"
                      name={`question-${index}`}
                      value={option}
                      checked={isChecked}
                      onChange={() => handleOptionSelect(index, option)}
                    />
                  </label>
                );
              })} 
            </div>
          </div>
        ))}

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-6 mt-16 p-12 bg-slate-900 rounded-[4rem] text-center shadow-2xl shadow-slate-300">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Finished your assessment?</h2>
            <p className="text-slate-400 font-medium italic">Make sure to review your answers before submitting.</p>
          </div>
          
          <button
            onClick={() => submitQuiz(false)}
            disabled={isSubmitting}
            className="group relative px-24 py-6 bg-zinc-800 text-white font-black text-2xl rounded-[2rem] hover:bg-zinc-400 shadow-xl shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Finish Challenge"}
         
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;