
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Archive item type definition
interface ArchiveItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  title: string;
  tags: string[];
  year: string;
}

// Constants - Mouthwash Studio Style
const ANIMATION_CONFIG = {
  STAGGER_DELAY: 0.08,
  HOVER_DURATION: 0.6,
  CARD_EASE: [0.22, 1, 0.36, 1], // Custom easing
} as const;

// Mouthwash-style Archive Card
const ArchiveCard: React.FC<{ item: ArchiveItem; index: number }> = React.memo(({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * ANIMATION_CONFIG.STAGGER_DELAY,
        duration: 0.7,
        ease: ANIMATION_CONFIG.CARD_EASE
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-none"
    >
      {/* Media Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
        {item.type === 'video' ? (
          <video 
            src={item.url} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />
        ) : (
          <img 
            src={item.url} 
            alt={item.title} 
            loading="lazy"
            className="w-full h-full object-cover"
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />
        )}
        
        {/* Hover Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/20"
        />
      </div>

      {/* Content - Always Visible (Mouthwash Style) */}
      <div className="mt-5">
        {/* Title */}
        <motion.h3 
          className="text-white text-xl font-normal mb-2 leading-tight"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.01em'
          }}
        >
          {item.title}
        </motion.h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {item.tags.map((tag, idx) => (
            <span 
              key={idx}
              className="text-gray-400 text-xs font-light"
              style={{ letterSpacing: '0.02em' }}
            >
              {tag}
              {idx < item.tags.length - 1 && <span className="ml-2">·</span>}
            </span>
          ))}
        </div>

        {/* Year */}
        <p className="text-gray-600 text-xs font-light">
          {item.year}
        </p>
      </div>
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
      {/* Container with proper padding (Mouthwash style) */}
      <div className="max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16 pt-32 pb-20">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: ANIMATION_CONFIG.CARD_EASE }}
          className="mb-20"
        >
          <h1 
            className="text-white text-5xl sm:text-6xl lg:text-7xl font-light mb-4"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}
          >
            Archive
          </h1>
          <p className="text-gray-500 text-sm font-light tracking-wide">
            Selected Works & Research
          </p>
        </motion.header>

        {/* Grid Layout - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 lg:gap-x-12 lg:gap-y-20">
          {items.map((item, idx) => (
            <ArchiveCard key={item.id} item={item} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchiveGrid;
