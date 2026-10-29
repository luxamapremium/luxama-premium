import * as React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentsDropdownProps } from "./types";

export const AppointmentsDropdown = ({
  item,
  closeAllMenus,
}: AppointmentsDropdownProps) => {
  return (
    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full pt-3 w-full max-w-4xl z-50">
      <div className="rounded-3xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-xl p-6 transition-all duration-200 animate-in fade-in-0 zoom-in-95">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Services list with icon boxes & descriptions */}
          <div className="col-span-7 space-y-1">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 pb-2">
              Available Consultation Services
            </div>
            <div className="space-y-1">
              {item.items?.map((sub) => (
                <Link
                  key={sub.title}
                  href={sub.url}
                  onClick={closeAllMenus}
                  className="group flex items-start gap-3.5 p-2.5 rounded-2xl hover:bg-accent/70 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="size-10 rounded-xl bg-card border border-border/70 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:border-gold-500/40 group-hover:bg-gold-500/10 transition-all mt-0.5">
                    {sub.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                      {sub.title}
                    </div>
                    {sub.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {sub.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Highlight Card & Direct CTA */}
          <div className="col-span-5 border-l border-border/60 pl-6 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase pb-2">
                Why Luxama Consultations
              </div>
              <div className="space-y-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                  <span>Certified & accredited professionals with 15+ years experience</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                  <span>Strict privacy compliance and secure USCIS document handling</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="size-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                  <span>Flexible in-person and virtual consultation slots</span>
                </div>
              </div>
            </div>

            {/* Highlight Box */}
            <div className="mt-6 rounded-2xl bg-muted/40 border border-border/60 p-4">
              <div className="text-xs font-semibold text-foreground">
                Need custom guidance?
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                Speak directly with our bilingual customer advisory team.
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-between rounded-xl text-xs font-medium"
              >
                <Link href="/contact" onClick={closeAllMenus}>
                  <span>Get in Touch</span>
                  <ArrowRight className="size-3.5 text-gold-500" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
