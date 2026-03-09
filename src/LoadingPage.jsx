import React from 'react';
import { Link } from 'react-router-dom';

const LoadingPage = () => {
  const handleHomeClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-zinc-800 selection:text-white">
      {/* NAVIGATION BAR */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <a href="/" onClick={handleHomeClick} className="flex items-center gap-2 group transition-transform hover:scale-105">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-zinc-200">
            S
          </div>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">
            Skill<span className="text-zinc-800">Swap</span>
          </span>
        </a>
        
        <div className="hidden md:flex items-center gap-10 text-gray-500 font-medium">
          <Link to="/about" className="hover:text-zinc-500 transition-colors">About</Link>
          <Link to="/features" className="hover:text-zinc-500 transition-colors">Features</Link>
          <Link to="/contact" className="hover:text-zinc-500 transition-colors">Contact</Link>
        </div>

       
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-10 py-20 flex flex-col md:flex-row items-center gap-16">
        
        {/* LEFT CONTENT */}
        <div className="md:w-1/2 space-y-8 text-left">
          <div className="inline-block px-4 py-1.5 bg-zinc-50 border border-zinc-100 rounded-full">
            <span className="text-sm font-bold text-zinc-800 tracking-wide uppercase">🚀 Knowledge is Currency</span>
          </div>
          
          <h1 className="text-7xl font-extrabold text-gray-900 leading-[1.1]">
            Unlock Your <br />
            <span className="text-zinc-800">Potential.</span>
          </h1>
          
          <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
            Master new skills through a community-driven exchange. Connect with experts, 
            validate your knowledge through interactive quizzes, and securely swap expertise 
            to accelerate your professional growth.
          </p>
          
          <div className="flex items-center gap-6 pt-4">
            <Link to="/signup" className="px-10 py-4 bg-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-600 transition-all shadow-xl shadow-zinc-200 active:scale-95">
           Register
            </Link>
             <Link to="/signin" className="px-10 py-4 bg-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-600 transition-all shadow-xl shadow-zinc-200 active:scale-95">
             Log In
            </Link>
           
           
          </div>
        </div>

        {/* RIGHT VISUAL - SIMPLIFIED STRUCTURE */}
        <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-zinc-100 blur-[100px] rounded-full"></div>
          
          {/* Quiz Engine Card */}
          <div className="h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 group relative">
             <img 
               src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600" 
               className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
               alt="Quiz Engine" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
               
                <h3 className="text-white text-2xl font-bold">Quiz Engine</h3>
             </div>
          </div>

          {/* Secure Swaps Card */}
          <div className="h-[400px] mt-12 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 group relative">
             <img 
               src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600" 
               className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
               alt="Secure Swaps" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
           
                <h3 className="text-white text-2xl font-bold">Secure Swaps</h3>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoadingPage;