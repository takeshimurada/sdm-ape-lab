import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface ArchiveDetailPageProps {
  item: ArchiveItem;
  onClose: () => void;
}

// YouTube URL을 Embed URL로 변환
const getYouTubeEmbedUrl = (url: string): string => {
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  
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

const ArchiveDetailPage: React.FC<ArchiveDetailPageProps> = ({ item, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const renderMedia = () => {
    if (item.type === 'youtube') {
      const embedUrl = getYouTubeEmbedUrl(item.url);
      return (
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={item.title}
          />
        </div>
      );
    } else if (item.type === 'video') {
      return (
        <video
          src={item.url}
          controls
          autoPlay
          loop
          className="w-full h-auto max-h-[70vh] object-contain bg-black"
        />
      );
    } else {
      return (
        <div className="relative w-full">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          )}
          <img
            src={item.url}
            alt={item.title}
            onLoad={() => setImageLoaded(true)}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 py-8 md:px-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
          className="max-w-6xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                돌아가기
              </button>
              
              <span className="text-gray-500 text-sm font-mono">
                [{String(item.id).padStart(3, '0')}]
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Media Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 mb-6"
          >
            {renderMedia()}
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-800"
          >
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {item.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">타입:</span>
                <span className="px-2 py-1 bg-gray-800 text-white rounded font-mono">
                  {item.type === 'youtube' ? '🎬 YouTube' : item.type === 'video' ? '🎥 Video' : '🖼️ Image'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500">연도:</span>
                <span className="text-white font-mono">{item.year}</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-2">태그</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-2">설명</p>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            )}

            {/* URL Info */}
            <div className="pt-6 border-t border-gray-800">
              <p className="text-gray-500 text-xs mb-1">원본 URL</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 text-sm break-all transition-colors"
              >
                {item.url}
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ArchiveDetailPage;
