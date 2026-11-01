import fetchAllBookingsAdminsAction from "@/app/actions/fetchAllBookingsAdminsAction";
import Link from "next/link";
import {
  Calendar,
  User,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Next.js 15+ searchParams are async, in older versions they are plain objects
export default async function AllBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 10;

  // We destructure the new object returned by the server action
  const { bookings, totalPages, totalBookings } =
    await fetchAllBookingsAdminsAction(currentPage, limit);

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-8 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900 tracking-tight font-sans">
              Platform Audit
            </h1>
            <p className="text-muted-foreground font-medium text-sm md:text-base font-sans">
              Monitoring all transactions and bookings across the ecosystem.
            </p>
          </div>

          <div className="flex items-center self-start md:self-center gap-2 bg-card px-4 py-2 rounded-2xl border border-border shadow-luxury-sm font-sans">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-navy-900 whitespace-nowrap font-sans">
              {totalBookings} Total Records
            </span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-[2rem] bg-card font-sans">
            <Search className="h-12 w-12 text-ice-200 mb-4" />
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest text-center font-sans">
              No system bookings found
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 px-8 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest font-sans">
              <div className="col-span-3">Service & Details</div>
              <div className="col-span-3">Client (User)</div>
              <div className="col-span-3">Expert (Admin)</div>
              <div className="col-span-2 text-center">Amount</div>
              <div className="col-span-1 text-right">Date</div>
            </div>

            {/* Booking Rows */}
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((booking: any) => (
                <div
                  key={booking._id.toString()}
                  className="group relative grid grid-cols-1 lg:grid-cols-12 items-center md:gap-4 bg-card border border-border hover:border-gold-500/50 p-5 md:p-6 lg:px-8 lg:py-4 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-300 hover:shadow-luxury-lg lg:hover:-translate-y-0.5 font-sans"
                >
                  {/* Service Info */}
                  <div className="col-span-3 flex items-center gap-4 mb-5 lg:mb-0">
                    <div className="shrink-0 h-12 w-12 rounded-2xl bg-ice-100 flex items-center justify-center text-gold-600 border border-border shadow-sm">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-navy-900 text-base lg:text-sm font-sans">
                        {(() => {
                          const name =
                            booking.event?.name || "Standard Session";
                          return name.length > 20
                            ? name.slice(0, 20) + "..."
                            : name;
                        })()}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter font-sans">
                        ID: {booking._id.toString().slice(-8)}
                      </p>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="col-span-3 flex items-center gap-3 mb-5 lg:mb-0 lg:border-none">
                    <div className="shrink-0 h-9 w-9 rounded-full bg-ice-50 flex items-center justify-center text-muted-foreground border border-border overflow-hidden">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="lg:hidden text-[9px] font-bold uppercase text-gold-600 mb-0.5 font-sans">
                        Client
                      </p>
                      <p className="text-sm font-bold text-navy-900 truncate font-sans">
                        {booking.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-sans">
                        {booking.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Admin Info */}
                  <div className="col-span-3 flex items-center gap-3 mb-5 lg:mb-0 lg:border-none">
                    <div className="shrink-0 h-9 w-9 rounded-xl bg-navy-900 flex items-center justify-center text-gold-300 shadow-luxury-sm">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="lg:hidden text-[9px] font-bold uppercase text-muted-foreground mb-0.5 font-sans">
                        Expert
                      </p>
                      <p className="text-sm font-bold text-navy-900 truncate font-sans">
                        {booking.admin?.name || "Staff"}
                      </p>
                      <p className="text-xs text-gold-600 font-medium truncate font-sans">
                        {booking.admin?.email}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 flex flex-row lg:flex-col lg:justify-center items-center lg:items-center gap-2 mb-5 lg:mb-0 py-4 lg:py-0 border-y lg:border-none border-border">
                    <p className="lg:hidden text-[10px] font-bold uppercase text-muted-foreground font-sans">
                      Fee:
                    </p>
                    <div className="px-4 py-1.5 bg-ice-100 text-navy-900 rounded-xl border border-border flex items-center gap-1.5 font-sans">
                      <DollarSign className="h-4 w-4 text-gold-600" />
                      <span className="text-lg lg:text-sm font-bold">
                        {booking.event?.price || 0}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-1 flex flex-col lg:flex-col justify-end items-end lg:items-end">
                    <p className="lg:hidden text-[10px] font-bold uppercase text-muted-foreground flex gap-1 font-sans">
                      <Calendar className="h-3 w-3" /> Booked On
                    </p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-navy-900 font-sans">
                        {new Date(booking.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase font-sans">
                        {new Date(booking.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Pagination Controls --- */}
            <div className="flex items-center justify-between pt-10 font-sans">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`?page=${Math.max(1, currentPage - 1)}`}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card transition-all font-sans",
                    currentPage <= 1
                      ? "opacity-50 pointer-events-none"
                      : "hover:border-gold-500 hover:text-navy-900",
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                <Link
                  href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card transition-all font-sans",
                    currentPage >= totalPages
                      ? "opacity-50 pointer-events-none"
                      : "hover:border-gold-500 hover:text-navy-900",
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
