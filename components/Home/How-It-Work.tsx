"use client";

import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

interface FeatureStep {
  id: number;
  number: string;
  title: string;
  content: string;
  image: string;
}

const features: FeatureStep[] = [
  {
    id: 1,
    number: "01",
    title: "Select Your Specialist",
    content:
      "Choose a verified expert dedicated to your specific legal, immigration, certified translation, or tax planning needs.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    number: "02",
    title: "Choose a Date & Time",
    content:
      "Pick a convenient time slot from our real-time calendar for a seamless virtual or in-person consultation session.",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    number: "03",
    title: "Seamless & Secure Checkout",
    content:
      "Confirm your booking with transparent, upfront pricing and encrypted, worry-free checkout authentication.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    number: "04",
    title: "Get Confirmed & Guided",
    content:
      "Receive instant confirmation with intake paperwork details and dedicated one-on-one preparation from our team.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
  },
];

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "relative mb-8 last:mb-0 transition-all duration-300 focus-within:relative focus-within:z-10",
      className
    )}
    {...props}
  >
    {children}
  </AccordionPrimitive.Item>
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex flex-1 items-center justify-between text-left font-sans text-lg lg:text-xl font-bold transition-all duration-200 outline-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down text-sm font-normal",
      className
    )}
    {...props}
  >
    <div className={className}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

interface HowItWorksProps {
  collapseDelay?: number;
  ltr?: boolean;
  linePosition?: "left" | "right";
}

export default function HowItWorks({
  collapseDelay = 5000,
  ltr = false,
  linePosition = "left",
}: HowItWorksProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const carouselRef = useRef<HTMLUListElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const isProgrammaticScroll = useRef<boolean>(false);
  const isUserTouching = useRef<boolean>(false);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

  // Initial trigger once in view
  useEffect(() => {
    if (isInView && activeIndex === -1) {
      setActiveIndex(0);
    }
  }, [isInView, activeIndex]);

  // Auto-advance slideshow timer (active on desktop and mobile)
  useEffect(() => {
    if (!isInView || activeIndex < 0) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, collapseDelay);

    return () => clearInterval(timer);
  }, [activeIndex, isInView, collapseDelay]);

  // Center active mobile card on activeIndex change
  useEffect(() => {
    if (carouselRef.current && activeIndex >= 0) {
      const cards = carouselRef.current.querySelectorAll<HTMLElement>(".card");
      const activeCard = cards[activeIndex];
      if (activeCard) {
        const cardRect = activeCard.getBoundingClientRect();
        const containerRect = carouselRef.current.getBoundingClientRect();
        const offset =
          cardRect.left -
          containerRect.left -
          (containerRect.width - cardRect.width) / 2;

        isProgrammaticScroll.current = true;
        carouselRef.current.scrollTo({
          left: carouselRef.current.scrollLeft + offset,
          behavior: "smooth",
        });

        const resetTimer = setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 600);
        return () => clearTimeout(resetTimer);
      }
    }
  }, [activeIndex]);

  // Sync manual user scroll on mobile with activeIndex
  const handleMobileScroll = useCallback(() => {
    if (isProgrammaticScroll.current || !isUserTouching.current) return;
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>(".card");
    if (!cards.length) return;
    const cardWidth = cards[0].clientWidth + 16;
    const newIndex = Math.min(
      Math.max(0, Math.round(el.scrollLeft / cardWidth)),
      features.length - 1
    );
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleMobileScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleMobileScroll);
  }, [handleMobileScroll]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative bg-background py-20 md:py-28 px-6 md:px-10 overflow-hidden border-b border-border/60"
    >
      {/* Decorative ambient lighting accents matching theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-14 md:mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-4">
            The Process
          </div>
          <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-navy-900 dark:text-ice-50 tracking-tight leading-[1.2] mb-4">
            How It <span className="text-gold-gradient">Works</span>
          </h2>
          <p className="text-navy-700/80 dark:text-ice-200/80 font-normal text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Simple, transparent, and guided every step of the way. Follow our
            streamlined process to get started with expert support today.
          </p>
        </div>

        {/* 5-Column Grid Layout (Magic UI Pro feature-1 structure) */}
        <div className="mx-auto grid h-full max-w-5xl grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left Column: Vertical Progress Accordion (Desktop) */}
          <div
            className={cn(
              "col-span-2 hidden md:flex",
              ltr ? "md:order-2 md:justify-end" : "justify-start"
            )}
          >
            <AccordionPrimitive.Root
              className="w-full max-w-[340px]"
              type="single"
              value={`item-${activeIndex}`}
              onValueChange={(val) => {
                if (val) {
                  const idx = Number(val.split("-")[1]);
                  if (!isNaN(idx)) setActiveIndex(idx);
                }
              }}
            >
              {features.map((feature, index) => {
                const isActive = activeIndex === index;
                return (
                  <AccordionItem
                    key={feature.id}
                    value={`item-${index}`}
                    className="relative mb-8 last:mb-0"
                  >
                    {/* Animated vertical progress line matching reference */}
                    <div
                      className={cn(
                        "absolute top-0 bottom-0 w-0.5 overflow-hidden rounded-full bg-neutral-300/50 dark:bg-neutral-300/25",
                        linePosition === "right"
                          ? "right-0 left-auto"
                          : "right-auto left-0"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0 left-0 w-full origin-top bg-gold-500 dark:bg-gold-400 transition-all ease-linear",
                          isActive ? "h-full" : "h-0"
                        )}
                        style={{
                          transitionDuration: isActive
                            ? `${collapseDelay}ms`
                            : "0s",
                        }}
                      />
                    </div>

                    <AccordionTrigger
                      className={cn(
                        "text-lg lg:text-xl font-sans font-bold transition-colors pl-7 pr-2 py-1",
                        isActive
                          ? "text-navy-900 dark:text-ice-50"
                          : "text-navy-900/50 dark:text-ice-50/50 hover:text-navy-900 dark:hover:text-ice-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold tracking-wider text-gold-500/80">
                          {feature.number}
                        </span>
                        <span>{feature.title}</span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pl-7 pr-2 pt-3 pb-1 text-navy-700/80 dark:text-ice-200/80 leading-relaxed font-normal text-sm sm:text-base">
                      {feature.content}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </AccordionPrimitive.Root>
          </div>

          {/* Right Column: Dynamic Media Frame with Animated Transition */}
          <div
            className={cn(
              "col-span-5 h-[280px] sm:h-[360px] md:h-[430px] w-full md:col-span-3",
              ltr && "md:order-1"
            )}
          >
            <div className="relative h-full w-full rounded-3xl border border-border/80 dark:border-gold-500/25 bg-card/90 dark:bg-navy-950/80 p-2 shadow-luxury overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative h-full w-full rounded-2xl overflow-hidden"
                >
                  <img
                    src={features[activeIndex]?.image}
                    alt={features[activeIndex]?.title || "How It Works Step"}
                    className="h-full w-full object-cover object-top rounded-2xl"
                  />

                  {/* Gradient shadow overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent pointer-events-none" />

                  {/* Overlay badge with step details */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-navy-950/80 backdrop-blur-md border border-gold-500/35 text-gold-400 text-xs font-mono font-semibold tracking-wider shadow-luxury-sm">
                      <span className="text-ice-100 font-sans font-medium text-xs sm:text-sm">
                        {features[activeIndex]?.title}
                      </span>
                    </span>

                    <span className="hidden sm:inline-flex items-center text-xs text-ice-200/90 bg-navy-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-mono">
                      {activeIndex + 1} / {features.length}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Horizontal Snap List (Under Image on Mobile) */}
          <ul
            ref={carouselRef}
            onTouchStart={() => {
              isUserTouching.current = true;
            }}
            onTouchEnd={() => {
              setTimeout(() => {
                isUserTouching.current = false;
              }, 400);
            }}
            onPointerDown={() => {
              isUserTouching.current = true;
            }}
            onPointerUp={() => {
              setTimeout(() => {
                isUserTouching.current = false;
              }, 400);
            }}
            className="col-span-5 flex h-full snap-x snap-mandatory flex-nowrap overflow-x-auto gap-4 py-4 px-1 [mask-image:linear-gradient(90deg,transparent,black_5%,white_95%,transparent)] [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_5%,white_95%,transparent)] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          >
            {features.map((feature, index) => {
              const isActive = activeIndex === index;
              return (
                <li
                  key={feature.id}
                  className={cn(
                    "card relative w-[280px] sm:w-[320px] shrink-0 snap-center rounded-2xl border py-5 pl-7 pr-5 transition-all duration-300 cursor-pointer list-none overflow-hidden",
                    isActive
                      ? "border-gold-500/60 bg-card shadow-luxury-sm"
                      : "border-border/70 bg-card/60 dark:bg-card/25 opacity-70 hover:opacity-100"
                  )}
                  onClick={() => setActiveIndex(index)}
                  style={{ scrollSnapAlign: "center" }}
                >
                  {/* Animated vertical progress line matching desktop layout */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 overflow-hidden rounded-l-2xl bg-neutral-300/40 dark:bg-neutral-800">
                    <div
                      className={cn(
                        "absolute top-0 left-0 w-full origin-top bg-gold-500 dark:bg-gold-400 transition-all ease-linear",
                        isActive ? "h-full" : "h-0"
                      )}
                      style={{
                        transitionDuration: isActive
                          ? `${collapseDelay}ms`
                          : "0s",
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="font-mono text-xs font-bold text-gold-500">
                      {feature.number}
                    </span>
                    <h3
                      className={cn(
                        "font-sans font-bold text-base transition-colors",
                        isActive
                          ? "text-gold-600 dark:text-gold-400"
                          : "text-navy-900 dark:text-ice-50"
                      )}
                    >
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-navy-700/80 dark:text-ice-200/80 leading-relaxed font-normal">
                    {feature.content}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
