"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DesktopNavProps } from "./types";

export const DesktopNav = ({
  menu,
  activeDropdown,
  onToggleDropdown,
  onCloseDropdowns,
}: DesktopNavProps) => {
  return (
    <nav
      aria-label="Main Navigation"
      className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-1 rounded-full border border-border/80 bg-card/75 dark:bg-card/50 backdrop-blur-md p-1.5 shadow-xs transition-shadow hover:shadow-luxury-sm">
        {menu.map((item) => {
          const hasSubmenu = Boolean(item.items && item.items.length > 0);
          const isOpen = activeDropdown === item.title;

          if (!hasSubmenu) {
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={onCloseDropdowns}
                className="px-4 py-1.5 text-sm font-medium rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.title}
              </Link>
            );
          }

          return (
            <div key={item.title} className="relative">
              <button
                type="button"
                onClick={() => onToggleDropdown(item.title)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none",
                  isOpen
                    ? "bg-muted text-foreground font-semibold shadow-xs"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/80"
                )}
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200 text-muted-foreground",
                    isOpen && "rotate-180 text-foreground"
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
