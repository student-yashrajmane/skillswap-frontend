import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; 
import { toast } from 'react-toastify';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- MODAL & PROFILE STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // --- DELETE CONFIRMATION STATE ---
  const [deleteConfig, setDeleteConfig] = useState({ isOpen: false, username: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/all-users');
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to sync with user database");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (username) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      setIsEditing(false);
      const res = await api.get(`api/admin/view-profile/${username}`);
      setSelectedProfile(res.data);
    } catch (err) {
      toast.error("Could not retrieve profile data");
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      await api.put(`/api/admin/update-profile/${selectedProfile.username}`, selectedProfile);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchUsers(); 
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleBlockUser = async (username) => {
    try {
      await api.put(`/api/admin/toggle-block/${username}`);
      toast.warning(`Access status modified for @${username}`);
      fetchUsers();
    } catch (err) {
      toast.error("Status update rejected");
    }
  };

  const confirmDelete = async () => {
    const username = deleteConfig.username;
    try {
      await api.delete(`/api/admin/delete/${username}`);
      toast.success(`User @${username} purged.`);
      setDeleteConfig({ isOpen: false, username: null });
      fetchUsers();
    } catch (err) {
      toast.error("Delete operation failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-950 flex flex-col p-8 sticky top-0 h-screen shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-12 px-2 text-white">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black">S</div>
          <span className="text-xl font-black tracking-tighter italic uppercase">Arena<span className="text-blue-500">.OS</span></span>
        </div>
        <nav className="flex-1 space-y-2">
           <AdminNavItem label="Overview"  onClick={() => navigate('/admin-dashboard')} />
          <AdminNavItem label="Users"  active={true} onClick={() => navigate('/admin-users')} />
          <AdminNavItem label="Meetings" onClick={() => navigate('/admin-meetings')} />
          <AdminNavItem label="Requests" onClick={() => navigate('/admin-requests')} />
          <AdminNavItem label="Quiz Details" onClick={() => navigate('/admin-quiz')} />
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">User Management</p>
            <h1 className="text-4xl font-black tracking-tight uppercase italic">Registry</h1>
          </div>
          <input 
            type="text" 
            placeholder="Search username..." 
            className="px-6 py-3 bg-white rounded-2xl text-xs font-bold border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all w-64 shadow-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </header>

        {/* --- PERFECTLY DESIGNED TABLE --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden text-slate-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">User Identity</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Status</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">System Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="font-black text-slate-300 uppercase tracking-widest text-[10px]">Synchronizing Registry...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map((u, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-all duration-300 group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 text-lg tracking-tighter italic lowercase">@{u.username}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${u.isEnable ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' : 'bg-rose-50/50 border-rose-100 text-rose-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.isEnable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{u.isEnable ? 'Active' : 'Blocked'}</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end items-center gap-8">
                      <button onClick={() => handleViewProfile(u.username)} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-all">Profile</button>
                      <button 
                        onClick={() => handleBlockUser(u.username)} 
                        className={`text-[10px] font-black uppercase px-5 py-2 rounded-xl border transition-all ${u.isEnable ? 'text-amber-500 border-amber-100 hover:bg-amber-500 hover:text-white' : 'text-emerald-500 border-emerald-100 hover:bg-emerald-500 hover:text-white'}`}>
                        {u.isEnable ? 'Restrict' : 'Restore'}
                      </button>
                      <button 
                        onClick={() => setDeleteConfig({ isOpen: true, username: u.username })} 
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- ATTRACTIVE DELETE MODAL --- */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-center scale-up-center">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Purge Request</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">You are about to permanently delete <span className="text-slate-900 font-bold italic">@{deleteConfig.username}</span> from the central registry. This action is irreversible.</p>
            <div className="flex flex-col gap-3">
                <button onClick={confirmDelete} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">Confirm Deletion</button>
                <button onClick={() => setDeleteConfig({ isOpen: false, username: null })} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">Abort Mission</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PROFILE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in duration-200">
            {modalLoading ? <div className="text-center p-20 font-black text-slate-300 animate-pulse uppercase tracking-widest">Accessing File...</div> : (
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">{isEditing ? 'Edit Profile' : 'User Profile'}</h2>
                    <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">@{selectedProfile?.username}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-all">✕</button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ProfileField label="Full Name" value={selectedProfile?.fullName} isEditing={isEditing} onChange={(v) => setSelectedProfile({...selectedProfile, fullName: v})} />
                    <ProfileField label="Professional Title" value={selectedProfile?.professionalTitle} isEditing={isEditing} onChange={(v) => setSelectedProfile({...selectedProfile, professionalTitle: v})} />
                  </div>
                  <ProfileField label="Bio" value={selectedProfile?.bio} isEditing={isEditing} isTextArea onChange={(v) => setSelectedProfile({...selectedProfile, bio: v})} />
                  <div className="grid grid-cols-2 gap-4">
                    <ProfileField label="Skills" value={selectedProfile?.skills} isEditing={isEditing} onChange={(v) => setSelectedProfile({...selectedProfile, skills: v})} />
                    <ProfileField label="Arena Coins" value={selectedProfile?.coins} isEditing={isEditing} type="number" onChange={(v) => setSelectedProfile({...selectedProfile, coins: v})} />
                  </div>

                  <div className="mt-8 flex gap-3">
                    {isEditing ? (
                      <>
                        <button type="button" onClick={handleUpdateProfile} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setIsEditing(true)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Modify Profile Data</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileField = ({ label, value, isEditing, onChange, isTextArea, type = "text" }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {isEditing ? (
      isTextArea ? (
        <textarea className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )
    ) : (
      <div className="p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 border border-transparent italic">{value || 'NOT_FOUND'}</div>
    )}
  </div>
);

const AdminNavItem = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${active ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
    {label}
  </button>
);

export default UserManagement;