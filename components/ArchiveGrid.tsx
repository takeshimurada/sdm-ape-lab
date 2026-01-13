import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArchiveDetailPage from './ArchiveDetailPage';

// Archive item type definition
export interface ArchiveItem {
  id: number;
  type: 'image' | 'video' | 'youtube';
  url: string;
  title: string;
  tags: string[];
  year: string;
  description?: string;
}

// Jon Rafman style Archive Grid - Text-based minimal list
const ArchiveGrid: React.FC = () => {
  const [items, setItems] = React.useState<ArchiveItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<ArchiveItem | null>(null);
  const [hoveredId, setHoveredId] = React.useState<number | null>(null);

  // JSON 파일에서 데이터 로드
  React.useEffect(() => {
    fetch('/api/archive')
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

  // 타입별 아이콘
  const getIcon = (type: string) => {
    switch(type) {
      case 'youtube': return '𓆛';
      case 'video': return '𓁹';
      case 'image': return '𓉔';
      default: return '𓊖';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500 font-mono text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-black text-white">
        {/* Container */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-32 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 
              className="text-sm md:text-base mb-2"
              style={{ 
                fontFamily: 'Dotum, "돋움", sans-serif',
                letterSpacing: '0.05em'
              }}
            >
              선택된 작품들
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              selected work
            </p>
          </motion.div>

          {/* Archive List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-1"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer py-2 px-3 -mx-3 rounded transition-colors hover:bg-white/5"
              >
                <div className="flex items-baseline gap-3">
                  {/* Icon */}
                  <span className="text-white/60 group-hover:text-white transition-colors flex-shrink-0">
                    {getIcon(item.type)}
                  </span>
                  
                  {/* Title */}
                  <span 
                    className={`text-sm md:text-base transition-all duration-200 ${
                      hoveredId === item.id ? 'text-white underline' : 'text-white/80'
                    }`}
                    style={{ 
                      fontFamily: /[\u3131-\uD79D]/.test(item.title) 
                        ? 'Dotum, "돋움", sans-serif' 
                        : 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {item.title}
                  </span>
                  
                  {/* Year */}
                  <span className="text-xs text-gray-600 ml-auto flex-shrink-0 font-mono">
                    {item.year}
                  </span>
                </div>

                {/* Description on hover */}
                {hoveredId === item.id && item.description && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 ml-6 text-xs text-gray-500 overflow-hidden"
                    style={{ 
                      fontFamily: /[\u3131-\uD79D]/.test(item.description) 
                        ? 'Dotum, "돋움", sans-serif' 
                        : 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {item.description.slice(0, 100)}
                    {item.description.length > 100 && '...'}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 pt-6 border-t border-white/10"
          >
            <p className="text-xs text-gray-600 font-mono">
              SDM APE LAB © {new Date().getFullYear()}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Detail Page Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ArchiveDetailPage 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ArchiveGrid;
