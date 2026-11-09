import { Skeleton } from "@/components/ui/skeleton";

export default function TaxPreparersSkeleton() {
  return (
    <div
      className="relative w-full max-w-[1340px] mx-auto overflow-hidden py-6 select-none"
      role="region"
      aria-busy="true"
      aria-label="Loading team members"
    >
      <span className="sr-only">Loading team members</span>
      <div className="flex items-center justify-center -ml-6 sm:-ml-8 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="pl-6 sm:pl-8 basis-auto shrink-0">
            <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-[20px] bg-navy-900 border border-gold-500/25 shadow-[0_30px_60px_-20px_rgba(6,13,36,0.85),0_10px_25px_-10px_rgba(6,13,36,0.65),0_0_25px_-5px_rgba(200,162,74,0.15)] overflow-hidden">
              <Skeleton className="w-full h-full bg-navy-800/70 rounded-[20px] motion-reduce:animate-none" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-950 via-navy-950/75 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <Skeleton className="h-6 sm:h-7 w-40 sm:w-48 max-w-[70%] rounded-md bg-navy-700/80 motion-reduce:animate-none" />
                  <Skeleton className="h-10 w-full max-w-[240px] rounded-full bg-gold-500/20 border border-gold-500/30 motion-reduce:animate-none" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
