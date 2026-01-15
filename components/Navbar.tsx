
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  currentView: 'HOME' | 'ABOUT' | 'ARCHIVE' | 'ADMIN' | 'GUESTBOOK';
  setView: (view: 'ABOUT' | 'ARCHIVE' | 'GUESTBOOK') => void;
  onLogoClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLogoClick }) => {
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 w-full z-[100] px-4 sm:px-6 md:px-10 py-4 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mix-blend-difference"
    >
      <div 
        className="relative flex flex-col gap-0.5 group cursor-none pointer-events-auto"
        onClick={onLogoClick}
        onMouseEnter={() => setIsLogoHovered(true)}
        onMouseLeave={() => setIsLogoHovered(false)}
      >
        {/* 광선 효과 (호버 시) */}
        {isLogoHovered && (
          <>
            {/* 중앙 강한 광선 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                filter: 'blur(15px)',
                zIndex: -1,
              }}
            />
            
            {/* 펄스 광선 */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%)',
                filter: 'blur(20px)',
                zIndex: -2,
              }}
            />

            {/* 좌우 광선 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-1/2 left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                filter: 'blur(2px)',
                transform: 'translateY(-50%)',
                zIndex: -1,
              }}
            />
          </>
        )}

        <span 
          className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white transition-all duration-300"
          style={{
            textShadow: isLogoHovered 
              ? '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)'
              : 'none',
            fontFamily: "'Dotum', '돋움', sans-serif",
          }}
        >
          서대문 유인원 연구회
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.35em] sm:tracking-[0.5em] text-gray-400 uppercase">
          SDM APE LAB
        </span>
      </div>

      <div className="flex flex-wrap gap-6 md:gap-12 items-center">
        <button 
          onClick={() => setView('ABOUT')}
          className={`py-3 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] transition-all uppercase pointer-events-auto cursor-none touch-manipulation ${
            currentView === 'ABOUT' ? 'text-white font-medium' : 'text-gray-600 hover:text-white active:text-white/90 font-light'
          }`}
        >
          ABOUT
        </button>
        <button 
          onClick={() => setView('ARCHIVE')}
          className={`py-3 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] transition-all uppercase pointer-events-auto cursor-none touch-manipulation ${
            currentView === 'ARCHIVE' ? 'text-white font-medium' : 'text-gray-600 hover:text-white active:text-white/90 font-light'
          }`}
        >
          ARCHIVE
        </button>
        <button 
          onClick={() => setView('GUESTBOOK')}
          className={`py-3 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] transition-all uppercase pointer-events-auto cursor-none touch-manipulation ${
            currentView === 'GUESTBOOK' ? 'text-white font-medium' : 'text-gray-600 hover:text-white active:text-white/90 font-light'
          }`}
        >
          SAY HI TO ALIEN
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
