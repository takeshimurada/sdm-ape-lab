import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Archive item type definition - 블로그 스타일
export interface ArchiveItem {
  id: number;
  type: 'image' | 'video' | 'youtube' | 'text';
  url: string;
  media?: Array<{
    type: 'image' | 'video' | 'youtube';
    url: string;
  }>;
  title: string;
  tags: string[];
  year: string;
  description?: string;
  content?: string;
}

interface ArchiveDetailPageProps {
  item: ArchiveItem;
  onClose: () => void;
}

// YouTube URL을 Embed URL로 변환
const getYouTubeEmbedUrl = (url: string): string => {
  let videoId = '';
  
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1].split('?')[0];
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

// 백엔드 URL 헬퍼 함수
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost';
  const isSandbox = hostname.includes('sandbox.novita.ai');
  
  if (isLocalhost) {
    return 'http://localhost:3001';
  } else if (isSandbox) {
    return window.location.origin.replace(/\d{4}-/, '3001-');
  }
  return null;
};

// URL 정규화 함수 - /uploads/로 시작하는 경우 처리
const normalizeUrl = (url: string): string => {
  // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // /uploads/로 시작하는 경우
  if (url.startsWith('/uploads/')) {
    const backendUrl = getBackendUrl();

    // 파일 이름/경로에 공백·한글 등이 포함될 수 있으므로 항상 인코딩
    const encodedPath = url
      .split('/')
      .map((part, index) => {
        if (index === 0 || part === '') return part;
        return encodeURIComponent(part);
      })
      .join('/');

    // 로컬/샌드박스: 백엔드 서버 기준 URL 사용
    if (backendUrl) {
      return `${backendUrl}${encodedPath}`;
    }

    // Cloudflare Pages 등 정적 호스팅: 루트 기준 상대 경로 사용
    return encodedPath;
  }
  
  // 기타 상대 경로는 그대로 반환
  return url;
};

// 미디어 렌더러
const MediaRenderer: React.FC<{
  type: string;
  url: string;
  title: string;
  onOpenImage?: (src: string, title: string) => void;
}> = ({ type, url, title, onOpenImage }) => {
  if (type === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(url);
    return (
      <div className="w-full aspect-video bg-black rounded-sm overflow-hidden mb-8">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  
  if (type === 'video') {
    const normalizedUrl = normalizeUrl(url);
    return (
      <div className="w-full mb-8">
        <video
          src={normalizedUrl}
          controls
          className="w-full rounded-sm bg-black"
          style={{ maxHeight: '85vh' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
  
  if (type === 'image') {
    const normalizedUrl = normalizeUrl(url);
    return (
      <div className="w-full mb-8">
        <button
          type="button"
          onClick={() => onOpenImage?.(normalizedUrl, title)}
          className="block w-full cursor-zoom-in"
        >
          <img
            src={normalizedUrl}
            alt={title}
            className="w-full rounded-sm"
            style={{ maxHeight: '90vh', objectFit: 'contain' }}
          />
        </button>
        <p className="mt-2 text-right text-xs text-white/60">Click image to zoom</p>
      </div>
    );
  }
  
  return null;
};

const ArchiveDetailPage: React.FC<ArchiveDetailPageProps> = ({ item, onClose }) => {
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const closeZoom = () => {
    setZoomedImage(null);
    setZoomLevel(1);
  };

  const handleZoomChange = (delta: number) => {
    setZoomLevel((prev) => {
      const next = prev + delta;
      return Math.min(4, Math.max(1, Number(next.toFixed(2))));
    });
  };
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      if (zoomedImage) {
        closeZoom();
        return;
      }

      onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, zoomedImage]);

  // 미디어 배열 (media 필드 우선, 없으면 url 사용)
  const mediaItems = item.type !== 'text'
    ? [
        ...(item.url ? [{ type: item.type, url: item.url }] : []),
        ...(item.media || []),
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      {/* 배경 클릭 영역 */}
      <div className="min-h-screen py-12 px-4 md:px-8 flex items-start justify-center">
        {/* 블로그 콘텐츠 - 더 큰 너비로 확장, 클릭 이벤트 전파 방지 */}
        <article 
          className="w-full max-w-6xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 - 타이틀 크기 줄임 */}
          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 text-sm text-white/60 mb-6"
            >
              <span className="font-mono">{item.year}</span>
              {item.tags && item.tags.length > 0 && (
                <>
                  <span>·</span>
                  <div className="flex gap-2">
                    {item.tags.map((tag, i) => (
                      <span 
                        key={i}
                        style={{ 
                          fontFamily: /[\u3131-\uD79D]/.test(tag) 
                            ? 'Dotum, "돋움", sans-serif' 
                            : 'system-ui, -apple-system, sans-serif'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </header>

          {/* 미디어 갤러리 */}
          {mediaItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              {mediaItems.map((media, index) => (
                <MediaRenderer
                  key={index}
                  type={media.type}
                  url={media.url}
                  title={item.title}
                  onOpenImage={(src, title) => {
                    setZoomedImage({ src, title });
                    setZoomLevel(1);
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* 본문 (description) */}
          {item.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="prose prose-invert prose-sm md:prose-base max-w-none mb-12"
            >
              <p 
                className="text-white/90 leading-relaxed whitespace-pre-wrap"
                style={{ 
                  fontFamily: /[\u3131-\uD79D]/.test(item.description) 
                    ? 'Dotum, "돋움", sans-serif' 
                    : 'system-ui, -apple-system, sans-serif',
                  fontSize: '15px',
                  lineHeight: '1.8'
                }}
              >
                {item.description}
              </p>
            </motion.div>
          )}

          {/* 추가 콘텐츠 (content) */}
          {item.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="prose prose-invert prose-sm md:prose-base max-w-none mb-12"
            >
              <div 
                className="text-white/80 leading-relaxed whitespace-pre-wrap"
                style={{ 
                  fontFamily: /[\u3131-\uD79D]/.test(item.content) 
                    ? 'Dotum, "돋움", sans-serif' 
                    : 'system-ui, -apple-system, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.8'
                }}
              >
                {item.content}
              </div>
            </motion.div>
          )}

          {/* 돌아가기 버튼 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-12 border-t border-white/10"
          >
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors text-sm font-mono"
            >
              ← back
            </button>
          </motion.div>
        </article>
      </div>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95"
            onClick={closeZoom}
          >
            <div className="flex h-full flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="truncate pr-4 text-xs text-white/70">{zoomedImage.title}</p>
                <div className="flex items-center gap-2">
                  <span className="min-w-14 text-center text-xs font-mono text-white/70">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(-0.25)}
                    disabled={zoomLevel <= 1}
                    className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(0.25)}
                    disabled={zoomLevel >= 4}
                    className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={closeZoom}
                    className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-auto"
                onWheel={(e) => {
                  e.preventDefault();
                  handleZoomChange(e.deltaY < 0 ? 0.25 : -0.25);
                }}
              >
                <div className="flex min-h-full min-w-full items-center justify-center p-4 md:p-8">
                  <img
                    src={zoomedImage.src}
                    alt={zoomedImage.title}
                    className="h-auto rounded-sm object-contain"
                    style={{
                      width: `${zoomLevel * 100}%`,
                      maxWidth: zoomLevel === 1 ? '1100px' : 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ArchiveDetailPage;
