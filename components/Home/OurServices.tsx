"use client";
import {
  Users,
  Receipt,
  FileSignature,
  Briefcase,
  Languages,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Immigration & USCIS Support",
    description:
      "Expert guidance through complex residency and citizenship filing processes with precision.",
    icon: Users,
    featured: true,
    url: `/admins/${createSlug("Immigration USCIS Support")}`,
  },
  {
    title: "Tax & Financial Services",
    description:
      "Comprehensive tax preparation and strategic planning for individuals and businesses.",
    icon: Receipt,
    featured: true,
    url: `/admins/${createSlug("Tax Financial Services")}`,
  },
  {
    title: "Notary & Document Services",
    description:
      "Official verification and legal authentication for your critical documents.",
    icon: FileSignature,
    url: `/admins/${createSlug("Notary Document Services")}`,
  },
  {
    title: "Business & Administrative Services",
    description:
      "Streamlined operational support to help your business scale efficiently.",
    icon: Briefcase,
    url: `/admins/${createSlug("Business Administrative Services")}`,
  },
  {
    title: "Translation & Language Services",
    description:
      "Certified multilingual translations for legal, medical, and personal records.",
    icon: Languages,
    url: `/admins/${createSlug("Translation Language Services")}`,
  },
  {
    title: "Professional Consultations",
    description:
      "One-on-one sessions with specialists to map out your specific goals.",
    icon: UserCheck,
    url: `/admins/${createSlug("Other Services")}`,
  },
];

export default function ProfessionalServices() {
  const router = useRouter();

  return (
    <section className="bg-ice-100/60 dark:bg-navy-950 px-6 py-20 md:py-32 overflow-hidden border-b border-border/60 relative">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Animated Header */}
        <div className="text-center mb-16 md:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          <span className="text-gold-600 dark:text-gold-400 font-bold uppercase tracking-[0.25em] text-xs mb-3 block">
            Expertise You Can Trust
          </span>
          <h2 className="font-serif font-bold text-navy-900 dark:text-ice-50 text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight">
            Our Professional <span className="text-gold-gradient">Services</span>
          </h2>
          <p className="mt-5 text-navy-700/80 dark:text-ice-200/80 max-w-2xl mx-auto text-base sm:text-lg font-normal">
            Tailored solutions designed to navigate your most important legal
            and financial milestones.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 touch-manipulation">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(service.url)}
                style={{ animationDelay: `${index * 100}ms` }}
                className={cn(
                  "group relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl border border-border/70 bg-card text-card-foreground transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-8 fill-mode-both cursor-pointer shadow-luxury-sm",
                  "hover:shadow-luxury hover:border-gold-500/40 hover:-translate-y-2",
                  "active:scale-[0.98]",
                  service.featured ? "border-gold-500/30" : ""
                )}
              >
                <div>
                  {/* Icon Tile */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 dark:bg-navy-800 shadow-luxury-sm mb-8 transition-all duration-500 group-hover:scale-110 group-hover:bg-gold-gradient group-hover:text-navy-950 group-hover:rotate-6">
                    <Icon className="w-6 h-6 text-inherit transition-colors" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-navy-900 dark:text-ice-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-navy-700/80 dark:text-ice-200/80 leading-relaxed text-sm sm:text-base font-normal">
                    {service.description}
                  </p>
                </div>

                {/* Footer link */}
                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest transition-all group-hover:gap-4">
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
