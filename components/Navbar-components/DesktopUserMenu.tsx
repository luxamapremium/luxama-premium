"use client";

import { useState, useRef, useEffect } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { DesktopUserMenuProps } from "./types";

export const DesktopUserMenu = ({
  user,
  getInitials,
  handleLogout,
  router,
}: DesktopUserMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User account menu"
        className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-gold-500/30 hover:ring-gold-500/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="size-9 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-700 dark:text-gold-300 font-semibold text-xs overflow-hidden">
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
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-2 w-52 z-50">
          <div className="rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-2xl backdrop-blur-xl p-1.5 animate-in fade-in-0 zoom-in-95">
            <div className="px-3 py-2 border-b border-border/60 mb-1">
              <div className="text-xs font-semibold text-foreground truncate">
                {user?.name || "Account"}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                router.push("/dashboard");
                setOpen(false);
              }}
              className="flex items-center gap-2.5 w-full p-2.5 text-xs font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
            >
              <LayoutDashboard className="size-3.5 text-gold-500" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="flex items-center gap-2.5 w-full p-2.5 text-xs font-medium rounded-xl text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left mt-0.5"
            >
              <LogOut className="size-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
