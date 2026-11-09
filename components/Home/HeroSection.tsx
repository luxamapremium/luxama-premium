"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { CalendarDays } from "lucide-react";
import { getAdmins } from "@/app/actions/public/adminAction";
import TaxPreparersSkeleton from "@/components/TaxPreparersSkeleton";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";

const SPEED = 80; // px per second

type Admin = {
  _id: string;
  name: string;
  image: string;
};

export default function HeroSection() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const router = useRouter();

  const listRef = useRef<HTMLDivElement>(null);
  const listWidthRef = useRef(0);
  const isHovered = useRef(false);
  const x = useMotionValue(0);

  useEffect(() => {
    async function fetchAdmins() {
      const res = await getAdmins();
      if (res.success) {
        setAdmins(res.data as Admin[]);
        setIsReady(true);
      }
    }
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleSchedule = (id: string) => router.push(`events/admin/${id}`);

  // Base list of items
  const baseItems = useMemo(
    () =>
      admins.map((admin) => ({
        id: admin._id,
        name: admin.name,
        image: admin.image,
        alt: `Portrait of ${admin.name}`,
      })),
    [admins]
  );

  // Ensure enough items for an infinite loop with no empty spaces or jumps
  const carouselItems = useMemo(() => {
    if (baseItems.length === 0) return [];
    if (baseItems.length >= 8) return baseItems;
    const repeatCount = Math.ceil(8 / baseItems.length);
    return Array.from({ length: repeatCount }, () => baseItems).flat();
  }, [baseItems]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = el.offsetWidth;
      if (width > 0) {
        listWidthRef.current = width;
      }
    };

    updateWidth();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        if (width > 0) {
          listWidthRef.current = width;
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [carouselItems]);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || isHovered.current) return;
    const width = listWidthRef.current;
    if (width <= 0) return;

    const moveBy = (SPEED * delta) / 1000;
    const currentX = x.get();
    const nextX = -((-currentX + moveBy) % width);
    x.set(nextX);
  });

  if (isReady && admins.length === 0) return null;

  return (
    <section
      id="hero"
      className="relative w-full py-10 md:py-14 lg:py-20 px-4 sm:px-6 bg-navy-950 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-800 text-ice-50 overflow-hidden border-b border-navy-800"
      style={{ background: "linear-gradient(180deg, #060D24 0%, #0B1736 60%, #132450 100%)" }}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gold-500/10 blur-[140px] max-lg:blur-none max-lg:bg-transparent max-lg:bg-[radial-gradient(ellipse_at_center,rgba(200,162,74,0.07)_0%,rgba(200,162,74,0.035)_45%,transparent_75%)] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-navy-800/40 blur-[100px] max-lg:blur-none max-lg:bg-transparent max-lg:bg-[radial-gradient(closest-side,rgba(19,36,80,0.25),transparent)] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10 md:space-y-12">
        {/* Centered header */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-gold-400 font-semibold tracking-[0.25em] uppercase text-xs sm:text-sm block">
            Luxama Premium Group
          </span>
          <h1 className="font-sans text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ice-50">
            <span className="text-gold-gradient bg-gradient-to-r from-gold-600 via-gold-400 to-gold-500 bg-clip-text text-transparent">
              Discover
            </span>{" "}
            <span>our team.</span>
          </h1>
          <p className="text-ice-200/85 text-sm md:text-xl leading-relaxed font-sans">
            Meet our experienced professionals, dedicated to providing personalized guidance and expert support. Schedule a consultation with your choosen expert in this list.
          </p>
        </header>

        {/* Carousel Viewport (narrower than page, clips content on left & right edges) */}
        <div className="relative w-full max-w-[1340px] mx-auto">
          {!isReady ? (
            <TaxPreparersSkeleton />
          ) : (
            <div
              className="w-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
              onMouseEnter={() => {
                isHovered.current = true;
              }}
              onMouseLeave={() => {
                isHovered.current = false;
              }}
            >
              <motion.div
                className="flex -ml-6 sm:-ml-8 py-6 will-change-transform"
                style={{ x }}
              >
                {/* First list copy (measured with ref) */}
                <div ref={listRef} className="flex shrink-0">
                  {carouselItems.map((item, index) => (
                    <div
                      key={`list-1-${item.id}-${index}`}
                      className="pl-6 sm:pl-8 basis-auto shrink-0 select-none"
                    >
                      {/* Untouched black box card design */}
                      <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] overflow-hidden rounded-[20px] bg-navy-900 border border-gold-500/25 select-none shrink-0">
                        <img
                          className="w-full h-full object-cover object-[center_top] block pointer-events-none select-none"
                          src={item.image}
                          alt={item.alt || item.name || ""}
                          draggable={false}
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 pointer-events-none">
                          {/* Subtle bottom gradient overlay for text readability */}
                          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-950 via-navy-950/75 to-transparent pointer-events-none" />

                          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                            <h3
                              className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-ice-50 uppercase line-clamp-2 drop-shadow-sm max-w-full px-2"
                              title={item.name}
                            >
                              {item.name}
                            </h3>

                            <Button
                              variant="gold"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.id) handleSchedule(item.id);
                              }}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="pointer-events-auto w-full max-w-[240px] uppercase text-xs tracking-wider rounded-full py-5 font-semibold shadow-gold hover:shadow-gold-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <CalendarDays className="h-4 w-4 shrink-0" />
                              <span>Schedule Consultation</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Second list copy for seamless infinite loop */}
                <div aria-hidden="true" className="flex shrink-0">
                  {carouselItems.map((item, index) => (
                    <div
                      key={`list-2-${item.id}-${index}`}
                      className="pl-6 sm:pl-8 basis-auto shrink-0 select-none"
                    >
                      {/* Untouched black box card design */}
                      <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] overflow-hidden rounded-[20px] bg-navy-900 border border-gold-500/25 shadow-[0_30px_60px_-20px_rgba(6,13,36,0.85),0_10px_25px_-10px_rgba(6,13,36,0.65),0_0_25px_-5px_rgba(200,162,74,0.15)] select-none shrink-0">
                        <img
                          className="w-full h-full object-cover object-[center_top] block pointer-events-none select-none"
                          src={item.image}
                          alt={item.alt || item.name || ""}
                          draggable={false}
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 pointer-events-none">
                          {/* Subtle bottom gradient overlay for text readability */}
                          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-950 via-navy-950/75 to-transparent pointer-events-none" />

                          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                            <h3
                              className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-ice-50 uppercase line-clamp-2 drop-shadow-sm max-w-full px-2"
                              title={item.name}
                            >
                              {item.name}
                            </h3>

                            <Button
                              variant="gold"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.id) handleSchedule(item.id);
                              }}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="pointer-events-auto w-full max-w-[240px] uppercase text-xs tracking-wider rounded-full py-5 font-semibold shadow-gold hover:shadow-gold-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <CalendarDays className="h-4 w-4 shrink-0" />
                              <span>Schedule Consultation</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
