import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArchiveDetailPage from './ArchiveDetailPage';

// Archive item type definition - 블로그 스타일
export interface ArchiveItem {
  id: number;
  type: 'image' | 'video' | 'youtube' | 'text' | 'website'; // website 타입 추가
  url: string; // 메인 URL (website 타입인 경우 외부 링크)
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
  const DETAIL_HISTORY_STATE_KEY = 'archiveDetailId';
  const [items, setItems] = React.useState<ArchiveItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<ArchiveItem | null>(null);

  // Archive 데이터 로드 (항상 Cloudflare Pages KV 사용)
  React.useEffect(() => {
    console.log('🔄 Loading archive data...');
    
    // 항상 Cloudflare Pages KV 사용 (로컬과 Cloudflare 동기화)
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // 항상 Functions 경로를 사용하되, 로컬에서는 프록시를 통해 접근
    const apiUrl: string = isLocalhost
      ? '/api/archive'
      : '/api/archive';
    
    console.log('🌐 Fetching from:', apiUrl);
    console.log('📍 Current origin:', window.location.origin);
    console.log('🏷️ Environment:', { isLocalhost });
    
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

        // id 기준 내림차순 정렬(최근 항목이 위로)
        const sorted = [...data].sort((a: ArchiveItem, b: ArchiveItem) => b.id - a.id);
        setItems(sorted);
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
      case 'website': return '𓀁'; // 웹사이트 아이콘 (인터넷/링크)
      default: return '𓊖';
    }
  };

  // 아이템 클릭 핸들러
  const handleItemClick = (item: ArchiveItem) => {
    if (item.type === 'website') {
      // website 타입은 새 탭에서 열기
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      // 다른 타입은 상세 페이지 열기
      setSelectedItem(item);
      window.history.pushState(
        { ...window.history.state, [DETAIL_HISTORY_STATE_KEY]: item.id },
        '',
        `${window.location.pathname}${window.location.search}#archive-${item.id}`
      );
    }
  };

  const handleDetailClose = React.useCallback(() => {
    const currentHistoryState = window.history.state as Record<string, unknown> | null;

    if (currentHistoryState?.[DETAIL_HISTORY_STATE_KEY]) {
      window.history.back();
      return;
    }

    setSelectedItem(null);
  }, []);

  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const nextState = event.state as Record<string, unknown> | null;
      const nextDetailId = nextState?.[DETAIL_HISTORY_STATE_KEY];

      if (!nextDetailId) {
        setSelectedItem(null);
        return;
      }

      const nextItem = items.find((entry) => entry.id === Number(nextDetailId)) ?? null;
      setSelectedItem(nextItem);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [items]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/70 font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p 
            className="text-white/60 text-sm"
            style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
          >
            아직 프로젝트가 없습니다.
          </p>
          <p className="text-xs text-white/50 mt-2 font-mono">
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
        <div className="w-full px-4 md:px-8 pt-28 sm:pt-32 pb-12">
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
                onClick={() => handleItemClick(item)}
                className="group cursor-pointer py-3 px-2 border-b border-white/5 hover:bg-white/3 transition-all"
              >
                <div className="flex items-baseline gap-3">
                  {/* Icon */}
                  <span className="text-white/60 group-hover:text-white transition-colors flex-shrink-0 text-sm">
                    {getIcon(item.type)}
                  </span>
                  
                  {/* Title */}
                  <span 
                    className="text-sm md:text-base text-white/85 group-hover:text-white transition-all duration-150"
                    style={{ 
                      fontFamily: /[\u3131-\uD79D]/.test(item.title) 
                        ? 'Dotum, "돋움", sans-serif' 
                        : 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {item.title}
                  </span>
                  
                  {/* Year */}
                  <span className="text-xs text-white/60 ml-auto flex-shrink-0 font-mono">
                    {item.year}
                  </span>
                </div>
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
            onClose={handleDetailClose}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ArchiveGrid;
