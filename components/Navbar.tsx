
import React from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  currentView: 'HOME' | 'ABOUT' | 'ARCHIVE';
  setView: (view: 'ABOUT' | 'ARCHIVE') => void;
  onLogoClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLogoClick }) => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 w-full z-[100] px-10 py-10 flex justify-between items-center mix-blend-difference"
    >
      <div 
        className="flex flex-col gap-0.5 group cursor-none pointer-events-auto"
        onClick={onLogoClick}
      >
        <span 
          style={{ fontFamily: "'Dotum', '돋움', sans-serif" }}
          className="text-xl font-bold tracking-tight text-white group-hover:text-pink-500 transition-colors uppercase"
        >
          서대문 유인원 연구회
        </span>
        <span className="text-[11px] font-bold tracking-[0.5em] text-gray-400 uppercase">
          SDM APE LAB
        </span>
      </div>

      <div className="flex gap-12 items-center">
        <button 
          onClick={() => setView('ABOUT')}
          className={`text-[11px] font-black tracking-[0.4em] transition-all uppercase pointer-events-auto cursor-none ${
            currentView === 'ABOUT' ? 'text-white' : 'text-gray-600 hover:text-white'
          }`}
        >
          ABOUT
        </button>
        <button 
          onClick={() => setView('ARCHIVE')}
          className={`text-[11px] font-black tracking-[0.4em] transition-all uppercase pointer-events-auto cursor-none ${
            currentView === 'ARCHIVE' ? 'text-white' : 'text-gray-600 hover:text-white'
          }`}
        >
          ARCHIVE
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
