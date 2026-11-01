"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  CalendarClock,
  ArrowRight,
  Receipt,
  FileSignature,
  Building2,
  Languages,
  Users,
  PhoneCall,
  Clock,
} from "lucide-react";

export default function About() {
  const areasOfExpertise = [
    {
      title: "Immigration & USCIS Help",
      desc: "Help filling out forms, checking documents, and putting together complete packages for green cards, work permits, and citizenship.",
      icon: Users,
    },
    {
      title: "Tax Preparation & Filing",
      desc: "Personal and small business tax returns, ITIN applications, and straightforward help making sure your taxes are filed correctly.",
      icon: Receipt,
    },
    {
      title: "Starting & Managing a Business",
      desc: "Help registering your Florida LLC or corporation, getting your EIN number, and filing your annual state reports on time.",
      icon: Building2,
    },
    {
      title: "Notary Public Services",
      desc: "Quick, official notarization for affidavits, travel letters, powers of attorney, and other important personal or business papers.",
      icon: FileSignature,
    },
    {
      title: "Certified Translations",
      desc: "Word-for-word certified English translations accepted by USCIS for birth certificates, diplomas, and marriage records.",
      icon: Languages,
    },
    {
      title: "One-on-One Consultations",
      desc: "Meet with an expert in person or online to review your papers, answer questions, and plan your next steps.",
      icon: CalendarClock,
    },
  ];

  const trustPoints = [
    "Direct, one-on-one help from start to finish",
    "Every document is double-checked to prevent delays",
    "Clear, upfront pricing with no surprise fees",
    "We speak English, Spanish, and Haitian Creole",
    "In-person visits in Kissimmee, or easy online meetings from anywhere",
  ];

  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-28 md:px-10 border-b border-border/60 overflow-hidden">
        {/* Subtle decorative background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-5">
              About Luxama Premium Group
            </div>
            <h1 className="font-sans font-bold text-3xl sm:text-5xl lg:text-6xl text-navy-900 dark:text-ice-50 tracking-tight leading-[1.15] mb-6">
              Clear, Reliable Help for{" "}
              <span className="text-gold-gradient">Your Forms & Filings</span>
            </h1>
            <p className="text-navy-700/80 dark:text-ice-200/85 text-base sm:text-lg lg:text-xl leading-relaxed font-sans font-normal max-w-2xl mb-8">
              Dealing with immigration forms, tax returns, or official paperwork can be stressful. We sit down with you, check every detail, and help you get your documents done right the first time.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/#hero"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 cursor-pointer active:scale-[0.98] group/btn"
              >
                <span>Book an Appointment</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-border/80 bg-card/80 hover:bg-card text-navy-900 dark:text-ice-100 font-semibold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
              >
                <span>Contact Our Office</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Areas of Expertise */}
      <section className="relative px-6 py-20 md:py-28 md:px-10 border-b border-border/60 overflow-hidden bg-background">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl z-10">
          <div className="mb-14 max-w-3xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-5">
              What We Do
            </div>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-navy-900 dark:text-ice-50 tracking-tight leading-[1.2]">
              Simple Support for <span className="text-gold-gradient">What Matters Most</span>
            </h2>
            <p className="text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl font-normal">
              Whether you need to file an application with USCIS, do your taxes, or get a document notarized, we make the process easy to understand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areasOfExpertise.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group rounded-3xl border border-border/80 bg-card/90 dark:bg-card/40 p-7 sm:p-8 shadow hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-start"
                >
                  <div className="w-12 h-12 rounded-full border border-border/80 dark:border-navy-700/80 bg-background/80 dark:bg-navy-900/60 flex items-center justify-center text-navy-900 dark:text-gold-400 mb-6 shadow-xs group-hover:scale-110 group-hover:border-gold-500/50 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-all">
                    <Icon className="w-5 h-5 text-inherit" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-sans font-bold text-navy-900 dark:text-ice-50 mb-3 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us & Legal Disclosures */}
      <section className="relative px-6 py-20 md:py-28 md:px-10 border-b border-border/60 overflow-hidden bg-background">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Why Work With Us */}
            <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/90 dark:bg-card/40 p-7 sm:p-9 shadow flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-5">
                  Why Work With Us
                </div>
                <h3 className="text-2xl sm:text-3xl font-sans font-bold text-navy-900 dark:text-ice-50 mb-4 leading-snug">
                  Why People Choose Us
                </h3>
                <p className="text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base leading-relaxed mb-8 font-normal">
                  Mistakes on forms cause long delays. We take the time to double-check everything with you before anything is submitted.
                </p>

                <div className="space-y-4">
                  {trustPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-inherit" />
                      </div>
                      <span className="text-navy-900 dark:text-ice-100 text-sm sm:text-base font-normal">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/60 flex items-center gap-3 text-xs sm:text-sm text-navy-700/80 dark:text-ice-200/70">
                <Clock className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Office hours: Monday through Saturday, 9:00 AM – 6:00 PM EST</span>
              </div>
            </div>

            {/* Right Column: Featured Navy Card for Disclosures */}
            <div className="lg:col-span-5 flex">
              <div className="group rounded-3xl border border-navy-800 dark:border-gold-500/20 bg-navy-900 dark:bg-navy-950 p-7 sm:p-9 shadow hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden w-full text-ice-50">
                {/* Subtle top ambient lighting inside card */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold-500/10 blur-[60px] pointer-events-none rounded-full" />

                <div>
                  <div className="w-12 h-12 rounded-full border border-ice-100/20 dark:border-gold-500/30 bg-white/5 flex items-center justify-center text-gold-400 mb-6 shadow-xs group-hover:scale-110 group-hover:border-gold-400/60 transition-all">
                    <Scale className="w-5 h-5 text-inherit" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-sans font-bold text-ice-50 mb-5 leading-snug group-hover:text-gold-300 transition-colors">
                    Important Legal Note
                  </h3>

                  <div className="space-y-4 text-ice-200/85 text-sm sm:text-base leading-relaxed font-normal">
                    <p>
                      <strong className="text-ice-50 font-semibold">
                        Luxama Premium Group is a document preparation and consulting office.
                      </strong>{" "}
                      We are not lawyers or a law firm, and we do not give legal advice or represent anyone in court.
                    </p>
                    <p>
                      Our work is strictly administrative—helping you fill out, organize, and submit your paperwork correctly.
                    </p>
                    <p className="text-ice-200/75 text-xs sm:text-sm">
                      Consultation fees cover our time and review. Government agencies make the final decisions on all applications.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-navy-800">
                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 cursor-pointer active:scale-[0.98] group/btn"
                  >
                    <span>Ask Us a Question</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative px-6 py-20 md:py-24 md:px-10 overflow-hidden bg-background">
        <div className="relative mx-auto max-w-4xl z-10 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-5">
            Let's Get Started
          </div>
          <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-navy-900 dark:text-ice-50 tracking-tight leading-[1.2] mb-6">
            Need Help with <span className="text-gold-gradient">Your Paperwork?</span>
          </h2>
          <p className="text-navy-700/80 dark:text-ice-200/85 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8 font-normal">
            Book a time to talk with one of our specialists, or simply give our office a call today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#hero"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 cursor-pointer active:scale-[0.98] group/btn"
            >
              <span>Schedule Consultation</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
            <a
              href="tel:4073254909"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-border/80 bg-card/80 hover:bg-card text-navy-900 dark:text-ice-100 font-semibold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-gold-500" />
              <span>Call +1 (407) 325-4909</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
