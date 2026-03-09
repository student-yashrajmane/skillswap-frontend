import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
  const features = [
    {
      title: "Adaptive Quiz Engine",
      description: "Our AI-driven system generates dynamic questions based on your skill level. Pass the quiz to prove your expertise and unlock 'Mastery Badges'.",
      icon: "🎯",
      color: "bg-sky-50",
      textColor: "text-sky-600"
    },
    {
      title: "Secure Swap Protocol",
      description: "Engage in verified knowledge exchanges. Our secure system ensures that both parties fulfill their learning goals before the 'Skill Credits' are released.",
      icon: "🔒",
      color: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Knowledge Currency",
      description: "Earn credits by helping others or passing high-level quizzes. Use your credits to 'buy' time with industry-leading experts.",
      icon: "💎",
      color: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Expert Verification",
      description: "No more fake gurus. Every mentor is vetted through a multi-step process involving community reviews and technical assessments.",
      icon: "✅",
      color: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* SIMPLE NAV FOR FEATURES */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-gray-50">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Skill<span className="text-zinc-800">Swap</span>
        </Link>
        <Link to="/" className="text-gray-500 hover:text-zinc-800 font-medium">← Back to Home</Link>
      </nav>

      <main className="max-w-7xl mx-auto px-10 py-20">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Designed for <span className="text-zinc-800">Serious Learners.</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            We’ve removed the noise of social media to build a platform dedicated purely to technical growth and secure knowledge exchange.
          </p>
        </div>

        {/* FEATURES BENTO GRID */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="group p-10 rounded-[3rem] border border-gray-100 bg-white hover:border-sky-200 hover:shadow-2xl hover:shadow-sky-100 transition-all duration-500">
              <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{f.title}</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                {f.description}
              </p>
             
            </div>
          ))}
        </div>

       
      </main>
    </div>
  );
};

export default FeaturesPage;