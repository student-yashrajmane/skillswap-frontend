import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-sky-100">
      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-gray-50">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Skill<span className="text-sky-500">Swap</span>
        </Link>
        <Link to="/" className="text-gray-500 hover:text-zinc-800 font-medium transition-colors">
          ← Back to Home
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-10 py-32">
        <div className="max-w-3xl">
          
          {/* CONTENT SECTION */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 bg-sky-50 text-sky-600 rounded-full text-sm font-bold tracking-wide uppercase">
              Get in touch
            </div>
            
            <h1 className="text-7xl font-black text-gray-900 leading-tight">
              Have a question? <br /> 
              <span className="text-zinc-400">Drop us a line.</span>
            </h1>
            
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
              SkillSwap is a community-driven project. If you've found a bug, need help with your account, or just want to say hello, our inbox is always open.
            </p>
            
            <div className="pt-10 group">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                Official Support Email
              </p>
              <a 
                className="text-4xl md:text-5xl font-bold text-zinc-800 hover:text-sky-500 transition-all duration-300 break-words"
                href="https://mail.google.com/mail/?view=cm&fs=1&to=skillswaparena@gmail.com&su=SkillSwap%20Support&body=Hello%20Team,%0A%0AUsername:%20%0AIssue:%20"
                target="_blank"
                rel="noopener noreferrer"
              >
                skillswaparena@gmail.com
              </a>
              <div className="h-1 w-20 bg-sky-500 mt-4 group-hover:w-64 transition-all duration-500"></div>
            </div>
          </div>

        </div>
      </main>
      
      {/* Footer Branding */}
      <footer className="fixed bottom-10 left-10 hidden md:block">
        <p className="text-gray-300 font-medium">© 2026 SkillSwap Arena</p>
      </footer>
    </div>
  );
};

export default ContactPage;