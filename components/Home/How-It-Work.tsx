"use client";

import React, { useState, MouseEvent, TouchEvent } from "react";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  CreditCard,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Select an expert",
    description: "Select the expert who will guide you through the process.",
    icon: <UserCheck />,
  },
  {
    number: "02",
    title: "Choose a time",
    description:
      "Select a convenient slot from our real-time calendar for your expert consultation.",
    icon: <CalendarClock />,
  },
  {
    number: "03",
    title: "Make payment",
    description:
      "Finalize your booking with our transparent, secure, and straightforward checkout.",
    icon: <CreditCard />,
  },
  {
    number: "04",
    title: "Receive confirmation",
    description:
      " You'll receive a confirmation email once your booking is complete.",
    icon: <CheckCircle2 />,
  },
];

export default function HowItWorks() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Desktop Mouse Handler
  const handleMouseMove = (e: MouseEvent) => {
    setIsVisible(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Mobile Touch Handler
  const handleTouchMove = (e: TouchEvent) => {
    setIsVisible(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    setMousePos({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  return (
    <section
      className="relative bg-background py-20 md:py-32 px-6 overflow-hidden border-b border-border/60"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={() => setIsVisible(false)}
      onTouchEnd={() => setIsVisible(false)}
    >
      {/* Dynamic Background Glow - luxury warm gold */}
      <div
        className="pointer-events-none absolute transition-opacity duration-500 z-0"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(200, 162, 74, 0.12) 0%, transparent 70%)",
          left: `${mousePos.x - 300}px`,
          top: `${mousePos.y - 300}px`,
          opacity: isVisible ? 1 : 0,
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:items-start relative z-10">
        {/* Left Side: Sticky Header */}
        <div className="lg:w-1/3 lg:sticky lg:top-32">
          <span className="text-gold-600 dark:text-gold-400 font-bold uppercase tracking-[0.25em] text-xs mb-3 block animate-in fade-in slide-in-from-left-4 duration-700">
            The Process
          </span>
          <h2 className="font-serif font-bold text-navy-900 dark:text-ice-50 text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.15] mb-6 animate-in fade-in slide-in-from-left-6 duration-1000">
            How It <span className="text-gold-gradient">Works</span>
          </h2>
          <p className="text-navy-700/80 dark:text-ice-200/80 font-normal text-base sm:text-lg leading-relaxed max-w-sm animate-in fade-in slide-in-from-left-8 duration-1000">
            Simple steps to expert support. Follow our streamlined process to
            get started with your professional services today.
          </p>
        </div>

        {/* Right Side: Animated Cards */}
        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              style={{ animationDelay: `${index * 150}ms` }}
              className={cn(
                "group relative flex flex-col p-8 sm:p-10 rounded-3xl border border-border/80 bg-card text-card-foreground shadow-luxury-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "hover:shadow-luxury hover:border-gold-500/40 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10 fill-mode-both"
              )}
            >
              {/* Top Row: Number and Icon */}
              <div className="flex items-center justify-between mb-8">
                <span className="font-serif text-5xl font-bold text-gold-500/30 transition-colors duration-500 group-hover:text-gold-500/60 select-none">
                  {step.number}
                </span>
                <div className="h-14 w-14 rounded-2xl bg-navy-900 text-gold-400 dark:bg-navy-800 flex items-center justify-center shadow-luxury-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-gold-gradient group-hover:text-navy-950 group-hover:rotate-6">
                  {React.cloneElement(step.icon, {
                    className:
                      "w-6 h-6 text-inherit transition-colors duration-300",
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-navy-900 dark:text-ice-50 transition-colors duration-300 group-hover:text-gold-600 dark:group-hover:text-gold-400">
                  {step.title}
                </h3>
                <p className="mt-4 text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base leading-relaxed font-normal transition-colors duration-300">
                  {step.description}
                </p>
              </div>

              {/* Interactive Decoration */}
              <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-[0.25em]">
                    Next Step
                  </span>
                  <div className="w-8 h-[1.5px] bg-gold-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
