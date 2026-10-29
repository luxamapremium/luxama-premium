"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MenuItem,
  NavbarProps,
  DEFAULT_MENU,
  DEFAULT_LOGO,
  DEFAULT_AUTH,
  getInitials,
  useNavbarScroll,
  useNavbarAuth,
  NavbarLogo,
  DesktopNav,
  DesktopAuthButtons,
  AppointmentsDropdown,
  FormsDropdown,
  MobileNavMenu,
} from "./Navbar-components";

export type { MenuItem, NavbarProps };
export { DEFAULT_MENU };

export const Navbar = ({
  logo = DEFAULT_LOGO,
  menu = DEFAULT_MENU,
  auth = DEFAULT_AUTH,
}: NavbarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFormCategory, setSelectedFormCategory] = useState<string>(
    "Immigration & USCIS Support"
  );

  const navContainerRef = useRef<HTMLDivElement>(null);
  const { isScrolled } = useNavbarScroll();

  const closeAllMenus = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const { user, isLoading, handleLogout, router } = useNavbarAuth(closeAllMenus);

  // Outside click & escape listener to close desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formsItem = menu.find((item) => item.title === "Forms");
  const appointmentsItem = menu.find((item) => item.title === "Appointments");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isMobileMenuOpen
          ? "bg-background border-b border-border/80 py-2.5 shadow-luxury-sm"
          : isScrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/80 py-2.5 shadow-luxury-sm"
          : "bg-background/40 backdrop-blur-xs py-3.5"
      )}
    >
      <div
        ref={navContainerRef}
        className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="flex items-center justify-between gap-4">
          {/* 1. Left: Brand Logo */}
          <NavbarLogo logo={logo} onClick={closeAllMenus} />

          {/* 2. Center: Tailark Header-4 Floating Capsule Navigation (Desktop lg+) */}
          <DesktopNav
            menu={menu}
            activeDropdown={activeDropdown}
            onToggleDropdown={(title) =>
              setActiveDropdown(activeDropdown === title ? null : title)
            }
            onCloseDropdowns={() => setActiveDropdown(null)}
          />

          {/* 3. Right: Authentication / User State (Desktop lg+) */}
          <DesktopAuthButtons
            isLoading={isLoading}
            user={user}
            auth={auth}
            getInitials={getInitials}
            handleLogout={handleLogout}
            router={router}
          />

          {/* 4. Mobile Menu Trigger Button (Visible below lg) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-panel"
              className="p-2.5 rounded-full text-foreground bg-card/80 border border-border/80 hover:bg-accent/80 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/*Tailark Header-4 Mega Dropdowns (Desktop lg+)*/}
        {activeDropdown === "Appointments" && appointmentsItem && (
          <AppointmentsDropdown
            item={appointmentsItem}
            closeAllMenus={closeAllMenus}
          />
        )}

        {activeDropdown === "Forms" && formsItem && (
          <FormsDropdown
            item={formsItem}
            selectedCategory={selectedFormCategory}
            onSelectCategory={setSelectedFormCategory}
            closeAllMenus={closeAllMenus}
          />
        )}
      </div>

      {/*Mobile Menu Panel (fills viewport below header)*/}
      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        menu={menu}
        user={user}
        isLoading={isLoading}
        auth={auth}
        closeAllMenus={closeAllMenus}
        handleLogout={handleLogout}
        getInitials={getInitials}
        router={router}
      />
    </header>
  );
};

export default Navbar;
