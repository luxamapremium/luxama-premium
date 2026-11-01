"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getEventById } from "@/app/actions/public/eventActions";
import { getAvailableDates } from "@/app/actions/public/getAvailableDatesActions";
import {
  getAvailableSlots,
  AvailableSlot,
} from "@/app/actions/public/getAvailableSlotsActions";
import {
  Clock,
  CreditCard,
  Calendar as CalendarIcon,
  ArrowLeft,
  ShieldCheck,
  Clock as ClockIcon,
  Video,
  Phone,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { createBookingCheckout } from "@/app/actions/checkoutBooking";
import { authClient } from "@/lib/auth/auth-client";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default function EventDetails({ params }: Props) {
  const { eventId } = use(params);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- Auth & Session ---
  const session = authClient.useSession();
  const currentUser = session.data?.user;

  // --- Core State ---
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState<any>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // --- Form State ---
  const [consultationType, setConsultationType] = useState<"phone" | "video">(
    "phone",
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  // --- Logic Change: Determine UI based on Host Role ---
  const hostIsSuperAdmin = event?.hostRole === "super-admin";

  // Update default selection based on the Host's capabilities
  useEffect(() => {
    if (event) {
      if (hostIsSuperAdmin) {
        setConsultationType("video");
      } else {
        setConsultationType("phone");
      }
    }
  }, [event, hostIsSuperAdmin]);

  // --- UI State ---
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Initialization ---
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getEventById(eventId);
        if (!res.success) return setError(res.error || "Event not found");
        setEvent(res.data);

        const dates = await getAvailableDates(
          res.data?.adminId,
          undefined,
          undefined,
          1,
        );
        const localDates = dates.map((d: any) => {
          const [year, month, day] = d.date.split("-").map(Number);
          return new Date(year, month - 1, day);
        });
        setAvailableDates(localDates);
      } catch (err) {
        setError("Failed to load details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId]);

  // --- Fetch Slots Logic ---
  const fetchSlots = useCallback(
    async (date: Date) => {
      if (!event) return;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        setSlotsLoading(true);
        setSelectedSlot(null);
        const dateString = date.toISOString().split("T");
        const slots = await getAvailableSlots(
          event.adminId,
          event._id,
          dateString[0],
        );

        setAvailableSlots(
          slots.map((s: any) => ({
            ...s,
            startTime: new Date(s.startTime),
            endTime: new Date(s.endTime),
          })),
        );
      } catch (err) {
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [event],
  );

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  // --- Submission ---
  const handleFinalBooking = async () => {
    if (!selectedSlot || !event) return;

    // Validation: Ensure video is only booked if host supports it
    if (consultationType === "video" && !hostIsSuperAdmin) {
      setError("Video consultations are not available for this professional.");
      return;
    }

    if (consultationType === "phone" && !phoneNumber) {
      setError("Please provide a phone number for the call.");
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);
      const res = await createBookingCheckout({
        eventId: event._id,
        adminId: event.adminId,
        userId: currentUser?.id || "",
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        consultationType,
        phoneNumber: consultationType === "phone" ? phoneNumber : undefined,
      });
      if (res?.isFree) {
        // Free booking — go directly to success page
        window.location.href = `${window.location.origin}/booking/success?id=${res.bookingId}`;
      } else if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err) {
      setError("Payment initialization failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20 border-b border-border/60">
      {/* Subtle decorative background glow accents matching Why-Choose-Us */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

      <nav className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <Link
          href={`/events/admin/${event?.adminId}`}
          className="inline-flex items-center text-sm font-medium text-navy-700/80 dark:text-ice-200/80 hover:text-gold-600 dark:hover:text-gold-400 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Services
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card/90 dark:bg-card/40 rounded-3xl p-8 shadow border border-border/80">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-4">
              Booking Consultation
            </div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-ice-50 mt-4 mb-6 leading-tight">
              {event?.name}
            </h1>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between p-3.5 rounded-2xl bg-background/80 dark:bg-navy-900/60 border border-border/80 text-sm">
                <span className="flex items-center gap-2 text-navy-700/70 dark:text-ice-200/70">
                  <Clock className="w-4 h-4 text-gold-500" /> Duration
                </span>
                <span className="font-bold text-navy-900 dark:text-ice-50">
                  {event?.durationMinutes}m
                </span>
              </div>
              <div className="flex justify-between p-3.5 rounded-2xl bg-background/80 dark:bg-navy-900/60 border border-border/80 text-sm">
                <span className="flex items-center gap-2 text-navy-700/70 dark:text-ice-200/70">
                  <CreditCard className="w-4 h-4 text-gold-500" /> Price
                </span>
                <span className="font-bold text-navy-900 dark:text-ice-50">
                  {event.isFree ?? event.price === 0 ? (
                    <span className="text-gold-600 dark:text-gold-400">Free</span>
                  ) : (
                    `$${event?.price}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-inherit" />
                </div>
                <p className="text-xs text-navy-700/70 dark:text-ice-200/70 leading-relaxed font-normal">
                  Your information is encrypted and PCI compliant. Secure
                  consultation guaranteed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Multi-Step Flow */}
        <div className="lg:col-span-8">
          <div className="bg-card/90 dark:bg-card/40 rounded-3xl border border-border/80 shadow min-h-[600px] flex flex-col">
            {/* Step Header */}
            <div className="p-8 border-b border-border/60 flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy-900 dark:text-ice-50 flex items-center gap-3">
                <div className="p-2 bg-navy-900 dark:bg-navy-800 text-gold-400 rounded-xl border border-border/80">
                  {step === 1 ? (
                    <CalendarIcon className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                {step === 1 ? "Select Date & Time" : "Consultation Details"}
              </h2>
              <div className="flex gap-1.5">
                <div
                  className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? "bg-gold-500" : "bg-border"}`}
                />
                <div
                  className={`h-1.5 w-8 rounded-full transition-colors ${step === 2 ? "bg-gold-500" : "bg-border"}`}
                />
              </div>
            </div>

            <div className="p-8 flex-1">
              {step === 1 ? (
                <div className="flex flex-col md:flex-row gap-10 animate-in fade-in duration-500">
                  <div className="flex-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        !availableDates.some(
                          (d) => d.toDateString() === date.toDateString(),
                        ) || date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      className="rounded-2xl border border-border/80 p-4 bg-background/60 shadow-xs"
                    />
                  </div>

                  <div className="flex-1 space-y-6">
                    {selectedDate ? (
                      <>
                        <h3 className="font-bold text-sm flex items-center gap-2 text-navy-900 dark:text-ice-50">
                          <ClockIcon className="w-4 h-4 text-gold-500 dark:text-gold-400" />{" "}
                          Available Slots
                        </h3>
                        {slotsLoading ? (
                          <div className="grid grid-cols-2 gap-3 animate-pulse">
                            {availableSlots.map((slot, i) => (
                              <div
                                key={i}
                                className="h-12 bg-muted rounded-xl"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {availableSlots.map((slot, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                  selectedSlot?.startTime.getTime() ===
                                  slot.startTime.getTime()
                                    ? "bg-gold-500 border-gold-500 text-navy-950 shadow-gold scale-105 font-bold"
                                    : "bg-card border-border/80 text-foreground hover:bg-muted/80 hover:border-gold-500/40"
                                }`}
                              >
                                {slot.startTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </button>
                            ))}
                          </div>
                        )}
                        {selectedSlot && (
                          <button
                            onClick={() => setStep(2)}
                            className="w-full py-3.5 px-6 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            <span>Next Step</span> <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card/40 rounded-3xl border border-dashed border-border/80">
                        <CalendarIcon className="w-8 h-8 text-navy-300 dark:text-gold-400/50 mb-2" />
                        <p className="text-sm text-navy-700/70 dark:text-ice-200/70 font-normal">
                          Please pick a date to see available time slots.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-w-xl mx-auto animate-in slide-in-from-right-8 duration-500">
                  <button
                    onClick={() => setStep(1)}
                    className="mb-6 text-sm text-navy-700/70 dark:text-ice-200/70 flex items-center gap-2 hover:text-gold-600 dark:hover:text-gold-400 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change time
                  </button>

                  <h3 className="text-2xl font-bold text-navy-900 dark:text-ice-50 mb-2">
                    How should we connect?
                  </h3>
                  <p className="text-navy-700/80 dark:text-ice-200/80 mb-8 font-normal text-sm sm:text-base">
                    Select your preferred method for the consultation.
                  </p>

                  {/* Consultation Selection Grid */}
                  <div
                    className={`grid gap-4 mb-8 ${hostIsSuperAdmin ? "grid-cols-1 sm:grid-cols-2" : "md:grid-cols-2 grid-cols-1"}`}
                  >
                    {/* ONLY RENDER VIDEO OPTION IF HOST IS SUPER ADMIN */}
                    {hostIsSuperAdmin && (
                      <button
                        onClick={() => setConsultationType("video")}
                        className={`p-6 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                          consultationType === "video"
                            ? "border-gold-500 bg-gold-500/10 shadow-xs"
                            : "border-border/80 bg-card/60 hover:border-gold-500/40"
                        }`}
                      >
                        <Video
                          className={`w-8 h-8 mb-4 ${
                            consultationType === "video"
                              ? "text-gold-500 dark:text-gold-400"
                              : "text-muted-foreground"
                          }`}
                        />
                        <p className="font-bold text-navy-900 dark:text-ice-50">Video Call</p>
                        <p className="text-xs text-navy-700/70 dark:text-ice-200/70 mt-1 font-normal">
                          Join via a secure Zoom link.
                        </p>
                      </button>
                    )}

                    <button
                      onClick={() => setConsultationType("phone")}
                      className={`p-6 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                        consultationType === "phone"
                          ? "border-gold-500 bg-gold-500/10 shadow-xs"
                          : "border-border/80 bg-card/60 hover:border-gold-500/40"
                      }`}
                    >
                      <Phone
                        className={`w-8 h-8 mb-4 ${
                          consultationType === "phone"
                            ? "text-gold-500 dark:text-gold-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      <p className="font-bold text-navy-900 dark:text-ice-50">Phone Call</p>
                      <p className="text-xs text-navy-700/70 dark:text-ice-200/70 mt-1 font-normal">
                        We will call your number.
                      </p>
                    </button>
                  </div>

                  {consultationType === "phone" && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                      <label className="block text-sm font-semibold text-navy-900 dark:text-ice-50 mb-2">
                        Your Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full p-4 rounded-2xl border border-border/80 bg-background text-foreground focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 outline-none transition-all"
                      />
                    </div>
                  )}

                  {error && (
                    <p className="text-destructive text-sm mb-4 font-medium">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleFinalBooking}
                    disabled={bookingLoading}
                    className="w-full py-4 px-8 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <span>
                      {bookingLoading
                        ? "Processing..."
                        : event?.isFree ?? event?.price === 0
                          ? "Confirm Free Booking"
                          : `Complete Booking — $${event?.price}`}
                    </span>
                    {!event?.isFree && <CreditCard className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
