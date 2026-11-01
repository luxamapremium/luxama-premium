"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { CalendarDays } from "lucide-react";
import { getAdmins } from "@/app/actions/public/adminAction";
import DepthCarousel from "@/components/DepthCarousel";

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

  const carouselItems = admins.map((admin) => ({
    id: admin._id,
    name: admin.name,
    image: admin.image,
    alt: `Portrait of ${admin.name}`,
  }));

  return (
    <section
      id="hero"
      className="relative w-full py-10 md:py-14 lg:py-20 px-6 bg-navy-950 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-800 text-ice-50 overflow-hidden border-b border-navy-800"
      style={{ background: 'linear-gradient(180deg, #060D24 0%, #0B1736 60%, #132450 100%)' }}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gold-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-navy-800/40 blur-[100px] pointer-events-none rounded-full" />
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <header className="text-left space-y-5">
          <span className="text-gold-400 font-semibold tracking-[0.25em] uppercase text-xs sm:text-sm block">
           Luxama Premium Group
          </span>
          <h1 className="font-sans text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ice-50">
            <span className="text-gold-gradient bg-gradient-to-r from-gold-600 via-gold-400 to-gold-500 bg-clip-text text-transparent">
              Discover
            </span>{" "}
            <span>our team.</span>
          </h1>
          <p className="text-ice-200/85 max-w-xl text-sm md:text-xl leading-relaxed font-sans">
            Meet our experienced professionals, dedicated to providing personalized guidance and expert support. Schedule a consultation with your choosen expert in this list.
          </p>
        </header>

        {/* Depth Carousel Container (unibody integration with hero background) */}
        <div className="relative w-full h-[460px] md:h-[500px] lg:h-[520px]">
          <DepthCarousel
            items={carouselItems}
            cardWidth={350}
            cardHeight={350}
            radius={20}
            depth={200}
            spread={85}
            tilt={20}
            visibleCards={admins.length}
            tint="#060D24"
            autoplay={true}
            autoplayDelay={3500}
            renderItem={(item) => (
              <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 pointer-events-none">
                {/* Subtle bottom gradient overlay for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-950 via-navy-950/75 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <h3
                    className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-ice-50 uppercase line-clamp-2 drop-shadow-sm max-w-full px-2"
                    title={item.name}
                  >
                    {item.name}
                  </h3>

                  <Button
                    variant="gold"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.id) handleSchedule(item.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="pointer-events-auto w-full max-w-[240px] uppercase text-xs tracking-wider rounded-full py-5 font-semibold shadow-gold hover:shadow-gold-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <span>Schedule Consultation</span>
                  </Button>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
