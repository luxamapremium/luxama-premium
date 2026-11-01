"use client";

import Link from "next/link";
import { FileCheck2, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormsDropdownProps } from "./types";

export const FormsDropdown = ({
  item,
  selectedCategory,
  onSelectCategory,
  closeAllMenus,
}: FormsDropdownProps) => {
  const activeCategoryObj = item.items?.find(
    (sub) => sub.title === selectedCategory
  );

  return (
    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full pt-3 w-full max-w-5xl z-50">
      <div className="rounded-3xl border border-border/80 bg-popover/95 backdrop-blur-2xl text-popover-foreground shadow-xl p-6 transition-all duration-200 animate-in fade-in-0 zoom-in-95">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Form categories */}
          <div className="col-span-5 space-y-1">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 pb-2">
              Form Categories
            </div>
            <div className="space-y-1">
              {item.items?.map((cat) => {
                const isSelected = selectedCategory === cat.title;
                const hasSubforms = Boolean(cat.items && cat.items.length > 0);

                return (
                  <div
                    key={cat.title}
                    onMouseEnter={() => onSelectCategory(cat.title)}
                    className={cn(
                      "group flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer",
                      isSelected
                        ? "bg-accent text-foreground font-semibold"
                        : "hover:bg-accent/60 text-foreground/85"
                    )}
                  >
                    {hasSubforms ? (
                      <div className="flex items-start gap-3 w-full">
                        <div className="size-9 rounded-xl bg-card border border-border/70 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          {cat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {cat.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {cat.description}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={cat.url}
                        onClick={closeAllMenus}
                        className="flex items-start gap-3 w-full focus-visible:outline-none"
                      >
                        <div className="size-9 rounded-xl bg-card border border-border/70 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          {cat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                            {cat.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {cat.description}
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deeper sub-items (e.g. 13 USCIS forms or details) */}
          <div className="col-span-7 border-l border-border/60 pl-6 flex flex-col justify-between">
            {activeCategoryObj?.items && activeCategoryObj.items.length > 0 ? (
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {activeCategoryObj.title} Forms
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-300 font-medium">
                    {activeCategoryObj.items.length} Forms Available
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeCategoryObj.items.map((deep) => (
                    <Link
                      key={deep.title}
                      href={deep.url}
                      onClick={closeAllMenus}
                      className="group flex items-start gap-2 p-2 rounded-xl hover:bg-accent/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <FileCheck2 className="size-3.5 text-gold-600 dark:text-gold-400 mt-0.5 shrink-0 opacity-80 group-hover:opacity-100" />
                      <span className="text-xs text-foreground/90 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2 leading-tight">
                        {deep.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <div className="size-12 rounded-2xl bg-card border border-border/70 text-gold-600 dark:text-gold-400 flex items-center justify-center shadow-xs mb-3">
                  {activeCategoryObj?.icon || <FileText className="size-6" />}
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  {activeCategoryObj?.title}
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                  {activeCategoryObj?.description ||
                    "Complete your submission online with our streamlined intake forms."}
                </p>
                {activeCategoryObj?.url && (
                  <Button variant="gold" size="sm" asChild className="rounded-full">
                    <Link href={activeCategoryObj.url} onClick={closeAllMenus}>
                      Start Intake Form <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {/* Bottom Quick Help bar */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>Need help finding the right form?</span>
              <Link
                href="/contact"
                onClick={closeAllMenus}
                className="font-medium text-foreground hover:text-gold-600 dark:hover:text-gold-400 inline-flex items-center gap-1 transition-colors"
              >
                Ask Our Team <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
