import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; 
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();

    // 1. Frontend Validation
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Security Breach: Passwords do not match.");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("Weak Protocol: Min 6 characters required.");
    }

    setLoading(true);
    const toastId = toast.loading("Updating security credentials...");

    try {
      // 2. API Call matching your @RequestBody Map<String,String>
      const response = await api.post("/api/auth/reset-password", {
        username: formData.username,
        newPassword: formData.newPassword
      });

      // Since your backend returns ResponseEntity.ok(), we check the message
      toast.update(toastId, { 
        render: response.data || "Password synchronized successfully!", 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });
      
      // Redirect to signin after success
      setTimeout(() => navigate('/signin'), 3000);

    } catch (error) {
      // This block will now trigger if you change backend to return .badRequest()
      const errorMsg = error.response?.data || "Update failed. System rejected credentials.";
      toast.update(toastId, { 
        render: errorMsg, 
        type: "error", 
        isLoading: false, 
        autoClose: 4000 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 selection:bg-blue-100 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 p-10 rounded-[3rem] shadow-2xl shadow-slate-200">
        
        <header className="mb-10 text-center">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black mx-auto mb-6 shadow-lg shadow-slate-200">
            R
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Reset Password
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Update your Arena Access Key</p>
        </header>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-1">
            <Label text="Confirm Identifier" />
            <Input 
              name="username"
              type="text" 
              placeholder="Username" 
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <Label text="New Secret Key" />
            <Input 
              name="newPassword"
              type="password" 
              placeholder="••••••••" 
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <Label text="Repeat Secret Key" />
            <Input 
              name="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl
              ${loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-blue-600 hover:-translate-y-1 shadow-blue-100'
              }`}
          >
            {loading ? 'Processing...' : 'Sync New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Sub-components for clean code
const Label = ({ text }) => (
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
    {text}
  </label>
);

const Input = ({ ...props }) => (
  <input
    {...props}
    required
    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-inner"
  />
);

export default ResetPassword;