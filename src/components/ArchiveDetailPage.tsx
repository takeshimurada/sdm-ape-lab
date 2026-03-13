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
  zoomLevel?: number;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  imageWidth?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onImageLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}> = ({
  type,
  url,
  title,
  zoomLevel = 1,
  canZoomIn = false,
  canZoomOut = false,
  imageWidth,
  onZoomIn,
  onZoomOut,
  onImageLoad,
}) => {
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
        <div className="mb-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onZoomOut}
            disabled={!canZoomOut}
            className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            -
          </button>
          <span className="min-w-14 text-center text-xs font-mono text-white/60">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            disabled={!canZoomIn}
            className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>

        <div
          className="overflow-auto rounded-sm bg-black/35"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex min-w-full justify-center">
            <img
              src={normalizedUrl}
              alt={title}
              className="block h-auto max-w-none rounded-sm"
              loading="eager"
              decoding="async"
              onLoad={onImageLoad}
              style={{
                width: imageWidth ? `${Math.round(imageWidth)}px` : '100%',
                minWidth: imageWidth ? `${Math.round(imageWidth)}px` : '100%',
              }}
            />
          </div>
        </div>

        <p className="mt-2 text-right text-xs text-white/60">
          Use + / - buttons to zoom. Scroll to move when enlarged.
        </p>
      </div>
    );
  }

  return null;
};

const ArchiveDetailPage: React.FC<ArchiveDetailPageProps> = ({ item, onClose }) => {
  const BASE_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.25;
  const [zoomLevel, setZoomLevel] = useState(BASE_ZOOM);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 900
  );
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
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

  const getFittedImageSize = (zoom = zoomLevel) => {
    const maxWidth = Math.max(280, Math.min(900, viewportWidth - 64));
    const maxHeight = Math.max(240, viewportHeight - 220);

    if (imageNaturalSize.width <= 1 || imageNaturalSize.height <= 1) {
      return {
        width: maxWidth * zoom,
      };
    }

    const widthRatio = maxWidth / imageNaturalSize.width;
    const heightRatio = maxHeight / imageNaturalSize.height;
    const fittedScale = Math.min(widthRatio, heightRatio, 1);
    const baseWidth = imageNaturalSize.width * fittedScale;

    return {
      width: baseWidth * zoom,
    };
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  };

  const handleZoomOut = () => {
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
    setZoomLevel(BASE_ZOOM);
    setImageNaturalSize({ width: 1, height: 1 });
  }, [item.id, item.url, item.media]);

  useEffect(() => {
    setZoomLevel(BASE_ZOOM);
    setImageNaturalSize({ width: 1, height: 1 });
  }, [currentMediaIndex]);

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
        onClose();
        return;
      }

      if (!hasMultipleMedia) {
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
  }, [hasMultipleMedia, onClose, showNextMedia, showPreviousMedia]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const imageDisplayWidth = currentMedia?.type === 'image' ? getFittedImageSize().width : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/18 backdrop-blur-[18px]"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_44%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.38))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.28),transparent_14%,transparent_86%,rgba(0,0,0,0.28))]" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed right-4 top-24 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all hover:scale-[1.03] hover:bg-black/78 md:right-8 md:top-28 md:h-14 md:w-14"
        aria-label="Close archive detail"
      >
        <span aria-hidden="true" className="text-[28px] leading-none md:text-[32px]">
          ×
        </span>
      </button>

      <div className="relative flex min-h-screen items-start justify-center px-4 py-10 md:px-8 md:py-12">
        <article
          className="mx-auto w-full max-w-6xl rounded-[28px] bg-black/52 px-5 py-5 shadow-[0_30px_110px_rgba(0,0,0,0.34),0_0_0_1px_rgba(255,255,255,0.035)] backdrop-blur-xl md:px-8 md:py-8"
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
                    <p>
                      {zoomLevel > BASE_ZOOM && currentMedia.type === 'image'
                        ? 'Scroll to move the enlarged image'
                        : 'Swipe or use arrows to browse'}
                    </p>
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
                          zoomLevel={zoomLevel}
                          canZoomIn={currentMedia.type === 'image' && zoomLevel < MAX_ZOOM}
                          canZoomOut={currentMedia.type === 'image' && zoomLevel > BASE_ZOOM}
                          imageWidth={imageDisplayWidth}
                          onZoomIn={handleZoomIn}
                          onZoomOut={handleZoomOut}
                          onImageLoad={(e) => {
                            setImageNaturalSize({
                              width: e.currentTarget.naturalWidth || 1,
                              height: e.currentTarget.naturalHeight || 1,
                            });
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
                    zoomLevel={zoomLevel}
                    canZoomIn={media.type === 'image' && zoomLevel < MAX_ZOOM}
                    canZoomOut={media.type === 'image' && zoomLevel > BASE_ZOOM}
                    imageWidth={media.type === 'image' ? imageDisplayWidth : undefined}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onImageLoad={(e) => {
                      setImageNaturalSize({
                        width: e.currentTarget.naturalWidth || 1,
                        height: e.currentTarget.naturalHeight || 1,
                      });
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
    </motion.div>
  );
};

export default ArchiveDetailPage;
