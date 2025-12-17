
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-8 border-b border-white/10 flex justify-between items-center sticky top-0 z-50 glass">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-300 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
          <i className="fa-solid fa-shirt text-white text-lg"></i>
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          StyleSwap <span className="text-pink-500">AI</span>
        </h1>
      </div>
      <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
        <a href="#" className="hover:text-white transition-colors">How it works</a>
        <a href="#" className="hover:text-white transition-colors">Trends</a>
        <a href="#" className="hover:text-white transition-colors">Inspiration</a>
      </nav>
      <div className="flex gap-4">
        <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-black hover:bg-gray-200 transition-all active:scale-95">
          Pro Account
        </button>
      </div>
    </header>
  );
};

export default Header;
