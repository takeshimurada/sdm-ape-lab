
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import Navbar from './components/Navbar';
import AboutPage from './components/AboutPage';
import ArchiveGrid from './components/ArchiveGrid';

// Constants
const BASE_PROMPT = "안녕하세요. 정말 반갑습니다. 인간 - 자연을 연구합니다.";
const MODEL_URL = '/face-v2.glb';
const LOADER_DURATION = 500;

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [currentView, setCurrentView] = useState<'HOME' | 'ABOUT' | 'ARCHIVE'>('HOME');
  const [aboutText, setAboutText] = useState('01010101 01010101 01010101'); // Start with binary placeholder
  const [isTranslating, setIsTranslating] = useState(false);

  // Ultra-fast cursor using direct DOM manipulation with CSS transforms
  const cursorRef = useRef<HTMLDivElement>(null);

  // Memoize AI instance to avoid recreating on every render
  const ai = useMemo(() => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn('API_KEY not found in environment variables');
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }, []);

  const fetchTranslation = useCallback(async (targetLanguage: string = "random") => {
    if (!ai) {
      console.error('AI instance not initialized');
      setAboutText(BASE_PROMPT); // Fallback to Korean
      return;
    }

    console.log('Starting translation to:', targetLanguage);
    setIsTranslating(true);
    
    try {
      const prompt = targetLanguage === "random" 
        ? `Translate the following Korean text into a random, interesting language from around the world (such as Spanish, French, German, Italian, Portuguese, Russian, Arabic, Hindi, Japanese, Chinese, etc). Choose ONE language randomly. Return ONLY the translated text, no explanations: "${BASE_PROMPT}"`
        : `Translate the following Korean text to ${targetLanguage}. Return ONLY the translated text: "${BASE_PROMPT}"`;
      
      console.log('Sending prompt to Gemini:', prompt);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: {
          temperature: 1.0
        }
      });

      console.log('Gemini response:', response);

      if (response.text) {
        const translatedText = response.text.trim();
        console.log('Translated text:', translatedText);
        setAboutText(translatedText);
      } else {
        console.warn('No text in response');
        setAboutText(BASE_PROMPT);
      }
    } catch (error) {
      console.error("Translation error:", error);
      setAboutText(BASE_PROMPT);
    } finally {
      setIsTranslating(false);
      console.log('Translation finished');
    }
  }, [ai]);

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

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    rafId = requestAnimationFrame(updateCursor);

    const timer = setTimeout(() => setIsLoaded(true), LOADER_DURATION);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
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
          {/* Constant Ambient Pink Glow */}
          <motion.div 
            animate={{ 
              scale: isClicked ? 1.5 : 1,
              opacity: isClicked ? 0.8 : 0.4
            }}
            transition={{ duration: 0.1 }}
            className="absolute w-16 h-16 bg-pink-500/40 rounded-full blur-[20px] z-0" 
          />
          
          {/* Central Cursor Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff007f" xmlns="http://www.w3.org/2000/svg" className="relative z-20">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          
          {/* Pulsing Light Trail */}
          <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="absolute w-32 h-32 bg-pink-600/10 rounded-full blur-[40px] z-[-1]"
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
          {currentView === 'ARCHIVE' ? (
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
