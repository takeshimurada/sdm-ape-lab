import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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

interface MediaItem {
  type: 'image' | 'video' | 'youtube' | 'text';
  url: string;
}

const KOREAN_FONT = 'Dotum, "돋움", sans-serif';
const DEFAULT_FONT = 'system-ui, -apple-system, sans-serif';

const hasKoreanText = (value?: string) => Boolean(value && /[\u3131-\uD79D]/.test(value));

const getContentFont = (value?: string) => ({
  fontFamily: hasKoreanText(value) ? KOREAN_FONT : DEFAULT_FONT,
});

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

const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost';
  const isSandbox = hostname.includes('sandbox.novita.ai');

  if (isLocalhost) {
    return 'http://localhost:3001';
  }

  if (isSandbox) {
    return window.location.origin.replace(/\d{4}-/, '3001-');
  }

  return null;
};

const normalizeUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/uploads/')) {
    const backendUrl = getBackendUrl();
    const encodedPath = url
      .split('/')
      .map((part, index) => {
        if (index === 0 || part === '') {
          return part;
        }

        return encodeURIComponent(part);
      })
      .join('/');

    if (backendUrl) {
      return `${backendUrl}${encodedPath}`;
    }

    return encodedPath;
  }

  return url;
};

const preloadImage = (url: string) => {
  const image = new Image();
  image.decoding = 'async';
  image.src = normalizeUrl(url);
};

const MediaRenderer: React.FC<{
  type: MediaItem['type'];
  url: string;
  title: string;
  onOpenImage?: (src: string, title: string) => void;
}> = ({ type, url, title, onOpenImage }) => {
  if (type === 'youtube') {
    return (
      <div className="mb-8 aspect-video w-full overflow-hidden rounded-sm bg-black">
        <iframe
          src={getYouTubeEmbedUrl(url)}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="mb-8 w-full">
        <video
          src={normalizeUrl(url)}
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
      <div className="mb-8 w-full">
        <button
          type="button"
          onClick={() => onOpenImage?.(normalizedUrl, title)}
          className="block w-full cursor-zoom-in"
        >
          <img
            src={normalizedUrl}
            alt={title}
            className="w-full rounded-sm"
            loading="eager"
            decoding="async"
            style={{ maxHeight: '90vh', objectFit: 'contain' }}
          />
        </button>
        <p className="mt-2 text-right text-xs text-white/60">Click image to open. Use buttons to zoom.</p>
      </div>
    );
  }

  return null;
};

const ArchiveDetailPage: React.FC<ArchiveDetailPageProps> = ({ item, onClose }) => {
  const BASE_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.25;
  const BASE_IMAGE_MAX_WIDTH = 900;
  const BASE_IMAGE_MAX_HEIGHT = 'calc(100vh - 120px)';
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(BASE_ZOOM);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);

  const mediaItems: MediaItem[] =
    item.type !== 'text'
      ? [
          ...(item.url ? [{ type: item.type, url: item.url }] : []),
          ...((item.media || []) as MediaItem[]),
        ]
      : [];

  const hasMultipleMedia = mediaItems.length > 1;
  const currentMedia = mediaItems[currentMediaIndex] || null;

  const closeZoom = () => {
    setZoomedImage(null);
    setZoomLevel(BASE_ZOOM);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  };

  const handleZoomOut = () => {
    if (zoomLevel <= BASE_ZOOM) {
      closeZoom();
      return;
    }

    setZoomLevel((prev) => Math.max(BASE_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
  };

  const moveToMedia = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= mediaItems.length || nextIndex === currentMediaIndex) {
      return;
    }

    setSlideDirection(nextIndex > currentMediaIndex ? 1 : -1);
    setCurrentMediaIndex(nextIndex);
  };

  const showPreviousMedia = () => moveToMedia(currentMediaIndex - 1);
  const showNextMedia = () => moveToMedia(currentMediaIndex + 1);

  useEffect(() => {
    setCurrentMediaIndex(0);
    setSlideDirection(1);
  }, [item.id, item.url, item.media]);

  useEffect(() => {
    if (!currentMedia || currentMedia.type !== 'image') {
      return;
    }

    preloadImage(currentMedia.url);

    const previousMedia = mediaItems[currentMediaIndex - 1];
    if (previousMedia?.type === 'image') {
      preloadImage(previousMedia.url);
    }

    const nextMedia = mediaItems[currentMediaIndex + 1];
    if (nextMedia?.type === 'image') {
      preloadImage(nextMedia.url);
    }
  }, [currentMedia, currentMediaIndex, mediaItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImage) {
          closeZoom();
          return;
        }

        onClose();
        return;
      }

      if (zoomedImage || !hasMultipleMedia) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        showPreviousMedia();
      }

      if (e.key === 'ArrowRight') {
        showNextMedia();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleMedia, onClose, showNextMedia, showPreviousMedia, zoomedImage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-start justify-center px-4 py-12 md:px-8">
        <article
          className="mx-auto w-full max-w-6xl"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex items-center gap-4 text-sm text-white/60"
            >
              <span className="font-mono">{item.year}</span>
              {item.tags?.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-2">
                    {item.tags.map((tag, index) => (
                      <span key={index} style={getContentFont(tag)}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </header>

          {mediaItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              {hasMultipleMedia && currentMedia ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 text-xs text-white/60">
                    <p>Swipe or use arrows to browse</p>
                    <p className="font-mono">
                      {currentMediaIndex + 1} / {mediaItems.length}
                    </p>
                  </div>

                  <div
                    className="relative overflow-hidden"
                    onTouchStart={(e) => {
                      touchStartX.current = e.touches[0]?.clientX ?? null;
                    }}
                    onTouchEnd={(e) => {
                      const startX = touchStartX.current;
                      const endX = e.changedTouches[0]?.clientX ?? null;
                      touchStartX.current = null;

                      if (startX === null || endX === null) {
                        return;
                      }

                      const distance = endX - startX;

                      if (distance <= -50) {
                        showNextMedia();
                      }

                      if (distance >= 50) {
                        showPreviousMedia();
                      }
                    }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${currentMediaIndex}-${currentMedia.url}`}
                        initial={{ opacity: 0, x: slideDirection * 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: slideDirection * -80 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                      >
                        <MediaRenderer
                          type={currentMedia.type}
                          url={currentMedia.url}
                          title={item.title}
                          onOpenImage={(src, title) => {
                            setZoomedImage({ src, title });
                            setZoomLevel(BASE_ZOOM);
                          }}
                        />
                      </motion.div>
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={showPreviousMedia}
                      disabled={currentMediaIndex === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Previous media"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={showNextMedia}
                      disabled={currentMediaIndex === mediaItems.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Next media"
                    >
                      →
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {mediaItems.map((media, index) => (
                      <button
                        key={`${media.url}-${index}`}
                        type="button"
                        onClick={() => moveToMedia(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === currentMediaIndex
                            ? 'w-8 bg-white'
                            : 'w-2.5 bg-white/25 hover:bg-white/45'
                        }`}
                        aria-label={`Go to media ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                mediaItems.map((media, index) => (
                  <MediaRenderer
                    key={`${media.url}-${index}`}
                    type={media.type}
                    url={media.url}
                    title={item.title}
                    onOpenImage={(src, title) => {
                      setZoomedImage({ src, title });
                      setZoomLevel(BASE_ZOOM);
                    }}
                  />
                ))
              )}
            </motion.div>
          )}

          {item.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="prose prose-invert prose-sm md:prose-base mb-12 max-w-none"
            >
              <p
                className="whitespace-pre-wrap text-white/90 leading-relaxed"
                style={{ ...getContentFont(item.description), fontSize: '15px', lineHeight: '1.8' }}
              >
                {item.description}
              </p>
            </motion.div>
          )}

          {item.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="prose prose-invert prose-sm md:prose-base mb-12 max-w-none"
            >
              <div
                className="whitespace-pre-wrap text-white/80 leading-relaxed"
                style={{ ...getContentFont(item.content), fontSize: '14px', lineHeight: '1.8' }}
              >
                {item.content}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="border-t border-white/10 pt-12"
          >
            <button
              onClick={onClose}
              className="text-sm font-mono text-white/60 transition-colors hover:text-white"
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
            <div className="flex h-full flex-col">
              <div
                className="flex items-center justify-between border-b border-white/10 px-4 py-3"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="truncate pr-4 text-xs text-white/70">{zoomedImage.title}</p>
                <div className="flex items-center gap-2">
                  <span className="min-w-14 text-center text-xs font-mono text-white/70">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(BASE_ZOOM)}
                    className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= MAX_ZOOM}
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

              <div className="flex-1 overflow-auto">
                <div
                  className={`flex min-h-full min-w-full p-4 md:p-8 ${
                    zoomLevel > BASE_ZOOM ? 'items-start justify-start' : 'items-center justify-center'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={zoomedImage.src}
                    alt={zoomedImage.title}
                    className="h-auto max-w-none rounded-sm object-contain"
                    decoding="async"
                    style={{
                      width: zoomLevel === BASE_ZOOM ? 'auto' : `${zoomLevel * 100}%`,
                      maxWidth: zoomLevel === BASE_ZOOM ? `${BASE_IMAGE_MAX_WIDTH}px` : 'none',
                      maxHeight: zoomLevel === BASE_ZOOM ? BASE_IMAGE_MAX_HEIGHT : 'none',
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
