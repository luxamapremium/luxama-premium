"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { CalendarDays } from "lucide-react";
import { getAdmins } from "@/app/actions/public/adminAction";

type Admin = {
  _id: string;
  name: string;
  image: string;
};

export default function HeroSection() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchAdmins() {
      const res = await getAdmins();
      if (res.success) {
        setAdmins(res.data as Admin[]);
        setIsReady(true);
      }
    }
    fetchAdmins();
  }, []);

  const handleSchedule = (id: string) => router.push(`events/admin/${id}`);

  if (!isReady || admins.length === 0) return null;

  return (
    <section
      id="hero"
      className="relative w-full py-20 md:py-32 lg:py-36 px-6 bg-navy-gradient text-ice-50 overflow-hidden border-b border-navy-800"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gold-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-navy-800/40 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20 md:mb-24 text-center space-y-5">
          <span className="text-gold-400 font-semibold tracking-[0.25em] uppercase text-xs sm:text-sm block">
            Our Professionals
          </span>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ice-50">
            <span className="text-gold-gradient">Meet</span>{" "}
            <span>the team.</span>
          </h1>
          <p className="text-ice-200/85 max-w-2xl mx-auto text-base md:text-xl leading-relaxed font-sans">
            Connect with our seasoned advisors to schedule a consultation or submit your inquiry online with complete confidentiality.
          </p>
        </header>

        {/* Infinite Slide Container */}
        <div className="relative w-full overflow-hidden">
          <div className="flex w-fit gap-8 md:gap-10 animate-infinite-scroll py-4">
            {/* Render the list twice to create the infinite illusion */}
            {[...admins, ...admins].map((admin, index) => (
              <div
                key={`${admin._id}-${index}`}
                className="group flex flex-col items-center min-w-[280px] md:min-w-[340px] transition-all duration-300"
              >
                <div className="relative mb-6">
                  <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden border-4 border-gold-500/30 group-hover:border-gold-400 shadow-luxury group-hover:shadow-gold transition-all duration-500 group-hover:-translate-y-2 bg-navy-900">
                    <img
                      src={admin.image}
                      alt={admin.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-xl uppercase md:text-2xl text-center font-bold text-ice-100 mb-6 group-hover:text-gold-400 transition-colors">
                  {admin.name}
                </h3>

                <Button
                  variant="gold"
                  onClick={() => handleSchedule(admin._id)}
                  className="w-64 uppercase text-xs tracking-wider rounded-full py-6 font-semibold shadow-gold hover:shadow-gold-lg flex items-center justify-center gap-3 transition-all"
                >
                  <CalendarDays className="h-4 w-4" />
                  Schedule Consultation
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes infinite-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 80s linear infinite;
        }
        /* Pause on hover */
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
