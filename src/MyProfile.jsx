import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    fullname: '',
    username: localStorage.getItem("username") || '',
    title: '',
    bio: '',
    skills: [],
    coins: 0
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        toast.error("Session expired. Please sign in.");
        navigate('/signin');
        return;
      }

      try {
        const response = await fetch(`https://skillswap-backend-5o3p.onrender.com/api/user/myprofile?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          setUser({
            fullname: profileData.fullName || 'User Name',
            username: username,
            title: profileData.professionalTitle || 'Knowledge Seeker',
            bio: profileData.bio || 'This user hasn’t written a bio yet.',
            skills: (typeof profileData.skills === 'string') 
                      ? profileData.skills.split(',').map(s => s.trim()) 
                      : [],
            coins: profileData.coins || 0
          });
        } else {
          toast.error("Failed to load profile data.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Connection error. Is the server running?");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

 

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-zinc-700 mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 flex flex-col items-center">
      
      {/* Top Navigation Bar */}
      <div className="w-full max-w-3xl mb-10 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500">
        <button 
          onClick={() => navigate('/user-dashboard')}
          className="text-slate-400 hover:text-zinc-800 font-bold flex items-center gap-2 transition-all group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/edit-profile')} 
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:border-zinc-800 hover:text-zinc-500 transition-all shadow-sm text-sm"
          >
            Edit Profile
          </button>
        
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Profile Header Background */}
        <div className="h-44 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 w-full relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        <div className="px-8 md:px-12 pb-12">
          {/* Avatar Area */}
          <div className="flex justify-between items-end -translate-y-16">
            <div className="w-36 h-36 bg-white rounded-[2.8rem] p-2 shadow-2xl shadow-sky-200/50">
              <div className="w-full h-full bg-slate-50 rounded-[2.3rem] flex items-center justify-center text-5xl shadow-inner border border-slate-100">
                👤
              </div>
            </div>
          </div>

          {/* User Identity */}
          <div className="-mt-10">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.fullname}</h1>
              <span className="px-3 py-1 bg-sky-50 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-zinc-100">
                Verified Member
              </span>
            </div>
            <p className="text-sky-500 font-bold text-xl mt-1 tracking-tight">{user.title}</p>
            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">@{user.username}</p>
          </div>

          <hr className="my-10 border-slate-100" />

          {/* About Section */}
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Professional Bio</h3>
            <p className="text-slate-600 leading-relaxed font-medium text-lg italic">
              "{user.bio}"
            </p>
          </div>

          {/* Skills Section */}
          <div className="mb-12">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Expertise</h3>
            <div className="flex flex-wrap gap-3">
              {user.skills.length > 0 ? user.skills.map((skill, index) => (
                <span key={index} className="px-5 py-2.5 bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 transition-all cursor-default uppercase tracking-wider">
                  {skill}
                </span>
              )) : (
                <p className="text-slate-400 font-bold italic">No skills highlighted yet.</p>
              )}
            </div>
          </div>

          {/* Coin/Wallet Card */}
          <div className="relative group overflow-hidden">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 flex items-center justify-between shadow-2xl shadow-slate-400 transition-transform duration-500 group-hover:scale-[1.01]">
              <div className="relative z-10">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Available Credits</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-black text-white tracking-tighter">{user.coins}</h2>
                  <span className="text-sky-400 font-black text-sm uppercase tracking-widest">Coins</span>
                </div>
              </div>
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/10 group-hover:rotate-12 transition-transform duration-500 relative z-10">
                🪙
              </div>
              
              {/* Decorative Card background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default MyProfile;