"use client";

import {
  Users,
  Receipt,
  FileSignature,
  Building2,
  Languages,
  FileCheck2,
  Award,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Immigration & USCIS",
    description:
      "Expert guidance for visas, green cards, citizenship filings, and family petitions.",
    icon: Users,
    url: `/admins/${createSlug("Immigration USCIS Support")}`,
  },
  {
    title: "Tax & Financial",
    description:
      "Strategic tax preparation and IRS compliance for individuals and businesses.",
    icon: Receipt,
    url: `/admins/${createSlug("Tax Financial Services")}`,
  },
  {
    title: "Notary & Legalization",
    description:
      "Official document verification, certified affidavits, and state apostilles.",
    icon: FileSignature,
    url: `/admins/${createSlug("Notary Document Services")}`,
  },
  {
    title: "Business Formation",
    description:
      "End-to-end LLC setup, state registrations, and operational compliance.",
    icon: Building2,
    url: `/admins/${createSlug("Business Administrative Services")}`,
  },
  {
    title: "Certified Translations",
    description:
      "Multilingual translations for legal, medical, and personal official records.",
    icon: Languages,
    url: `/admins/${createSlug("Translation Language Services")}`,
  },
  {
    title: "Document Preparation",
    description:
      "Accurate paperwork processing to avoid delays and costly filing errors.",
    icon: FileCheck2,
    url: `/forms/${createSlug("Tax Financial Services")}`,
  },
  {
    title: "Citizenship & Status",
    description:
      "Dedicated support for N-400 applications, status adjustment, and renewals.",
    icon: Award,
    url: `/admins/${createSlug("Immigration USCIS Support")}`,
  },
  {
    title: "1-on-1 Consultations",
    description:
      "Personalized sessions with certified specialists to map out your goals.",
    icon: UserCheck,
    url: `/admins/${createSlug("Other Services")}`,
  },
];

export default function ProfessionalServices() {
  const router = useRouter();

  return (
    <section
      id="services"
      className="bg-ice-100/60 dark:bg-navy-950 px-6 py-20 md:py-28 overflow-hidden border-b border-border/60 relative"
    >
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center mb-14 md:mb-16 max-w-3xl mx-auto">
          <h2 className="font-sans font-bold text-navy-900 dark:text-ice-50 text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
            Explore the services we{" "}
            <span className="text-gold-gradient">provide.</span>
          </h2>
          <p className="mt-4 text-navy-700/75 dark:text-ice-200/75 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto">
            At Luxama Premium Group, we offer a comprehensive range of legal and
            financial services designed to meet your personal and business needs.
            Our experienced professionals deliver tailored solutions with
            expertise, integrity, and complete confidentiality.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(service.url)}
                className={cn(
                  "group relative flex flex-col items-center text-center justify-center p-7 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/70 bg-card text-card-foreground shadow transition-all duration-300 ease-out cursor-pointer",
                  "hover:shadow-luxury hover:border-gold-500/40 hover:-translate-y-2",
                  "active:scale-[0.98]"
                )}
              >
                {/* Clean Centered Floating Outline Icon */}
                <div className="flex items-center justify-center text-gold-500 dark:text-gold-400 group-hover:scale-110 transition-transform duration-300 mb-4">
                  <Icon className="w-10 h-10 stroke-[1.6]" />
                </div>

                {/* Card Title */}
                <h3 className="text-base sm:text-lg font-sans font-bold text-navy-900 dark:text-ice-50 mb-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {service.title}
                </h3>

                {/* Card Description */}
                <p className="text-xs sm:text-sm text-navy-700/75 dark:text-ice-200/75 leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
