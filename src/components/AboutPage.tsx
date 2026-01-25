
import React, { Suspense, useState, useEffect, useMemo, useCallback, Component, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Float, Environment, ContactShadows } from '@react-three/drei';
import CustomModelLoader from './CustomModelLoader';

interface AboutPageProps {
  modelUrl: string;
  showDetails: boolean;
  text: string;
  isTranslating: boolean;
  onTranslateSystem: () => void;
  onExit: () => void;
}

// Error Boundary for WebGL failures
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.log('3D rendering error (using fallback):', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Constants
const CHARS = '01';
const SCRAMBLE_SPEED = 15; // Faster: 40 → 15
const SCRAMBLE_INCREMENT = 2.0; // Faster: 0.8 → 2.0
const DOT_INTERVAL = 400;

const ScrambledText: React.FC<{ text: string; isDecoding: boolean; onComplete?: () => void }> = ({ text, isDecoding, onComplete }) => {
  const [displayText, setDisplayText] = useState('');

  // Memoize initial binary to prevent recalculation
  const initialBinary = useMemo(() => {
    return text.split('').map(c => (c === '\n' || c === ' ' ? c : CHARS[Math.floor(Math.random() * 2)])).join('');
  }, [text]);

  useEffect(() => {
    // During translation, show scrambled version of current text
    if (isDecoding) {
      // Keep showing scrambled current text instead of clearing
      const scrambled = text.split('').map(c => (c === '\n' || c === ' ' ? c : CHARS[Math.floor(Math.random() * 2)])).join('');
      setDisplayText(scrambled);
      
      // Animate scrambling while translating
      const scrambleInterval = setInterval(() => {
        const scrambled = text.split('').map(c => (c === '\n' || c === ' ' ? c : CHARS[Math.floor(Math.random() * 2)])).join('');
        setDisplayText(scrambled);
      }, 100);
      
      return () => clearInterval(scrambleInterval);
    }

    // Start text animation after translation
    let iteration = 0;
    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === '\n' || char === ' ') return char;
            if (index < iteration) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }

      iteration += SCRAMBLE_INCREMENT;
    }, SCRAMBLE_SPEED);

    return () => clearInterval(interval);
  }, [text, isDecoding, onComplete]);

  return (
    <span 
      style={{ 
        whiteSpace: 'pre-line',
        filter: 'url(#natural-stone)', 
        background: 'linear-gradient(to bottom, #ffffff, #d1d5db 40%, #9ca3af 90%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        display: 'inline-block',
      }}
    >
      {displayText || initialBinary}
    </span>
  );
};

const LoadingDots: React.FC = () => {
  const [dots, setDots] = useState('.');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev === '....' ? '.' : prev + '.');
    }, DOT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-pink-500 italic font-mono brightness-150">HMM{dots}</span>;
};

// Memoized 3D icon component for better performance
const SocialIcon3D: React.FC<{ icon: React.ReactNode; isHovered: boolean }> = React.memo(({ icon, isHovered }) => {
  return (
    <div 
      className="relative transition-all duration-500"
      style={{
        filter: 'url(#natural-stone)',
        transform: isHovered ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
        color: '#444',
        textShadow: isHovered 
          ? `0 1px 0 #222, 0 2px 0 #111, 0 4px 8px rgba(0,0,0,0.6)` 
          : `0 1px 0 #222, 0 2px 0 #111, 0 3px 5px rgba(0,0,0,0.4)`
      }}
    >
      <div style={{ filter: 'drop-shadow(0 1px 0 #000)' }}>
        {icon}
      </div>
    </div>
  );
});

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; isMail?: boolean }> = ({ href, icon, isMail }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a 
      href={href} 
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noopener noreferrer"}
      onClick={(e) => e.stopPropagation()} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-center justify-center p-4 sm:p-6 transition-all duration-500 cursor-none pointer-events-auto"
    >
      <SocialIcon3D icon={icon} isHovered={isHovered} />
    </a>
  );
};

const AboutPage: React.FC<AboutPageProps> = ({ modelUrl, showDetails, text, isTranslating, onTranslateSystem, onExit }) => {
  const [isTextFinished, setIsTextFinished] = useState(false);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);

  const formattedText = useMemo(() => {
    return text.split('.').map(s => s.trim()).filter(s => s.length > 0).join('.\n');
  }, [text]);

  const handleTextComplete = useCallback(() => {
    setIsTextFinished(true);
  }, []);

  useEffect(() => {
    setIsTextFinished(false);
  }, [text, isTranslating]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onExit}
      className="relative w-full h-full flex items-center justify-center bg-[#010101] cursor-none"
    >
      {/* 3D Background - Only render if WebGL is supported */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ErrorBoundary fallback={<div className="w-full h-full bg-gradient-to-br from-pink-900/20 to-purple-900/20"></div>}>
          <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true, toneMapping: 3 }}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={30} />
            <ambientLight intensity={0.08} />
            <pointLight position={[-10, -10, -10]} color="#ff007f" intensity={0.3} />
            <directionalLight position={[0, 5, -5]} intensity={0.5} color="#ff007f" />
            <Suspense fallback={null}>
              <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <CustomModelLoader url={modelUrl} />
              </Float>
              <Environment preset="city" environmentIntensity={0.2} />
              <ContactShadows opacity={0.6} scale={15} blur={3} far={10} position={[0, -2.5, 0]} color="#000000" />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="max-w-4xl px-6 sm:px-10 text-center flex flex-col items-center pointer-events-none -mt-6 sm:-mt-12">
              <motion.div
                key={formattedText + isTranslating}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <div className="relative inline-block flex items-center justify-center min-h-[120px]">
                  <p 
                    style={{ 
                      fontFamily: "'Dotum', '돋움', sans-serif",
                      letterSpacing: '0.04em'
                    }}
                    className="text-xl sm:text-2xl md:text-4xl leading-[1.6] font-bold"
                  >
                    <ScrambledText 
                      text={formattedText} 
                      isDecoding={isTranslating} 
                      onComplete={handleTextComplete} 
                    />
                  </p>
                </div>
                {!isTranslating && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="h-[1px] w-16 bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto origin-center opacity-30" 
                  />
                )}
              </motion.div>
              
              <div className="relative mt-2 flex justify-center h-16">
                <AnimatePresence>
                  {isTextFinished && !isTranslating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: 1, 
                        // 자연스러운 떠다니는 움직임
                        y: isHoveringBtn ? [-2, -4, -2] : 0,
                        rotate: isHoveringBtn ? [-0.5, 0.5, -0.5] : 0,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        opacity: { duration: 0.3 },
                        y: isHoveringBtn ? {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        } : { duration: 0.2 },
                        rotate: isHoveringBtn ? {
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        } : { duration: 0.2 },
                      }}
                      onMouseEnter={() => setIsHoveringBtn(true)}
                      onMouseLeave={() => setIsHoveringBtn(false)}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        console.log('????? button clicked!');
                        onTranslateSystem(); 
                      }}
                      className="cursor-none pointer-events-auto text-[clamp(28px,6vw,48px)]"
                      style={{ 
                        display: 'inline-block',
                        fontWeight: 900,
                        letterSpacing: '-0.05em',
                        color: isHoveringBtn ? '#2a2a2a' : '#1a1a1a',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      ?????
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute bottom-10 sm:bottom-16 w-full flex justify-center gap-3 sm:gap-4 z-20 pointer-events-none"
            >
              <SocialLink 
                href="mailto:kitschkitschyayajjajja@gmail.com" 
                isMail
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                }
              />

              <SocialLink 
                href="https://www.instagram.com/sdm.ape.lab" 
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AboutPage;
