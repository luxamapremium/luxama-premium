"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MobileNavMenuProps } from "./types";

export const MobileNavMenu = ({
  isOpen,
  menu,
  user,
  isLoading,
  auth,
  closeAllMenus,
  handleLogout,
  getInitials,
  router,
  headerHeight,
}: MobileNavMenuProps) => {
  const [openMobileSections, setOpenMobileSections] = useState<string[]>([]);

  const toggleMobileSection = (title: string) => {
    setOpenMobileSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <div
      id="mobile-nav-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      style={{
        top: headerHeight ? `${headerHeight}px` : "var(--navbar-height, 3.75rem)",
        height: headerHeight
          ? `calc(100dvh - ${headerHeight}px)`
          : "calc(100dvh - var(--navbar-height, 3.75rem))",
      }}
      className={cn(
        "fixed inset-x-0 bottom-0 bg-background border-t border-border/80 shadow-2xl z-50 lg:hidden flex flex-col transition-all duration-300 ease-out overflow-hidden overscroll-contain",
        isOpen
          ? "opacity-100 translate-y-0 visible pointer-events-auto"
          : "opacity-0 -translate-y-2 invisible pointer-events-none"
      )}
    >
      {/* Scrollable Links Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2 overscroll-contain">
        {menu.map((item) => {
          const hasSubmenu = Boolean(item.items && item.items.length > 0);
          const isSectionOpen = openMobileSections.includes(item.title);

          if (!hasSubmenu) {
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={closeAllMenus}
                className="flex items-center justify-between p-3.5 rounded-2xl text-base font-semibold text-foreground hover:bg-muted/80 transition-colors"
              >
                <span>{item.title}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            );
          }

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleMobileSection(item.title)}
                aria-expanded={isSectionOpen}
                className="flex items-center justify-between w-full p-3.5 text-base font-semibold text-foreground text-left cursor-pointer"
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    isSectionOpen && "rotate-180 text-foreground"
                  )}
                />
              </button>

              {isSectionOpen && (
                <div className="px-3 pb-3 space-y-1.5 border-t border-border/40 pt-2">
                  {item.items?.map((sub) => {
                    const hasDeepItems = Boolean(sub.items && sub.items.length > 0);
                    const isDeepOpen = openMobileSections.includes(sub.title);

                    if (hasDeepItems) {
                      return (
                        <div
                          key={sub.title}
                          className="rounded-xl border border-border/50 bg-background/60 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleMobileSection(sub.title)}
                            aria-expanded={isDeepOpen}
                            className="flex items-center justify-between w-full p-3 text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-card border border-border/60 text-gold-600 dark:text-gold-400">
                                {sub.icon}
                              </div>
                              <span className="text-xs font-semibold text-foreground">
                                {sub.title}
                              </span>
                            </div>
                            <ChevronDown
                              className={cn(
                                "size-3.5 text-muted-foreground transition-transform",
                                isDeepOpen && "rotate-180"
                              )}
                            />
                          </button>

                          {isDeepOpen && (
                            <div className="p-2 space-y-1 bg-muted/30 border-t border-border/40">
                              {sub.items?.map((deep) => (
                                <Link
                                  key={deep.title}
                                  href={deep.url}
                                  onClick={closeAllMenus}
                                  className="flex items-center gap-2 p-2 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                                >
                                  <div className="size-1 rounded-full bg-gold-500 shrink-0" />
                                  <span>{deep.title}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={sub.title}
                        href={sub.url}
                        onClick={closeAllMenus}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/70 transition-colors group"
                      >
                        <div className="size-8 rounded-lg bg-card border border-border/60 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
                          {sub.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors truncate">
                            {sub.title}
                          </div>
                          {sub.description && (
                            <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                              {sub.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pinned Footer Section (mt-auto) with Safe-Area Padding */}
      <div className="mt-auto p-5 border-t border-border/80 bg-background/95 backdrop-blur-sm pb-[max(1.25rem,env(safe-area-inset-bottom))] shrink-0">
        {isLoading ? (
          <div className="h-10 w-full rounded-full bg-muted/60 animate-pulse" />
        ) : user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-card border border-border/60 mb-2">
              <div className="size-9 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-700 dark:text-gold-300 font-semibold text-xs overflow-hidden shrink-0">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="Avatar"
                    className="size-full object-cover"
                  />
                ) : (
                  getInitials(user?.name || user?.email || "")
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">
                  {user?.name || "Account"}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-center rounded-xl"
              onClick={() => {
                router.push("/dashboard");
                closeAllMenus();
              }}
            >
              <LayoutDashboard className="size-4 mr-2 text-gold-500" />
              Dashboard
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-center rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="size-4 mr-2" />
              Log out
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              asChild
              className="w-full justify-center rounded-full text-xs sm:text-sm"
            >
              <Link href={auth.login.url} onClick={closeAllMenus}>
                {auth.login.text}
              </Link>
            </Button>
            <Button
              variant="gold"
              asChild
              className="w-full justify-center rounded-full font-semibold shadow-gold text-xs sm:text-sm"
            >
              <Link href={auth.signup.url} onClick={closeAllMenus}>
                {auth.signup.text}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
