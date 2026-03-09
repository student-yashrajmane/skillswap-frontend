import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from './api'; 
import { toast } from 'react-toastify';

const SignUpPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // --- GOOGLE OAUTH LOGIC ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const toastId = toast.loading("Authenticating with Google...");
      try {
        // 1. Send Access Token to Spring Boot
        const res = await api.post('/api/auth/google', { 
          token: tokenResponse.access_token 
        });

        const data = res.data;

        // 2. Logic based on Backend Response
        if (data.isNewUser) {
          toast.update(toastId, { render: "Welcome! Please complete your profile.", type: "success", isLoading: false, autoClose: 3000 });
          navigate('/create-profile', { 
            state: { 
              fullName: data.tempName, 
              googleId: data.googleId || '',
              email: data.email 
            } 
          });
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('username', data.username);
          localStorage.setItem('googleId', data.googleId);
          
          toast.update(toastId, { render: `Welcome back, ${data.username}!`, type: "success", isLoading: false, autoClose: 3000 });
          navigate('/user-dashboard');
        }
      } catch (error) {
        console.error("Google Auth Error:", error);
        toast.update(toastId, { render: "Authentication failed. Please try again.", type: "error", isLoading: false, autoClose: 3000 });
      }
    },
    onError: () => toast.error("Google Login Failed"),
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating your account...");
    try {
      const response = await api.post('/api/auth/signup', credentials);
      if (response.status === 201 || response.status === 200) {
        localStorage.setItem('username', credentials.username);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        toast.update(toastId, { render: "Signup successful!", type: "success", isLoading: false, autoClose: 3000 });
        navigate('/create-profile'); 
      }
    } catch (error) {
      const errorMessage = error.response?.data || "Could not connect to the server.";
      toast.update(toastId, { render: `Signup Failed: ${errorMessage}`, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12">
      <Link 
  to="/" 
  className="absolute top-8 right-8 md:top-12 md:right-12 z-20 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 group"
>
  <span className="group-hover:-translate-x-1 transition-transform">←</span> 
  Back to Home
</Link>
      <Link to="/" className="mb-10 flex items-center gap-2 group">
        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-white font-bold">S</div>
        <span className="text-xl font-bold text-gray-800">Skill<span className="text-zinc-800">Swap</span></span>
      </Link>

      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-xl shadow-sky-100/50 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 font-medium text-sm">Join the community to swap skills and grow.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              name="username"
              type="text" 
              required
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter Username" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-zinc-800 outline-none transition-all" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              name="password"
              type="password" 
              required
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter Password" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-zinc-800 outline-none transition-all" 
            />
          </div>
          
          <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-zinc-400 transition-all shadow-lg active:scale-95 mt-2">
            Register 
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or</span></div>
          </div>

          <button 
            type="button" 
            onClick={() => googleLogin()}
            className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="google" />
            Continue with Google
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm font-medium">
          Already have an account? <Link to="/signin" className="text-sky-500 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;