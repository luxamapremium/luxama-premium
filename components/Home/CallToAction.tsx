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
    <section className="relative w-full py-20 md:py-28 px-6 bg-navy-gradient text-ice-50 overflow-hidden border-t border-navy-800">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-56 bg-gold-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-72 h-72 bg-navy-800/50 blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="text-gold-400 font-semibold tracking-[0.25em] uppercase text-xs sm:text-sm block mb-4">
          Start Your Journey
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ice-50 mb-6 leading-[1.15]">
          <span className="text-xl sm:text-2xl md:text-3xl font-sans font-light text-ice-200 block mb-3">
            Ready to navigate your legal and financial milestones with
          </span>
          <span className="text-gold-gradient">Luxama Premium Group?</span>
        </h2>

        <p className="text-base sm:text-lg text-ice-200/85 font-normal max-w-xl mx-auto mb-10 leading-relaxed font-sans">
          Join the clients who trust Luxama Premium Group for exceptional, confidential, and dedicated support.
        </p>

        {/* High-End Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Button
            variant="gold"
            size="xl"
            onClick={scrollToHero}
            className="group rounded-full shadow-gold hover:shadow-gold-lg font-semibold uppercase text-xs tracking-wider px-9 py-6 flex items-center gap-3 transition-all"
          >
            <span>Schedule a consultation</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
