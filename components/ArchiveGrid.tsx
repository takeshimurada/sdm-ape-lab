
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

// 🎨 실제 프로젝트 데이터 (SDM APE LAB)
// 여기에 실제 프로젝트 이미지/비디오 URL과 정보를 입력하세요
const ARCHIVE_ITEMS: ArchiveItem[] = [
  { 
    id: 1, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?auto=format&fit=crop&q=80&w=1600', 
    title: '서대문 유인원 형태학 연구 01',
    tags: ['형태학', '관찰', '시각연구'],
    year: '2025'
  },
  { 
    id: 2, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600', 
    title: '인간-자연 상호작용 실험',
    tags: ['실험', '인터랙션', '디지털'],
    year: '2025'
  },
  { 
    id: 3, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1600', 
    title: '시선 추적 프로토타입',
    tags: ['관찰', '기술', 'AI'],
    year: '2024'
  },
  { 
    id: 4, 
    type: 'video', 
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-waves-of-light-342-large.mp4', 
    title: '신경망 시각화 프로젝트',
    tags: ['모션', '3D', '디지털아트'],
    year: '2024'
  },
  { 
    id: 5, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1579546671585-6188a61ce002?auto=format&fit=crop&q=80&w=1600', 
    title: '색채 심리학 연구',
    tags: ['색채', '심리학', '시각'],
    year: '2024'
  },
  { 
    id: 6, 
    type: 'video', 
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-shapes-rotating-97-large.mp4', 
    title: '유인원 행동 패턴 분석',
    tags: ['행동', '분석', '실험'],
    year: '2024'
  },
];

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
          {ARCHIVE_ITEMS.map((item, idx) => (
            <ArchiveCard key={item.id} item={item} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchiveGrid;
