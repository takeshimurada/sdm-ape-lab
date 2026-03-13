
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  currentView: 'HOME' | 'ABOUT' | 'ARCHIVE' | 'ADMIN' | 'GUESTBOOK';
  setView: (view: 'ABOUT' | 'ARCHIVE' | 'GUESTBOOK') => void;
  onLogoClick?: () => void;
}

const TabGlow: React.FC = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        className="absolute inset-x-[-26px] inset-y-[-10px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.16) 52%, transparent 78%)',
          filter: 'blur(15px)',
          zIndex: -1,
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.22, 1],
          opacity: [0.28, 0.52, 0.28],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-x-[-30px] inset-y-[-14px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.11) 44%, transparent 74%)',
          filter: 'blur(18px)',
          zIndex: -2,
        }}
      />

      <motion.div
        initial={{ scaleX: 0.2, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
        className="absolute top-1/2 left-[-34px] right-[-34px] h-[2px] -translate-y-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)',
          filter: 'blur(2.5px)',
          zIndex: -1,
        }}
      />
    </>
  );
};

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLogoClick }) => {
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<'ABOUT' | 'ARCHIVE' | 'GUESTBOOK' | null>(null);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 w-full z-[100] px-4 sm:px-6 md:px-10 py-4 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0"
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
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.35em] sm:tracking-[0.5em] text-white/70 uppercase">
          SDM APE LAB
        </span>
      </div>

      <div className="flex flex-wrap gap-6 md:gap-12 items-center">
        <div
          className="relative"
          onMouseEnter={() => setHoveredTab('ABOUT')}
          onMouseLeave={() => setHoveredTab(null)}
        >
          {hoveredTab === 'ABOUT' && (
            <TabGlow />
          )}
          <button 
            onClick={() => setView('ABOUT')}
            className={`relative z-10 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] transition-all uppercase pointer-events-auto cursor-none ${
              currentView === 'ABOUT' ? 'text-white font-medium' : 'text-white/70 hover:text-white font-light'
            }`}
            style={{
              textShadow: hoveredTab === 'ABOUT'
                ? '0 0 12px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.24)'
                : 'none',
            }}
          >
            ABOUT
          </button>
        </div>
        <div
          className="relative"
          onMouseEnter={() => setHoveredTab('ARCHIVE')}
          onMouseLeave={() => setHoveredTab(null)}
        >
          {hoveredTab === 'ARCHIVE' && (
            <TabGlow />
          )}
          <button 
            onClick={() => setView('ARCHIVE')}
            className={`relative z-10 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] transition-all uppercase pointer-events-auto cursor-none ${
              currentView === 'ARCHIVE' ? 'text-white font-medium' : 'text-white/70 hover:text-white font-light'
            }`}
            style={{
              textShadow: hoveredTab === 'ARCHIVE'
                ? '0 0 12px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.24)'
                : 'none',
            }}
          >
            ARCHIVE
          </button>
        </div>
        <div
          className="relative"
          onMouseEnter={() => setHoveredTab('GUESTBOOK')}
          onMouseLeave={() => setHoveredTab(null)}
        >
          {hoveredTab === 'GUESTBOOK' && (
            <TabGlow />
          )}
          <button 
            onClick={() => setView('GUESTBOOK')}
            className={`relative z-10 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] transition-all uppercase pointer-events-auto cursor-none ${
              currentView === 'GUESTBOOK' ? 'text-white font-medium' : 'text-white/70 hover:text-white font-light'
            }`}
            style={{
              textShadow: hoveredTab === 'GUESTBOOK'
                ? '0 0 12px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.24)'
                : 'none',
            }}
          >
            SAY HI TO ALIEN
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
