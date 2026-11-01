"use client";

import {
  ShieldCheck,
  FileCheck2,
  Layers,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

export default function WhyChooseUs() {
  const scrollToHero = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="features"
      className="relative block px-6 py-20 md:py-28 md:px-10 border-b border-border/60 overflow-hidden bg-background"
    >
      {/* Subtle decorative background glow accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl z-10">
        {/* Header Section matching screenshot layout */}
        <div className="mb-12 max-w-3xl">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-5">
            Why Choose Us
          </div>
          <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-navy-900 dark:text-ice-50 tracking-tight leading-[1.2]">
            Why <span className="text-gold-gradient">Luxama Premium Group</span> is The Right Choice for You
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Expert Specialists */}
            <div className="group rounded-3xl border border-border/80 bg-card/90 dark:bg-card/40 p-7 sm:p-8 shadow hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-start">
              <div className="w-12 h-12 rounded-full border border-border/80 dark:border-navy-700/80 bg-background/80 dark:bg-navy-900/60 flex items-center justify-center text-navy-900 dark:text-gold-400 mb-6 shadow-xs group-hover:scale-110 group-hover:border-gold-500/50 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-all">
                <ShieldCheck className="w-5 h-5 text-inherit" />
              </div>
              <h3 className="text-xl sm:text-2xl font-sans font-bold text-navy-900 dark:text-ice-50 mb-3 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                Expert Specialists
              </h3>
              <p className="text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base leading-relaxed font-normal">
                Work directly with seasoned professionals in immigration processing, notary legalization, and tax planning. We bring verified expertise and rigorous attention to detail to every case.
              </p>
            </div>

            {/* Card 2: Certified & Compliant */}
            <div className="group rounded-3xl border border-border/80 bg-card/90 dark:bg-card/40 p-7 sm:p-8 shadow hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-start">
              <div className="w-12 h-12 rounded-full border border-border/80 dark:border-navy-700/80 bg-background/80 dark:bg-navy-900/60 flex items-center justify-center text-navy-900 dark:text-gold-400 mb-6 shadow-xs group-hover:scale-110 group-hover:border-gold-500/50 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-all">
                <FileCheck2 className="w-5 h-5 text-inherit" />
              </div>
              <h3 className="text-xl sm:text-2xl font-sans font-bold text-navy-900 dark:text-ice-50 mb-3 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                Certified & Compliant
              </h3>
              <p className="text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base leading-relaxed font-normal">
                Ensure seamless acceptance by authorities with certified translations, USCIS-compliant filings, and state-authorized notary authentication recognized by institutions nationwide.
              </p>
            </div>

            {/* Card 3: Wide Card (spanning 2 columns on md+) */}
            <div className="group md:col-span-2 rounded-3xl border border-border/80 bg-card/90 dark:bg-card/40 p-7 sm:p-8 shadow hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-start">
              <div className="w-12 h-12 rounded-full border border-border/80 dark:border-navy-700/80 bg-background/80 dark:bg-navy-900/60 flex items-center justify-center text-navy-900 dark:text-gold-400 mb-6 shadow-xs group-hover:scale-110 group-hover:border-gold-500/50 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-all">
                <Layers className="w-5 h-5 text-inherit" />
              </div>
              <h3 className="text-xl sm:text-2xl font-sans font-bold text-navy-900 dark:text-ice-50 mb-3 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                Comprehensive Legal & Administrative Solutions
              </h3>
              <p className="text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base leading-relaxed font-normal">
                From personal tax returns and business administrative support to certified translations and complex immigration paperwork, Luxama Premium Group provides an all-in-one suite of professional services. Our unified approach eliminates stress, prevents costly filing errors, and accelerates your milestones.
              </p>
            </div>
          </div>

          {/* Right Section (1 Column): Tall Featured Card */}
          <div className="lg:col-span-1 flex">
            <div className="group rounded-3xl border border-navy-800 dark:border-gold-500/20 bg-navy-900 dark:bg-navy-950 p-7 sm:p-9 shadow hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden w-full text-ice-50">
              {/* Subtle top ambient lighting inside card */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold-500/10 blur-[60px] pointer-events-none rounded-full" />

              <div>
                <div className="w-12 h-12 rounded-full border border-ice-100/20 dark:border-gold-500/30 bg-white/5 flex items-center justify-center text-gold-400 mb-6 shadow-xs group-hover:scale-110 group-hover:border-gold-400/60 transition-all">
                  <CalendarClock className="w-5 h-5 text-inherit" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-sans font-bold text-ice-50 mb-5 leading-snug group-hover:text-gold-300 transition-colors">
                  Flexible Consultation Schedules
                </h3>

                <p className="text-ice-200/85 text-sm sm:text-base leading-relaxed mb-4 font-normal">
                  At Luxama Premium Group, we understand the importance of balancing important legal and financial deadlines with a demanding lifestyle. That’s why our professional consultations are available on-demand, in-person, or virtually—allowing you to move forward at your own pace.
                </p>

                <p className="text-ice-200/75 text-sm sm:text-base leading-relaxed font-normal">
                  Whether you are an individual managing time-sensitive filings or a growing business planning your next milestone, we customize our schedule and support to fit your needs.
                </p>
              </div>

              {/* Bottom Call to Action Button */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={scrollToHero}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 cursor-pointer active:scale-[0.98] group/btn"
                >
                  <span>Schedule Consultation</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
