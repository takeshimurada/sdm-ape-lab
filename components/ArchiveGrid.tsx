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
    console.log('🔄 Loading archive data...');
    
    // 백엔드 서버 URL 결정 (HTTPS 사용)
    const isLocalhost = window.location.hostname === 'localhost';
    const backendUrl = isLocalhost 
      ? 'http://localhost:3001'
      : window.location.origin.replace(/\d{4}-/, '3001-'); // 모든 포트를 3001로 변경
    
    const apiUrl = `${backendUrl}/api/archive`;
    console.log('🌐 Fetching from:', apiUrl);
    console.log('📍 Current origin:', window.location.origin);
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 캐시 사용 안 함
    })
      .then(res => {
        console.log('📡 Response status:', res.status);
        console.log('📦 Response type:', res.type);
        console.log('✅ Response ok:', res.ok);
        console.log('📝 Response headers:', Array.from(res.headers.entries()));
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return res.json();
      })
      .then(data => {
        console.log('✅ Archive data loaded:', data);
        console.log('📊 Number of items:', data.length);
        console.log('🔍 First item:', data[0]);
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Failed to load archive data:', err);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error stack:', err.stack);
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

  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-32 pb-20">
          <h1 
            className="text-sm md:text-base mb-2"
            style={{ 
              fontFamily: 'Dotum, "돋움", sans-serif',
              letterSpacing: '0.05em'
            }}
          >
            선택된 작품들
          </h1>
          <p className="text-xs text-gray-500 font-mono mb-8">
            selected work
          </p>
          <p 
            className="text-gray-600 text-sm"
            style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
          >
            아직 프로젝트가 없습니다. 관리자 페이지에서 추가해주세요.
          </p>
          <p className="text-xs text-gray-700 mt-2 font-mono">
            Press Ctrl+Shift+A to access admin page
          </p>
        </div>
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
