"use client";

import Link from "next/link";
import {
  XCircle,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Mail,
} from "lucide-react";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center border-b border-border/60">
      {/* Subtle decorative background glow accents matching Why-Choose-Us */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-4xl w-full text-center">
        {/* Warning/Cancel Icon */}
        <div className="mb-6 p-4 rounded-full bg-destructive/10 text-destructive border border-destructive/20 inline-flex items-center justify-center shadow-xs">
          <XCircle className="w-10 h-10" />
        </div>

        {/* Eyebrow badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-5">
          Request Cancelled
        </div>

        <h1 className="text-4xl md:text-6xl font-sans font-bold text-navy-900 dark:text-ice-50 tracking-tight leading-[1.2] mb-6">
          Changed your mind? <br />
          <span className="text-navy-700/60 dark:text-ice-200/60">That's okay.</span>
        </h1>

        <p className="max-w-xl text-base sm:text-lg text-navy-700/80 dark:text-ice-200/80 font-normal leading-relaxed mb-10">
          Your request for{" "}
          <span className="font-semibold text-navy-900 dark:text-gold-400">
            Luxama Premium Group
          </span>{" "}
          has been cancelled. No charges were made and no data was processed.
        </p>

        {/* Helpful Options Grid */}
        <div className="grid grid-cols-1 gap-4 w-full max-w-md mb-12">
          <div className="group rounded-3xl border border-border/80 bg-card/90 dark:bg-card/40 p-7 sm:p-8 shadow hover:shadow-md hover:border-gold-500/40 transition-all flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border border-border/80 dark:border-navy-700/80 bg-background/80 dark:bg-navy-900/60 flex items-center justify-center text-navy-900 dark:text-gold-400 mb-4 shadow-xs group-hover:scale-110 group-hover:border-gold-500/50 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-all">
              <MessageCircle className="w-5 h-5 text-inherit" />
            </div>
            <h3 className="text-xl font-sans font-bold text-navy-900 dark:text-ice-50 mb-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
              Need Help?
            </h3>
            <div className="flex items-center gap-2 text-sm text-navy-700/80 dark:text-ice-200/80 mb-1">
              <Mail className="w-4 h-4 text-gold-500" />
              <span>info@luxamapremiumgroup.com</span>
            </div>
            <p className="text-xs text-navy-700/70 dark:text-ice-200/70 text-center font-normal">
              Contact our support team if you encountered an error.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 cursor-pointer active:scale-[0.98] group/btn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
