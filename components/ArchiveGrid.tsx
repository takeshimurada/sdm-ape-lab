
import React from 'react';
import { motion } from 'framer-motion';

// Archive item type definition
interface ArchiveItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
}

// Constants
const ANIMATION_CONFIG = {
  STAGGER_DELAY: 0.1,
  HOVER_SCALE: 1.02,
  TRANSITION_DURATION: 0.5,
} as const;

const ARCHIVE_ITEMS: ArchiveItem[] = [
  { 
    id: 1, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?auto=format&fit=crop&q=80&w=800', 
    title: 'Morphological Study 01',
    description: '형태학적 연구 01'
  },
  { 
    id: 2, 
    type: 'video', 
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-shapes-rotating-97-large.mp4', 
    title: 'Neurological Sync',
    description: '신경학적 동기화'
  },
  { 
    id: 3, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800', 
    title: 'Synthetic Skin',
    description: '합성 피부'
  },
  { 
    id: 4, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800', 
    title: 'Gaze Analysis',
    description: '시선 분석'
  },
  { 
    id: 5, 
    type: 'video', 
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-waves-of-light-342-large.mp4', 
    title: 'Data Stream',
    description: '데이터 스트림'
  },
  { 
    id: 6, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&q=80&w=800', 
    title: 'Internal Structure',
    description: '내부 구조'
  },
  { 
    id: 7, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1579546671585-6188a61ce002?auto=format&fit=crop&q=80&w=800', 
    title: 'Chromatic Shift',
    description: '색채 이동'
  },
  { 
    id: 8, 
    type: 'video', 
    url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-human-eye-refracting-light-2728-large.mp4', 
    title: 'Visual Cortex',
    description: '시각 피질'
  },
];

// Separate component for better performance
const ArchiveCard: React.FC<{ item: ArchiveItem; index: number }> = React.memo(({ item, index }) => {
  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * ANIMATION_CONFIG.STAGGER_DELAY }}
      whileHover={{ scale: ANIMATION_CONFIG.HOVER_SCALE }}
      className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 cursor-none"
    >
      {item.type === 'video' ? (
        <video 
          src={item.url} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        />
      ) : (
        <img 
          src={item.url} 
          alt={item.title} 
          loading="lazy"
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
        <span className="text-[10px] text-pink-500 font-black tracking-widest uppercase mb-1">
          Entry #{item.id}
        </span>
        <h3 className="text-xl font-bold text-white">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-gray-400 mt-1">{item.description}</p>
        )}
      </div>
    </motion.div>
  );
});

ArchiveCard.displayName = 'ArchiveCard';

const ArchiveGrid: React.FC = () => {
  return (
    <div className="w-full min-h-screen pt-40 pb-20 px-10 overflow-y-auto bg-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-16">
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">
            Experimental Records
          </h2>
          <p className="text-gray-500 text-sm mt-2 tracking-widest font-bold">
            RESEARCH DATA & VISUAL ARCHIVE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARCHIVE_ITEMS.map((item, idx) => (
            <ArchiveCard key={item.id} item={item} index={idx} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ArchiveGrid;
