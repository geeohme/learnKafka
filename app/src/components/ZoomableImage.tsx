import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export default function ZoomableImage({ src, alt, className, loading }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const scrollPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    scrollPositionRef.current = { x: window.scrollX, y: window.scrollY };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.requestAnimationFrame(() => {
        window.scrollTo(scrollPositionRef.current.x, scrollPositionRef.current.y);
      });
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
    }
  }, [isOpen]);

  const zoomOut = () => setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP));
  const zoomIn = () => setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="block w-full cursor-zoom-in rounded-2xl p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
      >
        <img src={src} alt={alt} className={className} loading={loading} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030306]/85 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={() => setIsOpen(false)}
          >
            <div
              className="flex h-[75vh] w-[75vw] flex-col overflow-hidden rounded-3xl border border-[#1a1a25] bg-[#0a0a0f] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-end gap-2 border-b border-[#1a1a25] bg-[#12121a]/95 p-3">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a25] text-[#c8c8d8] transition-colors hover:border-[#00f5ff]/40 hover:text-[#00f5ff] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a25] text-[#c8c8d8] transition-colors hover:border-[#ffaa00]/40 hover:text-[#ffaa00]"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a25] text-[#c8c8d8] transition-colors hover:border-[#00f5ff]/40 hover:text-[#00f5ff] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a25] text-[#c8c8d8] transition-colors hover:border-[#ff00aa]/40 hover:text-[#ff00aa]"
                  aria-label="Close image"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-[#050509] p-4">
                <div className="flex min-h-full min-w-full items-start justify-center">
                  <img
                    src={src}
                    alt={alt}
                    className="block max-w-none rounded-2xl border border-[#1a1a25]"
                    style={{
                      width: `${zoom * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
