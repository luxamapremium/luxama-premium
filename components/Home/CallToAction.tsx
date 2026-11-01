
"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  const scrollToHero = () => {
    const heroSection = document.getElementById("hero");

    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full bg-navy-gradient text-ice-50 border-t border-navy-800 px-6 py-16 md:py-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-10">

        {/* Content */}
        <div className="max-w-2xl">
          <span className="text-gold-400 font-semibold tracking-[0.2em] uppercase text-xs sm:text-sm block mb-4">
            Start Your Journey
          </span>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            <span className="text-ice-50 font-light">
              Ready to navigate your legal and financial milestones with{" "}
            </span>
            <span className="text-gold-gradient">
              Luxama Premium Group?
            </span>
          </h2>

          <p className="text-sm sm:text-base text-ice-200/85 leading-relaxed max-w-xl">
            Join the clients who trust Luxama Premium Group for exceptional, confidential, and dedicated support.
          </p>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <Button
            variant="gold"
            size="xl"
            onClick={scrollToHero}
            className="group cursor-pointer rounded-2xl font-semibold uppercase text-xs tracking-wider px-7 py-6 flex items-center gap-3 transition-colors"
          >
            <span>Schedule a consultation</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>

      </div>
    </section>
  );
}
