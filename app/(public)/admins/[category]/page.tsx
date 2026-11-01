"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import fetchAdminsByEventCategory from "@/app/actions/public/GetAllAdminsForEventGategory";
import { EVENTS_CATEGORIES } from "@/lib/constants/event-categories";
import { slugToCategory } from "@/lib/slug";
import { useEffect, useState } from "react";

// Updated Card to match Hero Section Style (Circular)
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
  return (
    <div className="group flex flex-col items-center w-full transition-all duration-300">
      {/* Circular Image Container */}
      <div className="relative mb-6 md:mb-8">
        <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-border/80 dark:border-navy-700/80 shadow-md group-hover:border-gold-500/50 group-hover:shadow-gold transition-all duration-300 group-hover:-translate-y-2 bg-card">
          <img
            src={img || "/api/placeholder/400/400"}
            alt={name}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Name */}
      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-navy-900 dark:text-ice-50 mb-6 md:mb-8 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors text-center">
        {name}
      </h3>

      {/* Button */}
      <Button
        onClick={() => onSchedule(id)}
        className="w-full max-w-[260px] bg-gold-500 hover:bg-gold-400 cursor-pointer text-navy-950 uppercase text-[10px] md:text-xs rounded-full py-6 md:py-7 font-semibold shadow-gold hover:shadow-gold-lg transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        <CalendarDays className="h-4 w-4 md:h-5 md:w-5" />
        Schedule Consultation
      </Button>
    </div>
  );
};

export default function AdminListPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
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
