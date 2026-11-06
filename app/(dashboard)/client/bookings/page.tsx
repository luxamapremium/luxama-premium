export const dynamic = "force-dynamic";

import {
  fetchBookingByUserIdAction,
  ClientBookingItem,
} from "@/app/actions/fetchBookingByUserId";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  History,
  ShieldCheck,
  Briefcase,
  Video,
  Phone,
} from "lucide-react";

export default async function Bookings({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 6;

  const result = await fetchBookingByUserIdAction(page, limit);
  const upcomingBookings = result.upcoming;
  const pastBookings = result.past;
  const pastPagination = result.pastPagination;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 bg-background min-h-screen font-sans">
      <div className="border-b border-border pb-8">
        <h1 className="text-4xl font-bold text-navy-900 tracking-tight font-sans">
          My Bookings
        </h1>
        <p className="text-muted-foreground mt-2 font-medium font-sans">
          View and manage your upcoming consultations.
        </p>
      </div>

      {/* Upcoming Section */}
      <section>
        <div className="flex items-center gap-2 mb-8 text-navy-900 font-sans">
          <Clock className="h-5 w-5 text-gold-600" />
          <h2 className="text-xl font-bold tracking-tight uppercase font-sans">
            Upcoming Sessions
          </h2>
        </div>

        {upcomingBookings.length === 0 ? (
          <EmptyState message="No scheduled sessions." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBookings.map((booking: ClientBookingItem) => (
              <BookingCard key={booking._id} booking={booking} isPast={false} />
            ))}
          </div>
        )}
      </section>

      {/* History Section (Paginated) */}
      <section className="pt-6">
        <div className="flex items-center gap-2 mb-8 text-muted-foreground font-sans">
          <History className="h-5 w-5 text-gold-600" />
          <h2 className="text-xl font-bold tracking-tight uppercase font-sans text-navy-900">
            Past History
          </h2>
        </div>

        {pastBookings.length === 0 ? (
          <EmptyState message="No history found." />
        ) : (
          <div className="space-y-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 grayscale-[0.4] hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {pastBookings.map((booking: ClientBookingItem) => (
                <BookingCard key={booking._id} booking={booking} isPast={true} />
              ))}
            </div>

            <Pagination
              page={pastPagination.page}
              totalPages={pastPagination.totalPages}
              totalItems={pastPagination.totalItems}
              limit={pastPagination.limit}
              pageParamName="page"
            />
          </div>
        )}
      </section>
    </div>
  );
}

function BookingCard({
  booking,
  isPast,
}: {
  booking: ClientBookingItem;
  isPast: boolean;
}) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-card border rounded-[2rem] p-6 transition-all duration-500 font-sans shadow-luxury-sm",
        isPast
          ? "border-border opacity-70"
          : "border-border hover:border-gold-500/50 hover:shadow-luxury-lg",
      )}
    >
      <div className="space-y-6">
        {/* Top: Service info and Status */}
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-navy-900 text-lg leading-snug line-clamp-2 font-sans">
              {booking.eventId?.name || "Private Consultation"}
            </h3>
            <p className="text-xs font-semibold text-gold-600 mt-1 font-sans">
              Fee: ${booking.eventId?.price || 0}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl border font-sans",
              isPast
                ? "bg-ice-50 border-border text-muted-foreground"
                : "bg-navy-900 border-gold-500/20 text-gold-300",
            )}
          >
            {isPast ? "Completed" : booking.status}
          </span>
        </div>

        {/* Assigned Expert Box */}
        <div className="p-4 rounded-2xl bg-ice-50 border border-border flex items-center gap-3 font-sans">
          <div className="h-10 w-10 rounded-full bg-navy-900 flex items-center justify-center text-gold-300 shadow-luxury-sm shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider font-sans">
              Assigned Expert
            </p>
            <p className="text-sm font-bold text-navy-900 truncate font-sans">
              {booking.adminId?.name || "Staff Professional"}
            </p>
            <p className="text-xs text-gold-600 font-medium truncate font-sans">
              {booking.adminId?.email || "staff@luxamapremium.com"}
            </p>
          </div>
        </div>

        {/* Date and Time Details */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center gap-3 text-sm text-navy-900 font-medium">
            <Calendar className="h-4 w-4 text-gold-600 shrink-0" />
            <span className="truncate">{dateStr}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <Clock className="h-4 w-4 text-gold-600 shrink-0" />
            <span className="truncate">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Action / Join Links Footer */}
      <div className="pt-6 mt-6 border-t border-border flex items-center justify-between gap-4 font-sans">
        {booking.consultationType === "video" && booking.zoomJoinUrl && !isPast ? (
          <a
            href={booking.zoomJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-xs uppercase tracking-wider transition-all shadow-luxury-sm font-sans"
          >
            <Video className="h-4 w-4" />
            Join Meeting
          </a>
        ) : booking.consultationType === "phone" && !isPast ? (
          <div className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ice-100 text-navy-900 font-bold text-xs uppercase tracking-wider border border-border font-sans">
            <Phone className="h-4 w-4 text-gold-600" />
            Phone Consultation
          </div>
        ) : (
          <span className="text-xs text-muted-foreground font-medium">
            {isPast ? "Past Appointment" : "Awaiting Meeting Details"}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-[2rem] bg-card font-sans">
      <Briefcase className="h-10 w-10 text-ice-200 mb-3" />
      <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest text-center font-sans">
        {message}
      </p>
    </div>
  );
}
