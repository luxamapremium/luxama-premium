import { getEventsByAdmin } from "@/app/actions/public/eventActions";
import { Calendar, Clock, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { verifyUser } from "@/lib/auth/check-auth";

interface AdminDetailsProps {
  params: {
    adminId: string;
  };
}

export default async function AdminDetails({ params }: AdminDetailsProps) {
  const user = await verifyUser();

  const { adminId } = await params;
  const response = await getEventsByAdmin(adminId);
  const events = response.success ? response.data : [];

  return (
    <div className="bg-background min-h-screen relative overflow-hidden border-b border-border/60">
      {/* Subtle decorative background glow accents matching Why-Choose-Us */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

      <section className="relative block px-6 py-12 md:py-24 md:px-10 z-10">
        {/* Header Section */}
        <div className="relative mx-auto max-w-5xl text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-5">
            Consultations
          </div>
          <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-navy-900 dark:text-ice-50 tracking-tight leading-[1.2]">
            Professional <span className="text-gold-gradient">Consultations</span>
          </h2>
          <p className="mx-auto my-4 w-full max-w-xl text-center font-normal leading-relaxed text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base">
            Select a service below to begin your journey with Luxama Premium Group. We offer tailored solutions designed for your specific needs.
          </p>
        </div>

        {/* Events Grid */}
        <div className="relative mx-auto max-w-7xl z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event._id}
                className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card/90 dark:bg-card/40 p-7 sm:p-8 shadow hover:shadow-md hover:border-gold-500/40 transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-full border border-border/80 dark:border-navy-700/80 bg-background/80 dark:bg-navy-900/60 flex items-center justify-center text-navy-900 dark:text-gold-400 mb-6 shadow-xs group-hover:scale-110 group-hover:border-gold-500/50 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-all">
                    <Briefcase className="w-5 h-5 text-inherit" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-sans font-bold text-navy-900 dark:text-ice-50 mb-3 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                    {event.name}
                  </h3>

                  <div className="flex items-center gap-4 mt-3 text-sm font-normal text-navy-700/70 dark:text-ice-200/70">
                    <span className="flex items-center gap-1.5 text-gold-600 dark:text-gold-400 font-medium">
                      <Clock className="w-4 h-4 text-inherit" />
                      {event.durationMinutes} mins
                    </span>
                    <span className="font-semibold text-navy-900 dark:text-ice-100">
                      {event.isFree ?? event.price === 0 ? (
                        <span className="text-gold-600 dark:text-gold-400 font-semibold">Free</span>
                      ) : (
                        `$${event?.price}`
                      )}
                    </span>
                  </div>

                  <p className="my-4 font-normal leading-relaxed text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base line-clamp-3">
                    {event.description ||
                      "Expert professional guidance tailored to your requirements."}
                  </p>
                </div>

                <Link
                  href={`/events/${event._id}`}
                  className="mt-6 inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 cursor-pointer active:scale-[0.98] group/btn"
                >
                  <span>Schedule Consultation</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-card/40 rounded-3xl border-2 border-dashed border-border/80 p-8">
              <Calendar className="w-12 h-12 text-navy-300 dark:text-gold-400/50 mx-auto mb-4" />
              <p className="text-navy-700/70 dark:text-ice-200/70 font-normal">
                No active consultation dates available at this time for this
                expert professional.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
