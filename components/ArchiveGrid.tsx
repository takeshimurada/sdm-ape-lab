
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Archive item type definition
interface ArchiveItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  title: string;
  tags: string[];
  year: string;
}

// Constants - RAW/Brutalist Style
const ANIMATION_CONFIG = {
  STAGGER_DELAY: 0.05,
  GLITCH_DURATION: 0.15,
} as const;

// Raw/Brutalist Archive Card with variable sizes
const ArchiveCard: React.FC<{ item: ArchiveItem; index: number }> = React.memo(({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // 불규칙한 크기 패턴 (but 규칙적)
  const sizeVariants = [
    'col-span-1 row-span-1', // 작은 정사각형
    'col-span-2 row-span-1', // 가로 직사각형
    'col-span-1 row-span-2', // 세로 직사각형
    'col-span-2 row-span-2', // 큰 정사각형
    'col-span-1 row-span-1', // 작은 정사각형
    'col-span-1 row-span-2', // 세로 직사각형
  ];

  const sizeClass = sizeVariants[index % sizeVariants.length];

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        delay: index * ANIMATION_CONFIG.STAGGER_DELAY,
        duration: 0.2,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative cursor-none border-2 border-white/10 ${sizeClass}`}
    >
      {/* Media Container - Full bleed */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        {item.type === 'video' ? (
          <video 
            src={item.url} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
            style={{
              filter: isHovered ? 'grayscale(0) contrast(1.1)' : 'grayscale(0.3) contrast(0.9)',
              transition: 'filter 0.2s ease-out'
            }}
          />
        ) : (
          <img 
            src={item.url} 
            alt={item.title} 
            loading="lazy"
            className="w-full h-full object-cover"
            style={{
              filter: isHovered ? 'grayscale(0) contrast(1.1)' : 'grayscale(0.3) contrast(0.9)',
              transition: 'filter 0.2s ease-out'
            }}
          />
        )}
        
        {/* Noise overlay for RAW feel */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'3.5\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          }}
        />

        {/* Scanline effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />
      </div>

      {/* Info overlay - Only on hover */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-black/80 flex flex-col justify-between p-4 backdrop-blur-sm"
      >
        {/* Top: ID */}
        <div className="flex justify-between items-start">
          <span 
            className="text-white font-mono text-xs opacity-50"
            style={{ letterSpacing: '0.1em' }}
          >
            [{String(item.id).padStart(3, '0')}]
          </span>
          <span className="text-white font-mono text-xs opacity-50">
            {item.type === 'video' ? 'VID' : 'IMG'}
          </span>
        </div>

        {/* Bottom: Info */}
        <div>
          <h3 
            className="text-white font-mono text-sm mb-2 uppercase tracking-wider leading-tight"
            style={{
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
            }}
          >
            {item.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {item.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="text-gray-300 font-mono text-xs border border-white/20 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-gray-400 font-mono text-xs">
            {item.year}
          </p>
        </div>
      </motion.div>

      {/* Glitch effect on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.3, 0],
            x: [0, -2, 2, 0],
          }}
          transition={{ 
            duration: ANIMATION_CONFIG.GLITCH_DURATION,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 2,
          }}
          className="absolute inset-0 bg-cyan-500/10 mix-blend-screen pointer-events-none"
        />
      )}
    </motion.article>
  );
});

ArchiveCard.displayName = 'ArchiveCard';

// Main Archive Grid Component
const ArchiveGrid: React.FC = () => {
  const [items, setItems] = React.useState<ArchiveItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // JSON 파일에서 데이터 로드
  React.useEffect(() => {
    fetch('/archive-data.json')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load archive data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black overflow-y-auto">
      {/* RAW/Brutalist Container */}
      <div className="max-w-[1600px] mx-auto px-6 pt-24 pb-16">
        {/* Header - Minimal & Raw */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-12 border-b-2 border-white/10 pb-6"
        >
          <div className="flex justify-between items-end">
            <div>
              <h1 
                className="text-white font-mono text-2xl uppercase tracking-widest mb-1"
                style={{
                  letterSpacing: '0.3em',
                }}
              >
                ARCHIVE
              </h1>
              <p className="text-gray-500 font-mono text-xs tracking-wider">
                [{items.length} ENTRIES] / LAST UPDATE: {new Date().toISOString().split('T')[0]}
              </p>
            </div>
            <div className="text-gray-600 font-mono text-xs">
              [SCROLL TO EXPLORE]
            </div>
          </div>
        </motion.header>

        {/* Grid - Dense & Raw with irregular sizes */}
        <div className="grid grid-cols-4 gap-0 auto-rows-[200px]">
          {items.map((item, idx) => (
            <ArchiveCard key={item.id} item={item} index={idx} />
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t-2 border-white/10">
          <p className="text-gray-600 font-mono text-xs text-center">
            SDM APE LAB © {new Date().getFullYear()} / ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchiveGrid;
