import {
  fetchBookingByAdminIdAction,
  AdminBookingItem,
} from "@/app/actions/fetchBookingByAdminId";
import { Pagination } from "@/components/ui/pagination";
import {
  Calendar,
  Clock,
  History,
  User,
  Briefcase,
  Video,
  Phone,
} from "lucide-react";

export default async function AdminBookings({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    upcomingPage?: string;
    limit?: string;
    upcomingLimit?: string;
  }>;
}) {
  const params = await searchParams;
  const pastPage = Number(params.page) || 1;
  const upcomingPage = Number(params.upcomingPage) || 1;
  const limit = Number(params.limit) || 6;
  const upcomingLimit = Number(params.upcomingLimit) || 6;

  const {
    upcoming,
    past,
    totalPast,
    totalUpcoming,
    upcomingPagination,
    pastPagination,
  } = await fetchBookingByAdminIdAction({
    pastPage,
    pastLimit: limit,
    upcomingPage,
    upcomingLimit,
  });

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 bg-background min-h-screen font-sans">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 tracking-tight font-sans">
            Consultation Manager
          </h1>
          <p className="text-muted-foreground mt-2 font-medium font-sans">
            Manage your professional schedule and client history.
          </p>
        </div>

        <div className="flex items-center w-fit gap-3 bg-ice-50 p-2 rounded-[1.5rem] border border-border shadow-luxury-sm font-sans">
          <div className="px-5 py-2 bg-card rounded-xl border border-border shadow-sm">
            <p className="text-[10px] font-bold uppercase text-gold-600 tracking-wider font-sans">
              Upcoming
            </p>
            <p className="text-2xl font-bold text-navy-900 leading-none mt-1 font-sans">
              {totalUpcoming}
            </p>
          </div>
          <div className="px-5 py-2">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider font-sans">
              History
            </p>
            <p className="text-2xl font-bold text-navy-800 leading-none mt-1 font-sans">
              {totalPast}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Section */}
      <section>
        <div className="flex items-center gap-2 mb-8 text-navy-900 font-sans">
          <Clock className="h-5 w-5 text-gold-600" />
          <h2 className="text-xl font-bold tracking-tight uppercase font-sans">
            Scheduled Sessions
          </h2>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState message="No upcoming sessions found." />
        ) : (
          <div className="space-y-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((booking: AdminBookingItem) => (
                <BookingCard key={booking._id} booking={booking} isPast={false} />
              ))}
            </div>

            <Pagination
              page={upcomingPagination.page}
              totalPages={upcomingPagination.totalPages}
              totalItems={upcomingPagination.totalItems}
              limit={upcomingPagination.limit}
              pageParamName="upcomingPage"
            />
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="pt-6">
        <div className="flex items-center gap-2 mb-8 text-muted-foreground font-sans">
          <History className="h-5 w-5 text-gold-600" />
          <h2 className="text-xl font-bold tracking-tight uppercase font-sans text-navy-900">
            Completed History
          </h2>
        </div>

        {past.length === 0 ? (
          <EmptyState message="Your history is currently empty." />
        ) : (
          <div className="space-y-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 grayscale-[0.4] hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {past.map((booking: AdminBookingItem) => (
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
  booking: AdminBookingItem;
  isPast: boolean;
}) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div className="bg-card border border-border hover:border-gold-500/50 rounded-[2rem] p-6 transition-all duration-300 hover:shadow-luxury flex flex-col justify-between font-sans">
      <div className="space-y-6">
        {/* Top Meta: Event Name & Date Badge */}
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-navy-900 text-lg leading-snug line-clamp-2 font-sans">
              {booking.event?.name || "Consultation"}
            </h3>
            <p className="text-xs font-semibold text-gold-600 mt-1 font-sans">
              Fee: ${booking.event?.price || 0}
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-ice-50 border border-border rounded-xl text-navy-900 font-sans">
            {booking.status}
          </span>
        </div>

        {/* Client Profile Box */}
        <div className="p-4 rounded-2xl bg-ice-50 border border-border flex items-center gap-3 font-sans">
          <div className="h-10 w-10 rounded-full bg-ice-100 flex items-center justify-center text-muted-foreground border border-border shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-gold-600 tracking-wider font-sans">
              Client Details
            </p>
            <p className="text-sm font-bold text-navy-900 truncate font-sans">
              {booking.user?.name || "Unassigned"}
            </p>
            <p className="text-xs text-muted-foreground truncate font-sans">
              {booking.user?.email || "No email available"}
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

      {/* Action / Contact Links Footer */}
      <div className="pt-6 mt-6 border-t border-border flex items-center justify-between gap-4 font-sans">
        {booking.consultationType === "video" && booking.zoomStartUrl && !isPast ? (
          <a
            href={booking.zoomStartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-xs uppercase tracking-wider transition-all shadow-luxury-sm font-sans"
          >
            <Video className="h-4 w-4" />
            Host Meeting
          </a>
        ) : booking.consultationType === "phone" && booking.phoneNumber ? (
          <a
            href={`tel:${booking.phoneNumber}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ice-100 hover:bg-ice-200 text-navy-900 font-bold text-xs uppercase tracking-wider transition-all border border-border font-sans"
          >
            <Phone className="h-4 w-4 text-gold-600" />
            Call Client
          </a>
        ) : (
          <span className="text-xs text-muted-foreground font-medium">
            {isPast ? "Session Finished" : "No Host Link"}
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
