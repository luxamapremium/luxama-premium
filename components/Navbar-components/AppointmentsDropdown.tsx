"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { AppointmentsDropdownProps } from "./types";

export const AppointmentsDropdown = ({
  item,
  closeAllMenus,
}: AppointmentsDropdownProps) => {
  return (
    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full pt-3 w-fit max-w-xl z-50">
      <div className="rounded-3xl border border-border/80 bg-popover/95 backdrop-blur-2xl text-popover-foreground shadow-2xl p-5 transition-all duration-200 animate-in fade-in-0 zoom-in-95">
        {/* Header: Trust & Advisory Header */}
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Consultation Advisory
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-navy-700/20 text-navy-700 dark:text-navy-700 border border-navy-500/25">
                <ShieldCheck className="size-3 text-navy-700 dark:text-navy-700" />
                USCIS Compliant
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Book confidential 1-on-1 sessions with verified specialists
            </p>
          </div>
        </div>

        {/* Services List with Upgraded Typography & Service Badges */}
        <div className="space-y-1.5">
          {item.items?.map((sub) => {
            return (
              <Link
                key={sub.title}
                href={sub.url}
                onClick={closeAllMenus}
                className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-accent/70 border border-transparent hover:border-border/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="size-10 rounded-xl bg-card border border-border/70 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:border-gold-500/40 group-hover:bg-gold-500/10 transition-all">
                    {sub.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors truncate">
                        {sub.title}
                      </span>
                     
                    </div>
                    {sub.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 group-hover:text-foreground/80 transition-colors">
                        {sub.description}
                      </p>
                    )}
                  </div>
                </div>

                <ArrowRight className="size-4 text-muted-foreground/60 opacity-0 group-hover:opacity-100 group-hover:text-gold-600 dark:group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>

        {/* Quick Contact & Free 15-Minute Discovery Call Footer */}
        <div className="mt-3.5 pt-3 border-t border-border/60 space-y-2.5">
          {/* Trust Guarantees */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-navy-900 dark:text-navy-800" />
              Certified Specialists
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-navy-900 dark:text-navy-800" />
              Strict Document Privacy
            </span>
            <Link
              href="/contact"
              onClick={closeAllMenus}
              className="font-medium text-foreground hover:text-gold-600 dark:hover:text-gold-400 transition-colors inline-flex items-center gap-1"
            >
              Need Help? <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
