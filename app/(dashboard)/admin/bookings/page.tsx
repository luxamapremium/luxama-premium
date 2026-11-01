import { fetchBookingByAdminIdAction } from "@/app/actions/fetchBookingByAdminId";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Calendar,
  Clock,
  History,
  Timer,
  ShieldCheck,
  Mail,
  User,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  ExternalLink,
} from "lucide-react";

export default async function AdminBookings({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 6;

  const { upcoming, past, totalPages, totalPast } =
    await fetchBookingByAdminIdAction(currentPage, limit);

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
              {upcoming.length}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((booking: any) => (
              <BookingCard key={booking._id} booking={booking} isPast={false} />
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground font-sans">
            <History className="h-5 w-5 text-gold-600" />
            <h2 className="text-xl font-bold tracking-tight uppercase font-sans text-navy-900">
              Completed History
            </h2>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-3 bg-ice-50 p-1.5 rounded-2xl border border-border font-sans">
              <Link
                href={`?page=${Math.max(1, currentPage - 1)}`}
                scroll={false}
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-card transition-all shadow-sm font-sans",
                  currentPage <= 1
                    ? "opacity-30 pointer-events-none"
                    : "hover:border-gold-500 hover:text-navy-900",
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              <div className="px-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest font-sans">
                Page {currentPage}{" "}
                <span className="text-ice-200 mx-1">/</span> {totalPages}
              </div>

              <Link
                href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                scroll={false}
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-card transition-all shadow-sm font-sans",
                  currentPage >= totalPages
                    ? "opacity-30 pointer-events-none"
                    : "hover:border-gold-500 hover:text-navy-900",
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {past.length === 0 ? (
          <EmptyState message="Your history is currently empty." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 grayscale-[0.4] hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {past.map((booking: any) => (
              <BookingCard key={booking._id} booking={booking} isPast={true} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookingCard({ booking, isPast }: { booking: any; isPast: boolean }) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = `${start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-card border rounded-[2rem] p-6 transition-all duration-500 font-sans shadow-luxury-sm",
        isPast
          ? "border-border opacity-70"
          : "border-border hover:border-gold-500/50 hover:shadow-luxury-lg hover:-translate-y-1",
      )}
    >
      {/* 1. Client Identity & Consultation Type Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm font-sans",
              isPast ? "bg-ice-200 text-muted-foreground" : "bg-navy-900 text-gold-300",
            )}
          >
            {booking.user?.name?.charAt(0) || <User className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-navy-900 text-lg leading-tight truncate font-sans">
              {booking.user?.name || "Private Client"}
            </h3>
            <p className="text-sm text-gold-600 font-medium flex items-center gap-1.5 truncate font-sans">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {booking.user?.email}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "p-2 rounded-xl border font-sans",
            booking.consultationType === "video"
              ? "bg-navy-900 border-gold-500/20 text-gold-400"
              : "bg-ice-100 border-ice-200 text-navy-900",
          )}
        >
          {booking.consultationType === "video" ? (
            <Video className="h-4 w-4" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* 2. Merged Information Block */}
      <div className="space-y-4 py-6 border-y border-border">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-card rounded-lg border border-border shadow-sm">
            <Briefcase
              className={cn(
                "h-4 w-4",
                !isPast ? "text-gold-600" : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-0.5 font-sans">
              Service Provided
            </p>
            <p className="text-sm font-bold text-navy-900 truncate font-sans">
              {booking.event?.name || "Professional Consultation"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-card rounded-lg border border-border shadow-sm">
            <Calendar
              className={cn(
                "h-4 w-4",
                !isPast ? "text-gold-600" : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-0.5 font-sans">
              Scheduled Date
            </p>
            <p className="text-sm font-bold text-navy-900 font-sans">{dateStr}</p>
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-0.5 font-sans">
              <Clock className="h-3 w-3" /> {timeStr}{" "}
              <span className="mx-1">•</span> <Timer className="h-3 w-3" /> 30m
            </p>
          </div>
        </div>

        {/* Action Row */}
        {!isPast && (
          <div className="pt-2">
            {booking.consultationType === "video" && booking.zoomStartUrl ? (
              <a
                href={booking.zoomStartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-navy-900 hover:bg-navy-800 text-gold-300 rounded-2xl text-sm font-bold transition-colors shadow-luxury-sm font-sans"
              >
                <Video className="h-4 w-4" />
                Start Zoom (Host)
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : booking.consultationType === "phone" && booking.phoneNumber ? (
              <a
                href={`tel:${booking.phoneNumber}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-navy-900 hover:bg-navy-800 text-gold-300 rounded-2xl text-sm font-bold transition-colors shadow-luxury-sm font-sans"
              >
                <Phone className="h-4 w-4" />
                Call {booking.phoneNumber}
              </a>
            ) : null}
          </div>
        )}

        {/* Updated Status & Revenue Row */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1.5 font-sans">
              Booking & Status
            </p>
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter border font-sans",
                  booking.status === "confirmed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                {booking.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1.5 font-sans">
              Revenue
            </p>
            <div className="flex items-center justify-end gap-1">
              <span className="text-xl font-bold text-navy-900 font-sans">
                ${booking.event?.price || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer Meta */}
      <div className="mt-6 flex items-center justify-center">
        <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-2 font-sans">
          <span className="uppercase tracking-widest">
            Ref: {booking._id.toString().slice(-6)}
          </span>
          {!isPast && <span className="h-1 w-1 bg-border rounded-full" />}
          {!isPast && (
            <span>
              Recorded {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-[3rem] bg-ice-50/50 font-sans">
      <div className="p-5 bg-card rounded-full shadow-sm mb-4 border border-border">
        <Calendar className="h-10 w-10 text-ice-200" />
      </div>
      <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em] font-sans">
        {message}
      </p>
    </div>
  );
}
