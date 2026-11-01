'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

export interface DepthCarouselItem {
  image: string;
  alt?: string;
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface DepthCarouselProps<T extends DepthCarouselItem = DepthCarouselItem> {
  items?: T[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'left' | 'right';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: T) => void;
  className?: string;
  renderItem?: (item: T, index: number, isActive: boolean) => React.ReactNode;
}

interface DragState {
  x: number;
  startPos: number;
  lastX: number;
  lastT: number;
  v: number;
  moved: boolean;
  id: number;
}

interface CarouselConfig {
  count: number;
  depth: number;
  spread: number;
  tilt: number;
  tiltDirection: 'left' | 'right';
  visibleCards: number;
  falloff: number;
  blur: number;
  duration: number;
  ease: string;
  loop: boolean;
  cardWidth: number;
  autoplayDelay: number;
}

const DEFAULT_ITEMS: DepthCarouselItem[] = [
  { image: 'https://picsum.photos/seed/depth1/800/1000', alt: 'Slide 1' },
  { image: 'https://picsum.photos/seed/depth2/800/1000', alt: 'Slide 2' },
  { image: 'https://picsum.photos/seed/depth3/800/1000', alt: 'Slide 3' },
  { image: 'https://picsum.photos/seed/depth4/800/1000', alt: 'Slide 4' },
  { image: 'https://picsum.photos/seed/depth5/800/1000', alt: 'Slide 5' },
  { image: 'https://picsum.photos/seed/depth6/800/1000', alt: 'Slide 6' }
];

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);

const normalizeItem = <T extends DepthCarouselItem>(it: T | string): T =>
  typeof it === 'string' ? ({ image: it, alt: '' } as unknown as T) : it;

export default function DepthCarousel<T extends DepthCarouselItem = DepthCarouselItem>({
  items = DEFAULT_ITEMS as T[],
  cardWidth = 300,
  cardHeight = 380,
  radius = 18,
  tint = '#05060a',
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = 'power3.out',
  autoplay = false,
  autoplayDelay = 3200,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  className = '',
  renderItem
}: DepthCarouselProps<T>): React.ReactElement {
  const data = useMemo(
    () => (Array.isArray(items) ? items : []).map((it) => normalizeItem<T>(it)),
    [items]
  );
  const count = data.length;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const posRef = useRef<number>(0);
  const focusRef = useRef<number>(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const scaleRef = useRef<number>(1);
  const cfgRef = useRef<CarouselConfig>({
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
    autoplayDelay
  });
  const onChangeRef = useRef<((index: number, item: T) => void) | undefined>(onChange);

  const dragRef = useRef<DragState | null>(null);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const reducedRef = useRef<boolean>(false);

  const [active, setActive] = useState<number>(0);

  onChangeRef.current = onChange;
  cfgRef.current = {
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
    autoplayDelay
  };

  const layout = useCallback((pos: number) => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const dir = cfg.tiltDirection === 'left' ? -1 : 1;
    const sc = scaleRef.current;

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= cfg.visibleCards + 0.5;

      const tz = -cfg.depth * d;
      const tx = dir * cfg.spread * d;
      const ry = dir * cfg.tilt * clamp(d, 0, 1);

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;

      const brightness = Math.max(0.15, 1 - back * cfg.falloff);
      // Zero out blur for the leading/active card; apply blur only when cards push back into the depth stack (back > 0.4)
      const blurPx = cfg.blur > 0 && back > 0.4 ? Math.min(cfg.blur, ((back - 0.4) / Math.max(0.6, cfg.visibleCards - 0.4)) * cfg.blur) : 0;
      const zi = Math.round(2000 - d * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      // Apply blur exclusively to the background photo so button & text are never blurred
      const img = imgRefs.current[i];
      if (img) {
        if (blurPx < 0.05 && brightness >= 0.98) {
          img.style.filter = 'none';
        } else {
          img.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
        }
      }

      const ov = overlayRefs.current[i];
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }, []);

  const notify = useCallback(
    (idx: number) => {
      setActive(idx);
      onChangeRef.current?.(idx, data[idx]);
    },
    [data]
  );

  const tweenTo = useCallback(
    (target: number, animate: boolean) => {
      tweenRef.current?.kill();
      const cfg = cfgRef.current;
      const proxy = { p: posRef.current };
      const dur = animate && !reducedRef.current ? cfg.duration / 1000 : 0;
      tweenRef.current = gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          posRef.current = proxy.p;
          layout(proxy.p);
        },
        onComplete: () => {
          const n = cfg.count;
          if (n > 0) posRef.current = ((posRef.current % n) + n) % n;
          layout(posRef.current);
        }
      });
    },
    [layout]
  );

  const setFocus = useCallback(
    (rawIndex: number, animate = true) => {
      const cfg = cfgRef.current;
      const n = cfg.count;
      if (!n) return;
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
      let delta = idx - posRef.current;
      if (cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n;
        if (delta > n / 2) delta -= n;
      }
      tweenTo(posRef.current + delta, animate);
      if (idx !== focusRef.current) {
        focusRef.current = idx;
        notify(idx);
      }
    },
    [tweenTo, notify]
  );

  const navigateBy = useCallback((step: number) => setFocus(focusRef.current + step, true), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      const cfg = cfgRef.current;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) + 20;
      const calcScale = clamp(w / needed, 0.4, 1);
      scaleRef.current = calcScale >= 0.96 ? 1 : calcScale;
      layout(posRef.current);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const cfg = cfgRef.current;
      if (cfg.count < 2) return;
      e.preventDefault();
      tweenRef.current?.kill();
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
      posRef.current += step;
      layout(posRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => setFocus(Math.round(posRef.current), true), 130);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [layout, setFocus]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const cfg = cfgRef.current;
    if (cfg.count < 2) return;
    tweenRef.current?.kill();
    dragRef.current = {
      x: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId
    };
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const cfg = cfgRef.current;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX;
      drag.lastT = now;
      posRef.current = drag.startPos - dx / stepPx;
      layout(posRef.current);
    },
    [layout]
  );

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const cfg = cfgRef.current;
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
    const projected = posRef.current - (drag.v * 180) / stepPx;
    setFocus(Math.round(projected), true);
  }, [setFocus]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateBy(1);
      }
    },
    [navigateBy]
  );

  const onCardClick = useCallback(
    (index: number) => {
      if (dragRef.current?.moved) return;
      setFocus(index, true);
    },
    [setFocus]
  );

  useEffect(() => {
    reducedRef.current = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!autoplay || reducedRef.current || count < 2) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const stop = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    };
    const start = () => {
      stop();
      autoTimerRef.current = window.setInterval(
        () => {
          if (!hovered && !focused) navigateBy(1);
        },
        Math.max(cfgRef.current.autoplayDelay, 600)
      );
    };
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = () => {
      focused = false;
    };
    root?.addEventListener('mouseenter', onEnter);
    root?.addEventListener('mouseleave', onLeave);
    root?.addEventListener('focusin', onFocusIn);
    root?.addEventListener('focusout', onFocusOut);
    start();
    return () => {
      stop();
      root?.removeEventListener('mouseenter', onEnter);
      root?.removeEventListener('mouseleave', onLeave);
      root?.removeEventListener('focusin', onFocusIn);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => {
    layout(posRef.current);
  }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count]);

  useEffect(
    () => () => {
      tweenRef.current?.kill();
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    },
    []
  );

  return (
    <div
      ref={rootRef}
      className={`relative w-full h-full min-h-[350px] flex items-center justify-center touch-pan-y outline-none select-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-gold-500 focus-visible:outline-offset-4 focus-visible:rounded-2xl ${className}`.trim()}
      style={{ perspective: `${perspective}px`, perspectiveOrigin: '50% 50%' }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Depth carousel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 [transform-style:preserve-3d]" style={{ transformStyle: 'preserve-3d' }} ref={stageRef}>
        {data.map((item, i) => (
          <div
            key={item.id ? `${item.id}-${i}` : i}
            className="absolute top-1/2 left-1/2 origin-center overflow-hidden bg-navy-900 border border-gold-500/25 shadow-[0_30px_60px_-20px_rgba(6,13,36,0.85),0_10px_25px_-10px_rgba(6,13,36,0.65),0_0_25px_-5px_rgba(200,162,74,0.15)] will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d] motion-reduce:will-change-auto cursor-pointer"
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            aria-roledescription="slide"
            aria-label={item.name ? `${item.name} (${i + 1} of ${count})` : `${i + 1} of ${count}`}
            aria-hidden={active !== i}
            onClick={() => onCardClick(i)}
          >
            <img
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              className="w-full h-full object-cover object-[center_top] block pointer-events-none select-none will-change-[filter] [backface-visibility:hidden]"
              src={item.image}
              alt={item.alt || item.name || ''}
              draggable={false}
            />
            <span
              className="absolute inset-0 opacity-0 pointer-events-none mix-blend-multiply z-5"
              ref={(el) => {
                overlayRefs.current[i] = el;
              }}
              style={{ background: tint }}
            />
            {renderItem ? (
              <div className="absolute inset-0 z-10 pointer-events-none [transform:translateZ(1px)] [backface-visibility:hidden]">
                {renderItem(item, i, active === i)}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 left-1 sm:left-4 md:left-[calc(50%-280px)] z-[3000] w-9 h-9 sm:w-11 sm:h-11 grid place-items-center border border-gold-500/35 rounded-full bg-navy-950/70 backdrop-blur-md text-ice-50 cursor-pointer transition-all duration-200 hover:bg-navy-900/95 hover:border-gold-400 hover:text-gold-400 hover:shadow-[0_0_20px_-3px_rgba(200,162,74,0.35)] active:-translate-y-1/2 active:scale-95 motion-reduce:transition-none"
            aria-label="Previous slide"
            onClick={() => navigateBy(-1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 right-1 sm:right-4 md:right-[calc(50%-280px)] z-[3000] w-9 h-9 sm:w-11 sm:h-11 grid place-items-center border border-gold-500/35 rounded-full bg-navy-950/70 backdrop-blur-md text-ice-50 cursor-pointer transition-all duration-200 hover:bg-navy-900/95 hover:border-gold-400 hover:text-gold-400 hover:shadow-[0_0_20px_-3px_rgba(200,162,74,0.35)] active:-translate-y-1/2 active:scale-95 motion-reduce:transition-none"
            aria-label="Next slide"
            onClick={() => navigateBy(1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[3000] flex gap-2 py-1.5 px-3.5 rounded-full bg-navy-950/60 backdrop-blur-md border border-gold-500/20"
          role="tablist"
          aria-label="Slides"
        >
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-[7px] p-0 border-0 rounded-full cursor-pointer transition-all duration-250 motion-reduce:transition-none ${
                active === i
                  ? 'w-[22px] bg-gold-500 shadow-[0_0_10px_rgba(200,162,74,0.5)]'
                  : 'w-[7px] bg-ice-200/35 hover:bg-gold-500/60'
              }`}
              onClick={() => setFocus(i, true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
