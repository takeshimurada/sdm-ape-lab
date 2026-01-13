import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

// 미디어 렌더러
const MediaRenderer: React.FC<{ type: string; url: string; title: string }> = ({ type, url, title }) => {
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
    return (
      <div className="w-full mb-8">
        <video
          src={url}
          controls
          className="w-full rounded-sm bg-black"
          style={{ maxHeight: '70vh' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
  
  if (type === 'image') {
    return (
      <div className="w-full mb-8">
        <img
          src={url}
          alt={title}
          className="w-full rounded-sm"
          style={{ maxHeight: '80vh', objectFit: 'contain' }}
        />
      </div>
    );
  }
  
  return null;
};

const ArchiveDetailPage: React.FC<ArchiveDetailPageProps> = ({ item, onClose }) => {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 미디어 배열 (media 필드 우선, 없으면 url 사용)
  const mediaItems = item.media && item.media.length > 0 
    ? item.media 
    : item.type !== 'text' 
      ? [{ type: item.type, url: item.url }] 
      : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="min-h-screen py-12 px-4 md:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="fixed top-6 right-6 text-white/40 hover:text-white/80 transition-colors text-2xl z-10"
          aria-label="Close"
        >
          ✕
        </button>

        {/* 블로그 콘텐츠 */}
        <article className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <header className="mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl text-white mb-4"
              style={{ 
                fontFamily: /[\u3131-\uD79D]/.test(item.title) 
                  ? 'Dotum, "돋움", sans-serif' 
                  : 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.4'
              }}
            >
              {item.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 text-sm text-gray-500"
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
                className="text-white/80 leading-relaxed whitespace-pre-wrap"
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
                className="text-white/70 leading-relaxed whitespace-pre-wrap"
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
              className="text-white/40 hover:text-white/80 transition-colors text-sm font-mono"
            >
              ← 돌아가기
            </button>
          </motion.div>
        </article>
      </div>
    </motion.div>
  );
};

export default ArchiveDetailPage;
