import React, { useState, useEffect } from 'react';
import api from './api'; // Ensure this points to your axios/api config
import { toast } from 'react-toastify';

const AboutPage = () => {
  // 1. State to hold dynamic stats
  const [counts, setCounts] = useState({
    userCount: 0,
    swapedCount: 0
  });
  const [loading, setLoading] = useState(true);

  // 2. Fetch data from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Replace with your actual endpoint that returns the Map
        const res = await api.get('/api/auth/get-aboutPage'); 
        setCounts({
          userCount: res.data.userCount || 0,
          swapedCount: res.data.swapedCount || 0
        });
      } catch (err) {
        console.error("Failed to fetch platform stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // 3. Map the dynamic data to your stats array
  const stats = [
    { label: 'Active Users', value: loading ? '...' : `${counts.userCount.toLocaleString()}+` },
    { label: 'Skills Swapped', value: loading ? '...' : `${counts.swapedCount.toLocaleString()}` },
  ];

  return (
    <div id="about" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-10">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-20">
          <h2 className="text-zinc-800 font-bold tracking-widest uppercase text-sm mb-3">Our Mission</h2>
          <h3 className="text-5xl font-extrabold text-gray-900">Bridging the Gap Between <br/> Learning and Mastery</h3>
          <div className="w-24 h-1.5 bg-zinc-800 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* IMAGE SIDE */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800" 
              alt="Team collaborating" 
              className="rounded-[3rem] shadow-2xl border-8 border-white"
            />
            {/* FLOATING CARD */}
            <div className="absolute -bottom-10 -right-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-xs hidden lg:block">
              <p className="text-gray-600 italic text-sm">"SkillSwap changed how I view education. It's not about certificates; it's about real-world capability."</p>
            </div>
          </div>

          {/* TEXT SIDE */}
          <div className="space-y-8">
            <p className="text-xl text-gray-600 leading-relaxed">
              Founded in 2026, SkillSwap was born out of a simple idea: <strong>Everyone has a skill to share, and everyone has something to learn.</strong>
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              We move away from traditional one-way teaching. Instead, we facilitate a dynamic exchange where your knowledge is your currency. By validating skills through our <strong>AI-driven Quiz Engine</strong>, we ensure that every swap is high-quality and impactful.
            </p>

            {/* STATS GRID - Now Dynamic */}
            <div className="grid grid-cols-2 gap-6 pt-6">
              {stats.map((stat, index) => (
                <div key={index} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <p className="text-3xl font-black text-zinc-800">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CORE VALUES */}
        <div className="mt-32 grid md:grid-cols-3 gap-10">
          <ValueCard 
            emoji="🤝" 
            title="Community First" 
            desc="We believe in the power of peer-to-peer connection over rigid institutional structures." 
          />
          <ValueCard 
            emoji="🎯" 
            title="Skill Validation" 
            desc="Every mentor on our platform is verified through rigorous testing and user reviews." 
          />
          <ValueCard 
            emoji="🔒" 
            title="Secure Exchange" 
            desc="Our secure swap protocol ensures that your time and knowledge are always respected." 
          />
        </div>

      </div>
    </div>
  );
};

// Small helper component for the bottom cards
const ValueCard = ({ emoji, title, desc }) => (
  <div className="text-center p-8 bg-white/50 rounded-3xl border border-transparent hover:border-sky-100 hover:bg-white transition-all">
    <div className="w-16 h-16 bg-sky-100 text-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner italic font-bold">
      {emoji}
    </div>
    <h4 className="text-xl font-bold mb-3 text-gray-900">{title}</h4>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default AboutPage;