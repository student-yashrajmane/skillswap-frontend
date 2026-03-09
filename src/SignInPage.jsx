import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api'; 
import { GoogleLogin } from '@react-oauth/google'; 
import { jwtDecode } from 'jwt-decode'; 
import { toast } from 'react-toastify';

const SignInPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Modal & Recovery States ---
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [recoveryData, setRecoveryData] = useState({
    username: '',
    email: ''
  });

  // --- Sign In States ---
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleRecoveryChange = (e) => {
    setRecoveryData({ ...recoveryData, [e.target.name]: e.target.value });
  };

  // --- Forgot Password Logic ---
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Client-side Validation
    if (!recoveryData.username || !recoveryData.email) {
      return toast.warning("Identity and Email required for verification.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryData.email)) {
      return toast.error("Invalid frequency. Please provide a valid email address.");
    }

    setIsResetLoading(true);
    const toastId = toast.loading("Verifying identity protocols...");
    
    try {
      // 2. API Call
      const response = await api.post("/api/auth/forgot-password", { 
        username: recoveryData.username, 
        email: recoveryData.email 
      });

      // 3. Extract Message from Endpoint
      const msg = typeof response.data === 'string' ? response.data : (response.data?.message || "Recovery protocol dispatched.");

      toast.update(toastId, { 
        render: msg, 
        type: "info", 
        isLoading: false, 
        autoClose: 5000 
      });
      
      setIsForgotModalOpen(false); 
      setRecoveryData({ username: '', email: '' }); 
    } catch (error) {
      // 4. Extract Error Message from Endpoint
      const errorMsg = error.response?.data?.message || error.response?.data || "Credentials do not match our records.";
      toast.update(toastId, { 
        render: errorMsg, 
        type: "error", 
        isLoading: false, 
        autoClose: 4000 
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  // --- Google Login Logic ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const toastId = toast.loading("Verifying Google account...");
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleId = decoded.sub;

      const response = await api.post('/api/auth/google-check', { googleId });

      if (response.data.exists) {
        const { token, refreshToken, username, fullname, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('username', username);
        localStorage.setItem('fullname', fullname);
        localStorage.setItem('role', role);
        
        toast.update(toastId, { render: `Welcome back, ${fullname}!`, type: "success", isLoading: false, autoClose: 2000 });
        
        const userRole = (role || '').toUpperCase();
        userRole.includes('ADMIN') ? navigate('/admin-dashboard') : navigate('/user-dashboard');
      } else {
        toast.dismiss(toastId);
        navigate('/create-profile', { 
          state: { googleId, email: decoded.email, fullName: decoded.name } 
        });
      }
    } catch (error) {
        if(error.response?.status === 423)
          {
             toast.update(toastId, { render: "Account Blocked.Contact Support.", type: "error", isLoading: false, autoClose: 3000 });
            
          } 
          else{
             toast.update(toastId, { render: "Google Auth failed.", type: "error", isLoading: false, autoClose: 3000 });
          }
     
    } finally {
      setIsLoading(false);
    }
  };

  // --- Standard SignIn Logic ---
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const response = await api.post('/api/auth/signin', credentials);
     
      if (response.status === 200) {
        const { token, refreshToken, username, fullname, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('username', username);
        localStorage.setItem('fullname', fullname);
        localStorage.setItem('role', role);

        toast.success(`Authenticated as ${username}`);

        const userRole = (role || '').toUpperCase();
        userRole.includes('ADMIN') ? navigate('/admin-dashboard') : navigate('/user-dashboard');
      }
    } catch (error) {
      const status = error.response?.status;
      
      if(status === 423) toast.error("Account Blocked. Contact support.");
      else if (status === 404) {
        toast.info("Profile incomplete. Redirecting...");
        localStorage.setItem('username', error.response.data);
        navigate('/create-profile');
      } else if (status === 401 || status === 403) toast.error("Invalid credentials.");
      else toast.error("Server unreachable. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-[#f8fafc] font-sans flex items-center justify-center px-6 relative overflow-hidden selection:bg-sky-100">
       <Link 
  to="/" 
  className="absolute top-8 right-8 md:top-12 md:right-12 z-20 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 group"
>
  <span className="group-hover:-translate-x-1 transition-transform">←</span> 
  Back to Home
</Link>
      {/* --- RECOVERY MODAL --- */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsForgotModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Account Recovery</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Validate identity to proceed</p>
            </div>

          
            
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Identifier (Username)</label>
                <input 
                  name="username" type="text" placeholder="e.g. neuro_coder" required
                  value={recoveryData.username} onChange={handleRecoveryChange}
                  className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                />
              </div>

             
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Registered Email</label>
                <input 
                  name="email" type="email" placeholder="email@example.com" required
                  value={recoveryData.email} onChange={handleRecoveryChange}
                  className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => setIsForgotModalOpen(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isResetLoading}
                  className={`flex-[2] py-4 text-white font-black rounded-2xl transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100
                    ${isResetLoading ? 'bg-slate-300' : 'bg-slate-900 hover:bg-blue-600'}`}
                >
                  {isResetLoading ? 'Processing...' : 'Request Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SIGN IN CARD --- */}
    
      <div className="w-full max-w-[480px] bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl shadow-slate-200 border border-slate-100 relative z-10">
            
        
        <div className="text-center space-y-4 mb-10">
         

          <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-xl mx-auto transition-transform hover:rotate-12 cursor-default">S</div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">
              New here? <Link to="/signup" className="text-sky-500 hover:text-sky-700 font-black">Join the Guild</Link>
            </p>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 transition-colors group-focus-within:text-slate-900">Identifier</label>
              <input 
                name="username" type="text" placeholder="Username" required 
                value={credentials.username} onChange={handleChange}
                className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-sky-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700 shadow-inner" 
              />
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors group-focus-within:text-slate-900">Secret Key</label>
                <button 
                  type="button" onClick={()=> setIsForgotModalOpen(true)} 
                  className="text-[10px] font-black text-slate-300 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <input 
                name="password" type="password" required placeholder="••••••••" 
                value={credentials.password} onChange={handleChange}
                className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-sky-50 focus:border-slate-900 outline-none transition-all font-bold text-slate-700 shadow-inner" 
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className={`w-full py-6 text-white font-black rounded-[2rem] transition-all duration-500 shadow-2xl flex justify-center items-center gap-3 text-lg ${
              isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-zinc-800 hover:-translate-y-1'
            }`}
          >
            {isLoading ? <div className="animate-spin h-6 w-6 border-4 border-white/30 border-t-white rounded-full"></div> : 'Enter Arena'}
          </button>

          <div className="relative py-4 flex items-center justify-center">
            <div className="w-full border-t border-slate-100 absolute"></div>
            <span className="relative bg-white px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Biometric Sync</span>
          </div>

          <div className="flex justify-center transition-opacity hover:opacity-80 active:scale-95">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Social login unavailable")}
              useOneTap theme="outline" shape="pill" size="large"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;