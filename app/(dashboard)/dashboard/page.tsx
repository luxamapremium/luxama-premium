import { fetchBookingByUserIdAction } from "@/app/actions/fetchBookingByUserId";
import { fetchBookingByAdminIdAction } from "@/app/actions/fetchBookingByAdminId";
import { verifyUser } from "@/lib/auth/check-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Briefcase,
  Video,
  Phone,
  ExternalLink,
  ShieldCheck,
  LayoutDashboard,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";

export default async function HomeDashboard() {
  const user = await verifyUser();
  const isAdmin = user.role === "admin" || user.role === "super-admin";

  let displayBookings = [];
  let totalPastCount = 0;
  let adminUpcomingCount = 0;

  if (isAdmin) {
    const { upcoming, totalPast } = await fetchBookingByAdminIdAction(1, 3);
    displayBookings = upcoming.slice(0, 3);
    adminUpcomingCount = upcoming.length;
    totalPastCount = totalPast;
  } else {
    const userBookings = await fetchBookingByUserIdAction();
    displayBookings = userBookings.slice(0, 3);
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 bg-background min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 tracking-tight font-sans">
            {isAdmin ? "Admin Overview" : "My Schedule"}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium font-sans">
            {isAdmin
              ? `You have ${adminUpcomingCount} upcoming sessions to manage.`
              : `Welcome back, ${user.name}. View your upcoming consultations below.`}
          </p>
        </div>

        <Link
          href={isAdmin ? "/admin/bookings" : "/client/bookings"}
          className="group flex w-fit items-center gap-3 bg-navy-900 hover:bg-navy-800 text-gold-300 px-6 py-3 rounded-2xl font-bold transition-all shadow-luxury-sm hover:shadow-luxury font-sans"
        >
          View Full Schedule
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Table Section */}
      <section className="bg-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-navy-900">
            <LayoutDashboard className="h-5 w-5 text-gold-600" />
            <h2 className="text-xl font-bold tracking-tight font-sans">
              {isAdmin ? "Priority Sessions" : "Upcoming Sessions"}
            </h2>
          </div>
        </div>

        {displayBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-[2rem] bg-ice-50/50">
            <Calendar className="h-10 w-10 text-ice-200 mb-4" />
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest font-sans">
              No sessions scheduled.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-luxury-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="hidden md:table-header-group bg-ice-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest font-sans">
                      Participant
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest font-sans">
                      Service
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest font-sans">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest font-sans">
                      Type
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase text-muted-foreground tracking-widest font-sans">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayBookings.map((booking: any) => (
                    <BookingRow
                      key={booking._id}
                      booking={booking}
                      isAdmin={isAdmin}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-ice-50 rounded-[2.5rem] border border-border flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-gold-600 tracking-widest font-sans">
                Total Active
              </p>
              <p className="text-4xl font-bold text-navy-900 mt-1 font-sans">
                {adminUpcomingCount}
              </p>
            </div>
            <Clock className="h-10 w-10 text-gold-500 opacity-30" />
          </div>
          <div className="p-8 bg-ice-50 rounded-[2.5rem] border border-border flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-navy-700 tracking-widest font-sans">
                Lifetime Completed
              </p>
              <p className="text-4xl font-bold text-navy-900 mt-1 font-sans">
                {totalPastCount}
              </p>
            </div>
            <ShieldCheck className="h-10 w-10 text-navy-700 opacity-30" />
          </div>
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking, isAdmin }: { booking: any; isAdmin: boolean }) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  const dateStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  const displayName = isAdmin
    ? booking.user?.name || "Private Client"
    : booking.adminId?.name || "Consultant";

  return (
    <tr className="group flex flex-col md:table-row hover:bg-ice-50/60 transition-colors">
      {/* Participant */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-sm font-sans">
            {displayName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-navy-900 font-sans">
              {displayName}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground md:hidden uppercase tracking-tighter font-sans">
              {isAdmin ? "Client" : "Consultant"}
            </span>
          </div>
        </div>
      </td>

      {/* Service */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-navy-800">
          <Briefcase className="h-3.5 w-3.5 text-gold-600" />
          <span className="text-sm font-medium truncate max-w-[150px] font-sans">
            {booking.eventId?.name || "Consultation"}
          </span>
        </div>
      </td>

      {/* Schedule */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-navy-900 font-sans">{dateStr}</span>
          <span className="text-xs text-muted-foreground font-medium font-sans">{timeStr}</span>
        </div>
      </td>

      {/* Type Badge */}
      <td className="px-6 py-4">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide font-sans",
            booking.consultationType === "video"
              ? "bg-navy-900 text-gold-400"
              : "bg-ice-100 text-navy-900 border border-ice-200",
          )}
        >
          {booking.consultationType === "video" ? (
            <Video className="h-3 w-3" />
          ) : (
            <Phone className="h-3 w-3" />
          )}
          {booking.consultationType}
        </div>
      </td>

      {/* Action */}
      <td className="px-6 py-4 text-right">
        {booking.consultationType === "video" ? (
          <a
            href={isAdmin ? booking.zoomStartUrl : booking.zoomJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-gold-300 rounded-xl text-xs font-bold transition-all shadow-luxury-sm font-sans"
          >
            Join <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-sm font-bold text-navy-900 font-sans">
            {booking.phoneNumber || "N/A"}
          </span>
        )}
      </td>
    </tr>
  );
}
