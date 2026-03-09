import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './api'; // Use your centralized api instance
import { toast } from 'react-toastify';

const CreateProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // 1. Unified Data Detection from Google or Normal Signup
  const googleId = location.state?.googleId || null;
  const googleEmail = location.state?.email || '';
  const initialFullName = location.state?.fullName || '';

  const [formData, setFormData] = useState({
    fullName: initialFullName,
    professionalTitle: '',
    bio: '',
    skills: '',
    // LOGIC: If Google, auto-gen username. If Standard, take existing.
    username: googleId 
      ? `${googleEmail.split('@')[0]}${Math.floor(100 + Math.random() * 899)}` 
      : (localStorage.getItem('username') || ''),
    password: googleId || '', 
    googleId: googleId
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !googleId) {
      toast.error("Session expired. Please sign up again.");
      navigate('/signup');
    }
  }, [navigate, googleId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Saving your profile details...");

    const token = localStorage.getItem('token');
    
    // Determine the endpoint based on user type
    const endpoint = googleId 
      ? '/api/auth/createProfileGoogle' 
      : `/api/user/createProfile?username=${localStorage.getItem('username')}`;

    try {
      // Using 'api' instance instead of raw fetch for consistency
      const response = await api.post(endpoint, formData, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        
        // Sync local storage with verified backend data
        if (data.token) localStorage.setItem('token', data.token); 
        localStorage.setItem('username', data.username || formData.username);
        localStorage.setItem('fullname', data.fullName || formData.fullName);
        localStorage.setItem('profileCreated', 'true');
        
        toast.update(toastId, { 
          render: "Profile created! Welcome to SkillSwap.", 
          type: "success", 
          isLoading: false, 
          autoClose: 3000 
        });

        navigate('/user-dashboard', { replace: true }); 
      }
    } catch (error) {
      console.error("Profile Creation Error:", error);
      const errorMsg = error.response?.data || "Could not save profile.";
      toast.update(toastId, { 
        render: `Action Failed: ${errorMsg}`, 
        type: "error", 
        isLoading: false, 
        autoClose: 4000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            {googleId ? "Personalize" : "Final Step"}
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            {googleId 
              ? `Verification successful! Let's set up your expertise.` 
              : "Tell the community about your expertise and skills."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
          
          {/* Section 1: Name */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <input 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              required 
              placeholder="Full Name"
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all font-medium"
            />
          </div>

          {/* Section 2: Professional Details */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Professional Title</label>
            <input 
              name="professionalTitle" 
              onChange={handleChange} 
              placeholder="e.g. Senior Java Developer" 
              required 
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all font-medium"
            />
          </div>

          {/* Section 3: Bio */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Short Bio</label>
            <textarea 
              name="bio" 
              onChange={handleChange} 
              rows="3" 
              placeholder="Briefly describe your experience and what you want to share..."
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all font-medium resize-none"
            />
          </div>

          {/* Section 4: Skills */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Skills (Comma separated)</label>
            <input 
              name="skills" 
              onChange={handleChange} 
              placeholder="React, Spring Boot, Figma..." 
              required 
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all font-medium"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl text-white font-black shadow-lg transition-all active:scale-95 ${
              isLoading ? 'bg-gray-400' : 'bg-gray-900 hover:bg-zinc-400 shadow-sky-100'
            }`}
          >
            {isLoading ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;