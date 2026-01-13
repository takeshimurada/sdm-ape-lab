import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArchiveDetailPage from './ArchiveDetailPage';

// Archive item type definition - 블로그 스타일
export interface ArchiveItem {
  id: number;
  type: 'image' | 'video' | 'youtube' | 'text'; // text 타입 추가
  url: string; // 메인 URL (하위 호환성)
  media?: Array<{ // 여러 미디어 지원
    type: 'image' | 'video' | 'youtube';
    url: string;
  }>;
  title: string;
  tags: string[];
  year: string;
  description?: string; // 블로그 본문
  content?: string; // 추가 콘텐츠 (긴 글)
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
    
    // 백엔드 서버 URL 결정
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost';
    const isSandbox = hostname.includes('sandbox.novita.ai');
    const isCloudflare = hostname.includes('pages.dev');
    
    let apiUrl: string;
    
    if (isLocalhost) {
      // 로컬 개발: 백엔드 서버 직접 연결
      apiUrl = 'http://localhost:3001/api/archive';
    } else if (isSandbox) {
      // Sandbox: HTTPS 백엔드
      const backendUrl = window.location.origin.replace(/\d{4}-/, '3001-');
      apiUrl = `${backendUrl}/api/archive`;
    } else if (isCloudflare) {
      // Cloudflare Pages: 정적 JSON 파일 사용
      apiUrl = '/archive-data.json';
    } else {
      // 기타: 정적 JSON 파일 사용
      apiUrl = '/archive-data.json';
    }
    
    console.log('🌐 Fetching from:', apiUrl);
    console.log('📍 Current origin:', window.location.origin);
    console.log('🏷️ Environment:', { isLocalhost, isSandbox, isCloudflare });
    
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
      case 'text': return '𓀔'; // 텍스트 아이콘
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
      <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p 
            className="text-gray-600 text-sm"
            style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
          >
            아직 프로젝트가 없습니다.
          </p>
          <p className="text-xs text-gray-700 mt-2 font-mono">
            Press Ctrl+Shift+A
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-black text-white">
        {/* Container - 더 넓고 여백 없이 */}
        <div className="w-full px-4 md:px-8 pt-24 pb-12">
          {/* Archive List - 헤더 제거, 바로 시작 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-0"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer py-3 px-2 border-b border-white/5 hover:bg-white/3 transition-all"
              >
                <div className="flex items-baseline gap-3">
                  {/* Icon */}
                  <span className="text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0 text-sm">
                    {getIcon(item.type)}
                  </span>
                  
                  {/* Title */}
                  <span 
                    className={`text-sm md:text-base transition-all duration-150 ${
                      hoveredId === item.id ? 'text-white' : 'text-white/70'
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
