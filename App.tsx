
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import AboutPage from './components/AboutPage';
import ArchiveGrid from './components/ArchiveGrid';
import AdminPage from './components/AdminPage';

// Constants
const BASE_PROMPT = "안녕하세요. 정말 반갑습니다. 인간 - 자연을 연구합니다.";
const MODEL_URL = '/face-v2.glb';
const LOADER_DURATION = 500;

// Random language translations (fallback when no API)
const TRANSLATIONS: Record<string, string> = {
  'es': 'Hola. Encantado de conocerte. Investigo la relación humano-naturaleza.',
  'fr': 'Bonjour. Ravi de vous rencontrer. J\'étudie la relation humain-nature.',
  'de': 'Hallo. Sehr erfreut. Ich erforsche die Mensch-Natur-Beziehung.',
  'it': 'Ciao. Molto piacere. Studio il rapporto uomo-natura.',
  'pt': 'Olá. Muito prazer. Estudo a relação humano-natureza.',
  'ru': 'Здравствуйте. Очень приятно. Изучаю отношения человека и природы.',
  'ja': 'こんにちは。お会いできて嬉しいです。人間と自然の関係を研究しています。',
  'zh': '你好。很高兴见到你。我研究人类与自然的关系。',
  'ar': 'مرحبا. سعيد بلقائك. أدرس علاقة الإنسان بالطبيعة.',
  'hi': 'नमस्ते। आपसे मिलकर खुशी हुई। मैं मानव-प्रकृति संबंधों का अध्ययन करता हूं।',
};

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [currentView, setCurrentView] = useState<'HOME' | 'ABOUT' | 'ARCHIVE' | 'ADMIN'>('HOME');
  const [aboutText, setAboutText] = useState('01010101 01010101 01010101'); // Start with binary placeholder
  const [isTranslating, setIsTranslating] = useState(false);

  // Ultra-fast cursor using direct DOM manipulation with CSS transforms
  const cursorRef = useRef<HTMLDivElement>(null);

  const fetchTranslation = useCallback(async (targetLanguage: string = "random") => {
    console.log('Starting translation to:', targetLanguage);
    setIsTranslating(true);
    
    // Small delay to show binary animation
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      if (targetLanguage === "random") {
        // Pick a random language from translations
        const languages = Object.keys(TRANSLATIONS);
        const randomLang = languages[Math.floor(Math.random() * languages.length)];
        const translatedText = TRANSLATIONS[randomLang];
        console.log('Random language selected:', randomLang, translatedText);
        setAboutText(translatedText);
      } else {
        // Try to use system language
        const langCode = targetLanguage.split('-')[0]; // 'ko-KR' -> 'ko'
        if (langCode === 'ko' || langCode === 'kr') {
          setAboutText(BASE_PROMPT);
        } else if (TRANSLATIONS[langCode]) {
          setAboutText(TRANSLATIONS[langCode]);
        } else {
          // Default to Korean if language not found
          setAboutText(BASE_PROMPT);
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
      setAboutText(BASE_PROMPT);
    } finally {
      setIsTranslating(false);
      console.log('Translation finished');
    }
  }, []);

  const handleSetView = useCallback((view: 'ABOUT' | 'ARCHIVE') => {
    if (view === 'ABOUT') {
      // Always translate when opening About page
      console.log('About tab clicked - starting translation');
      setAboutText('01010101 01010101 01010101'); // Reset to binary
      fetchTranslation("random");
    }
    setCurrentView(view);
  }, [fetchTranslation]);

  const handleSystemTranslate = useCallback(() => {
    const userLang = navigator.language || 'en';
    fetchTranslation(userLang);
  }, [fetchTranslation]);

  const handleGoHome = useCallback(() => {
    setCurrentView('HOME');
  }, []);

  useEffect(() => {
    // Ultra-fast cursor movement using RAF for 60fps+ performance
    let rafId: number;
    let mousePos = { x: -100, y: -100 };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };

    const updateCursor = () => {
      if (cursorRef.current) {
        // Direct style manipulation - bypasses ALL React overhead
        cursorRef.current.style.transform = `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(updateCursor);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    // 🔐 Admin access: Ctrl+Shift+A with password
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        const password = prompt('🔐 관리자 비밀번호를 입력하세요:');
        
        // 비밀번호: sdmapelab2025
        if (password === 'sdmapelab2025') {
          setCurrentView('ADMIN');
        } else if (password !== null) {
          alert('❌ 비밀번호가 틀렸습니다.');
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    
    rafId = requestAnimationFrame(updateCursor);

    const timer = setTimeout(() => setIsLoaded(true), LOADER_DURATION);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#010101] text-white overflow-hidden select-none font-sans cursor-none">
      {/* Ultra-fast Mouse Follow Glow - Direct DOM manipulation */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ 
          transform: 'translate(-100px, -100px) translate(-50%, -50%)',
          willChange: 'transform'
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Constant Ambient Pink Glow - Brighter on click */}
          <motion.div 
            animate={{ 
              scale: isClicked ? 2.0 : 1,
              opacity: isClicked ? 1.0 : 0.4
            }}
            transition={{ duration: 0.1 }}
            className="absolute w-20 h-20 bg-pink-500/60 rounded-full blur-[25px] z-0" 
          />
          
          {/* Additional bright flash on click */}
          {isClicked && (
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute w-32 h-32 bg-pink-400/80 rounded-full blur-[30px] z-0"
            />
          )}
          
          {/* Central Cursor Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff007f" xmlns="http://www.w3.org/2000/svg" className="relative z-20">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          
          {/* Pulsing Light Trail - Brighter on click */}
          <motion.div 
             animate={{ 
               scale: isClicked ? [1.5, 1.8, 1.5] : [1, 1.2, 1], 
               opacity: isClicked ? [0.3, 0.5, 0.3] : [0.1, 0.2, 0.1]
             }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="absolute w-40 h-40 bg-pink-600/20 rounded-full blur-[50px] z-[-1]"
          />
        </div>
      </div>

      <AnimatePresence>
        {!isLoaded && (
          <motion.div key="loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010101]">
            <div className="flex flex-col items-center gap-8">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-[3px] border-pink-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-t-[3px] border-pink-500 rounded-full animate-[spin_1s_linear_infinite]"></div>
              </div>
              <p className="text-[11px] tracking-[0.6em] uppercase text-pink-400 font-bold ml-2">Initializing Lab</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar currentView={currentView} setView={handleSetView} onLogoClick={handleGoHome} />

      <main className="relative w-full h-full">
        <AnimatePresence mode="wait">
          {currentView === 'ADMIN' ? (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminPage onExit={handleGoHome} />
            </motion.div>
          ) : currentView === 'ARCHIVE' ? (
            <motion.div key="archive" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 z-10">
              <ArchiveGrid />
            </motion.div>
          ) : (
            <AboutPage 
              key="about-view" 
              modelUrl={MODEL_URL} 
              showDetails={currentView === 'ABOUT'} 
              text={aboutText} 
              isTranslating={isTranslating}
              onTranslateSystem={handleSystemTranslate}
              onExit={handleGoHome}
            />
          )}
        </AnimatePresence>
      </main>

      <div className="absolute top-0 left-0 w-full h-full z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default App;
