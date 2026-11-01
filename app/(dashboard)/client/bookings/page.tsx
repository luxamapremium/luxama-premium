export const dynamic = "force-dynamic";

import { fetchBookingByUserIdAction } from "@/app/actions/fetchBookingByUserId";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  History,
  Timer,
  ShieldCheck,
  CreditCard,
  Mail,
  User,
  ArrowRight,
  Briefcase,
  Video,
  Phone,
  ExternalLink,
} from "lucide-react";

export default async function Bookings() {
  const bookings = await fetchBookingByUserIdAction();
  const now = new Date();

  const upcomingBookings = bookings
    .filter((b: any) => new Date(b.startTime) >= now)
    .sort(
      (a: any, b: any) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

  const pastBookings = bookings
    .filter((b: any) => new Date(b.startTime) < now)
    .sort(
      (a: any, b: any) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );

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
            {upcomingBookings.map((booking: any) => (
              <BookingCard key={booking._id} booking={booking} isPast={false} />
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 grayscale-[0.4] hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {pastBookings.map((booking: any) => (
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
  const timeStr = `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-card border rounded-[2rem] p-6 transition-all duration-500 font-sans shadow-luxury-sm",
        isPast
          ? "border-border opacity-70"
          : "border-border hover:border-gold-500/50 hover:shadow-luxury-lg hover:-translate-y-1",
      )}
    >
      {/* Header: Expert Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm font-sans",
              isPast ? "bg-ice-200 text-muted-foreground" : "bg-navy-900 text-gold-300",
            )}
          >
            {booking.adminId?.name?.charAt(0) || <User className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-navy-900 text-lg leading-tight truncate font-sans">
              {booking.adminId?.name || "Consultant"}
            </h3>
            <p className="text-sm text-gold-600 font-medium flex items-center gap-1.5 truncate font-sans">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {booking.adminId?.email}
            </p>
          </div>
        </div>

        {/* Type Badge */}
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

      {/* Merged Information Block */}
      <div className="space-y-4 py-6 border-y border-border">
        {/* Service Name Row */}
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
              Service
            </p>
            <p className="text-sm font-bold text-navy-900 truncate font-sans">
              {booking.eventId?.name || "Standard Consultation"}
            </p>
          </div>
        </div>

        {/* Date & Time Row */}
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
              Scheduled On
            </p>
            <p className="text-sm font-bold text-navy-900 font-sans">{dateStr}</p>
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-0.5 font-sans">
              <Clock className="h-3 w-3" /> {timeStr}{" "}
              <span className="mx-1">•</span> <Timer className="h-3 w-3" />{" "}
              {booking.eventId?.duration || 30}m
            </p>
          </div>
        </div>

        {/* Action Row - FETCHED LINKS DISPLAYED HERE */}
        {!isPast && (
          <div className="pt-2">
            {booking.consultationType === "video" && booking.zoomJoinUrl ? (
              <a
                href={booking.zoomJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-navy-900 hover:bg-navy-800 text-gold-300 rounded-2xl text-sm font-bold transition-colors shadow-luxury-sm font-sans"
              >
                <Video className="h-4 w-4" />
                Join Zoom Meeting
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

        {/* Status & Payment Row */}
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
              Paid
            </p>
            <p className="text-xl font-bold text-navy-900 font-sans">
              ${booking.eventId?.price || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-6 flex items-center justify-center">
        <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-2 font-sans">
          <span className="uppercase tracking-widest">
            Ref: {booking._id.slice(-6)}
          </span>
          {!isPast && <span className="h-1 w-1 bg-border rounded-full" />}
          {!isPast && (
            <span>
              Booked {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-[2.5rem] bg-ice-50/50 font-sans">
      <Calendar className="h-10 w-10 text-ice-200 mb-4" />
      <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest font-sans">
        {message}
      </p>
    </div>
  );
}
