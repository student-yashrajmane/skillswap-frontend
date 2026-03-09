import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; 
import { toast } from 'react-toastify';

const EditProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    professionalTitle: '',
    bio: '',
    skills: ''
  });

  const fetchProfileData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
      toast.error("Session missing. Please sign in.");
      navigate('/signin');
      return;
    }

    try {
      setIsFetching(true);
      const response = await api.get(`/api/user/editProfile?username=${username}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const { fullName, professionalTitle, bio, skills } = response.data;
      setFormData({ 
        fullName: fullName || '', 
        professionalTitle: professionalTitle || '', 
        bio: bio || '', 
        skills: skills || '' 
      });

    } catch (error) {
      console.error("Fetch error:", error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error("Access Denied: Please log in again.");
        navigate('/signin');
      } else {
        toast.error("Could not load profile data.");
        navigate('/user-dashboard');
      }
    } finally {
      setIsFetching(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token) {
      toast.error("You must be logged in to update your profile.");
      navigate('/signin');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Updating your professional profile...");
    
    const updatePayload = {
      ...formData,
      username: username
    };

    try {
      const response = await api.put(`/api/user/updateProfile?username=${username}`, updatePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.status === 200) {
        localStorage.setItem('fullname', formData.fullName);
        toast.update(toastId, { 
          render: "Profile updated successfully! ✨", 
          type: "success", 
          isLoading: false, 
          autoClose: 3000 
        });
        navigate('/my-profile'); 
      }
    } catch (error) {
      console.error("Update error detail:", error.response);
      const errorStatus = error.response?.status;
      
      let message = "Failed to update profile.";
      if (errorStatus === 403) message = "Permission denied. Please re-login.";
      
      toast.update(toastId, { 
        render: message, 
        type: "error", 
        isLoading: false, 
        autoClose: 4000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Retrieving your details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex justify-center items-start">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-10 flex flex-col items-center sm:items-start">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
          <p className="text-slate-500 font-semibold mt-2">Update your professional identity</p>
        </div>

        <form onSubmit={handleUpdate} className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-sky-100/50 border border-slate-100 space-y-8">
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Full Name</label>
              <input 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-50 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" 
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Professional Title</label>
              <input 
                name="professionalTitle" 
                value={formData.professionalTitle} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Full Stack Developer"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-50 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" 
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Bio</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                rows="4" 
                placeholder="Tell us about your experience..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-50 outline-none transition-all font-medium text-slate-700 resize-none placeholder:text-slate-300" 
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Skills (Comma separated)</label>
              <input 
                name="skills" 
                value={formData.skills} 
                onChange={handleChange} 
                required 
                placeholder="Java, React, SQL..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-50 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300" 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/my-profile')}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95"
            >
              Cancel
            </button>

            <button 
              type="submit" 
              disabled={isLoading} 
              className={`flex-[2] py-4 rounded-2xl text-white font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-sky-500 shadow-sky-200'
              }`}
            >
              {isLoading ? 'Saving Changes...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;