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

interface Point {
  x: number;
  y: number;
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
  const BASE_IMAGE_MAX_HEIGHT = 'calc(100vh - 120px)';
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(BASE_ZOOM);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 900
  );
  const [zoomOffset, setZoomOffset] = useState<Point>({ x: 0, y: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
  const [isDraggingZoomedImage, setIsDraggingZoomedImage] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const zoomDragStart = useRef<{
    pointerId: number;
    origin: Point;
    initialOffset: Point;
  } | null>(null);
  const pinchState = useRef<{
    initialDistance: number;
    initialZoom: number;
    initialOffset: Point;
  } | null>(null);

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
    setZoomOffset({ x: 0, y: 0 });
  };

  const getFittedImageSize = (zoom = zoomLevel) => {
    const maxWidth = Math.max(280, Math.min(900, viewportWidth - 64));
    const maxHeight = Math.max(240, viewportHeight - 120);
    const widthRatio = maxWidth / imageNaturalSize.width;
    const heightRatio = maxHeight / imageNaturalSize.height;
    const fittedScale = Math.min(widthRatio, heightRatio, 1);
    const baseWidth = imageNaturalSize.width * fittedScale;
    const baseHeight = imageNaturalSize.height * fittedScale;

    return {
      width: baseWidth * zoom,
      height: baseHeight * zoom,
      baseWidth,
      baseHeight,
    };
  };

  const clampOffset = (offset: Point, zoom = zoomLevel) => {
    const { width, height } = getFittedImageSize(zoom);
    const horizontalLimit = Math.max(0, (width - viewportWidth) / 2);
    const verticalLimit = Math.max(0, (height - viewportHeight) / 2);

    return {
      x: Math.min(horizontalLimit, Math.max(-horizontalLimit, offset.x)),
      y: Math.min(verticalLimit, Math.max(-verticalLimit, offset.y)),
    };
  };

  const updateZoom = (nextZoom: number, nextOffset?: Point) => {
    const normalizedZoom = Math.max(BASE_ZOOM, Math.min(MAX_ZOOM, Number(nextZoom.toFixed(2))));
    setZoomLevel(normalizedZoom);

    if (normalizedZoom <= BASE_ZOOM) {
      setZoomOffset({ x: 0, y: 0 });
      return;
    }

    setZoomOffset((prev) => clampOffset(nextOffset ?? prev, normalizedZoom));
  };

  const handleZoomIn = () => {
    updateZoom(zoomLevel + ZOOM_STEP);
  };

  const handleZoomOut = () => {
    const nextZoom = zoomLevel - ZOOM_STEP;

    if (nextZoom < BASE_ZOOM) {
      closeZoom();
      return;
    }

    updateZoom(nextZoom);
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

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      setZoomOffset((prev) => clampOffset(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageNaturalSize.height, imageNaturalSize.width, zoomLevel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/35 backdrop-blur-[14px]"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.55))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55),transparent_16%,transparent_84%,rgba(0,0,0,0.55))]" />

      <div className="relative flex min-h-screen items-start justify-center px-4 py-10 md:px-8 md:py-12">
        <article
          className="mx-auto w-full max-w-6xl rounded-[28px] border border-white/10 bg-black/72 px-5 py-5 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-md md:px-8 md:py-8"
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
              <div className="relative flex-1 overflow-auto">
                <div
                  className="absolute inset-x-0 top-6 z-20 flex justify-center px-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/72 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="rounded border border-white/15 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/10"
                    >
                      -
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

                <div
                  className={`relative flex min-h-full min-w-full overflow-hidden px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8 ${
                    zoomLevel > BASE_ZOOM ? 'cursor-grab items-center justify-center active:cursor-grabbing' : 'items-center justify-center'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => {
                    e.preventDefault();

                    if (e.deltaY < 0) {
                      updateZoom(zoomLevel + ZOOM_STEP);
                      return;
                    }

                    const nextZoom = zoomLevel - ZOOM_STEP;
                    if (nextZoom < BASE_ZOOM) {
                      closeZoom();
                      return;
                    }

                    updateZoom(nextZoom);
                  }}
                  onPointerDown={(e) => {
                    if (zoomLevel <= BASE_ZOOM) {
                      return;
                    }

                    zoomDragStart.current = {
                      pointerId: e.pointerId,
                      origin: { x: e.clientX, y: e.clientY },
                      initialOffset: zoomOffset,
                    };
                    setIsDraggingZoomedImage(true);
                  }}
                  onPointerMove={(e) => {
                    const dragState = zoomDragStart.current;
                    if (!dragState || dragState.pointerId !== e.pointerId || zoomLevel <= BASE_ZOOM) {
                      return;
                    }

                    setZoomOffset(
                      clampOffset({
                        x: dragState.initialOffset.x + (e.clientX - dragState.origin.x),
                        y: dragState.initialOffset.y + (e.clientY - dragState.origin.y),
                      })
                    );
                  }}
                  onPointerUp={(e) => {
                    if (zoomDragStart.current?.pointerId === e.pointerId) {
                      zoomDragStart.current = null;
                      setIsDraggingZoomedImage(false);
                    }
                  }}
                  onPointerCancel={(e) => {
                    if (zoomDragStart.current?.pointerId === e.pointerId) {
                      zoomDragStart.current = null;
                      setIsDraggingZoomedImage(false);
                    }
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length !== 2) {
                      pinchState.current = null;
                      return;
                    }

                    const [firstTouch, secondTouch] = Array.from(e.touches);
                    const distance = Math.hypot(
                      secondTouch.clientX - firstTouch.clientX,
                      secondTouch.clientY - firstTouch.clientY
                    );

                    pinchState.current = {
                      initialDistance: distance,
                      initialZoom: zoomLevel,
                      initialOffset: zoomOffset,
                    };
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length !== 2 || !pinchState.current) {
                      return;
                    }

                    e.preventDefault();
                    const [firstTouch, secondTouch] = Array.from(e.touches);
                    const distance = Math.hypot(
                      secondTouch.clientX - firstTouch.clientX,
                      secondTouch.clientY - firstTouch.clientY
                    );

                    const nextZoom = pinchState.current.initialZoom * (distance / pinchState.current.initialDistance);
                    updateZoom(nextZoom, pinchState.current.initialOffset);
                  }}
                  onTouchEnd={() => {
                    if (pinchState.current && zoomLevel <= BASE_ZOOM) {
                      setZoomOffset({ x: 0, y: 0 });
                    }

                    if (pinchState.current) {
                      pinchState.current = null;
                    }
                  }}
                >
                  <img
                    src={zoomedImage.src}
                    alt={zoomedImage.title}
                    className="h-auto max-w-none rounded-sm object-contain"
                    decoding="async"
                    onLoad={(e) => {
                      setImageNaturalSize({
                        width: e.currentTarget.naturalWidth || 1,
                        height: e.currentTarget.naturalHeight || 1,
                      });
                    }}
                    onDoubleClick={() => {
                      if (zoomLevel > BASE_ZOOM) {
                        updateZoom(BASE_ZOOM);
                        return;
                      }

                      updateZoom(2);
                    }}
                    style={{
                      width: `${Math.round(getFittedImageSize().baseWidth)}px`,
                      maxHeight: BASE_IMAGE_MAX_HEIGHT,
                      transform: `translate(${zoomOffset.x}px, ${zoomOffset.y}px) scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      transition: isDraggingZoomedImage ? 'none' : 'transform 0.18s ease-out',
                      touchAction: 'none',
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
