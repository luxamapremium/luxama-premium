import { Skeleton } from "@/components/ui/skeleton";

export default function TaxPreparersSkeleton() {
  return (
    <div
      className="relative w-full h-full min-h-[350px] flex items-center justify-center select-none overflow-hidden"
      role="region"
      aria-busy="true"
      aria-label="Loading tax preparers"
    >
      <span className="sr-only">Loading tax preparers</span>

      {/* Dimmed background card 2 (furthest back) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[calc(-50%+120px)] sm:translate-x-[calc(-50%+170px)] scale-[0.76] z-0 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-[20px] bg-navy-900/80 border border-gold-500/15 opacity-40 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <Skeleton className="w-full h-full bg-navy-800/40 rounded-[20px] motion-reduce:animate-none" />
      </div>

      {/* Dimmed background card 1 (middle stack) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[calc(-50%+60px)] sm:translate-x-[calc(-50%+85px)] scale-[0.88] z-10 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-[20px] bg-navy-900/90 border border-gold-500/20 opacity-70 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <Skeleton className="w-full h-full bg-navy-800/60 rounded-[20px] motion-reduce:animate-none" />
      </div>

      {/* Main active card (front) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-[20px] bg-navy-900 border border-gold-500/25 shadow-[0_30px_60px_-20px_rgba(6,13,36,0.85),0_10px_25px_-10px_rgba(6,13,36,0.65),0_0_25px_-5px_rgba(200,162,74,0.15)] overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {/* Photo placeholder block */}
        <Skeleton className="w-full h-full bg-navy-800/70 rounded-[20px] motion-reduce:animate-none" />

        {/* Card content overlay matching real card */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-950 via-navy-950/75 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
            {/* Name bar placeholder */}
            <Skeleton className="h-6 sm:h-7 w-40 sm:w-48 max-w-[70%] rounded-md bg-navy-700/80 motion-reduce:animate-none" />

            {/* Schedule Consultation pill button placeholder */}
            <Skeleton className="h-10 w-full max-w-[240px] rounded-full bg-gold-500/20 border border-gold-500/30 motion-reduce:animate-none" />
          </div>
        </div>
      </div>

      {/* Placeholder pagination dots */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2 py-1.5 px-3.5 rounded-full bg-navy-950/60 border border-gold-500/20 pointer-events-none"
        aria-hidden="true"
      >
        <div className="h-[7px] w-[22px] rounded-full bg-gold-500/50 animate-pulse motion-reduce:animate-none" />
        <div className="h-[7px] w-[7px] rounded-full bg-ice-200/25 animate-pulse motion-reduce:animate-none" />
        <div className="h-[7px] w-[7px] rounded-full bg-ice-200/25 animate-pulse motion-reduce:animate-none" />
      </div>
    </div>
  );
}

