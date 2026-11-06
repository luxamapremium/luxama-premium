"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import fetchAdminsByEventCategory from "@/app/actions/public/GetAllAdminsForEventGategory";
import { EVENTS_CATEGORIES } from "@/lib/constants/event-categories";
import { slugToCategory } from "@/lib/slug";
import { useEffect, useState } from "react";

type Admin = {
  _id: string;
  name: string;
  image: string;
  email?: string;
};

// Specialist Card matching Homepage Carousel design
const SpecialistCard = ({
  id,
  img,
  name,
  onSchedule,
}: {
  id: string;
  img: string;
  name: string;
  onSchedule: (id: string) => void;
}) => {
  const isRemoteConfigured =
    img?.startsWith("/") ||
    img?.includes("res.cloudinary.com") ||
    img?.includes("images.unsplash.com") ||
    img?.includes("cdn.example.com");

  return (
    <div className="relative w-full max-w-[350px] aspect-square rounded-[20px] overflow-hidden bg-navy-900 border border-gold-500 group transition-all duration-300">
      {/* Full Card Photo with next/image */}
      <Image
        src={img || "/logo.png"}
        alt={name ? `Portrait of ${name}` : "Specialist portrait"}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px"
        className="object-cover object-[center_top] pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
        unoptimized={!isRemoteConfigured}
      />

      {/* Card Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 pointer-events-none">
        {/* Subtle bottom gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-950 via-navy-950/75 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <h3
            className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-ice-50 uppercase line-clamp-2 drop-shadow-sm max-w-full px-2"
            title={name}
          >
            {name}
          </h3>

          <Button
            variant="gold"
            size="sm"
            onClick={() => onSchedule(id)}
            className="pointer-events-auto w-full max-w-[240px] uppercase text-xs tracking-wider rounded-full py-5 font-semibold shadow-gold hover:shadow-gold-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>Schedule Consultation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function AdminListPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const categorySlug = resolvedParams.category;
      const decodedCategory = slugToCategory(categorySlug, EVENTS_CATEGORIES);

      if (decodedCategory) {
        setCategory(decodedCategory);
        const data = await fetchAdminsByEventCategory(decodedCategory);
        setAdmins(data);
      }
      setLoading(false);
    }
    loadData();
  }, [params]);

  const handleSchedule = (id: string) => {
    router.push(`/events/admin/${id}`);
  };

  if (loading) return null;

  if (!category) {
    return (
      <div className="text-center py-20 font-medium text-navy-700/70 dark:text-ice-200/70">
        Invalid category
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full py-16 md:py-24 lg:py-28 px-6 bg-background overflow-hidden border-b border-border/60">
      {/* Decorative ambient lighting accents matching Why-Choose-Us */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl z-10">
        {/* Header Section */}
        <header className="mb-16 md:mb-20 text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-2">
            Our Specialists
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-navy-900 dark:text-ice-50 leading-[1.2]">
            Meet <span className="text-gold-gradient">the specialists.</span>
          </h1>
          <p className="text-navy-700/80 dark:text-ice-200/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-normal">
            Service Category:{" "}
            <span className="font-semibold text-navy-900 dark:text-gold-400">{category}</span>
          </p>
        </header>

        {admins.length > 0 ? (
          /* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 md:gap-y-24 justify-items-center">
            {admins.map((admin) => (
              <SpecialistCard
                key={admin._id.toString()}
                id={admin._id.toString()}
                name={admin.name}
                img={admin.image}
                onSchedule={handleSchedule}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto p-12 border-2 border-dashed border-border/80 bg-card/40 rounded-3xl text-center text-navy-700/70 dark:text-ice-200/70">
            <p className="text-base font-normal">
              No specialists found for this service category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
