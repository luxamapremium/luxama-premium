"use client";

import * as React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Calculator,
  Stamp,
  Briefcase,
  Languages,
  FileText,
  FileSpreadsheet,
  Scale,
  Building2,
  Globe,
  BriefcaseBusiness,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { createSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";

export interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

export interface NavbarProps {
  logo?: { url: string; src: string; alt: string };
  menu?: MenuItem[];
  auth?: {
    login: { text: string; url: string };
    signup: { text: string; url: string };
  };
}

const DEFAULT_MENU: MenuItem[] = [
  {
    title: "Appointments",
    url: "#",
    items: [
      {
        title: "Immigration & USCIS Support",
        description: "Schedule a consultation for USCIS application guidance",
        icon: <UserCheck className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Immigration USCIS Support")}`,
      },
      {
        title: "Tax & Financial Services",
        description: "Book an appointment for tax prep and financial planning",
        icon: <Calculator className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Tax Financial Services")}`,
      },
      {
        title: "Notary & Document Services",
        description: "Set a time for official document notarization",
        icon: <Stamp className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Notary Document Services")}`,
      },
      {
        title: "Business & Administrative Services",
        description: "Consult with us regarding business setup and admin",
        icon: <Briefcase className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Business Administrative Services")}`,
      },
      {
        title: "Translation & Language Services",
        description: "Book a professional interpreter or translator",
        icon: <Languages className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Translation Language Services")}`,
      },
    ],
  },
  {
    title: "Forms",
    url: "#",
    items: [
      {
        title: "Immigration & USCIS Support",
        description: "Select a specific USCIS form to begin your application",
        icon: <FileText className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: "#",
        items: [
          {
            title: "Form I-90 – Green Card Replacement",
            url: "/forms/immigration-uscis-support?form=form-i-90",
          },
          {
            title: "Form I-129f – Fiancé(E) / K-1 Visa",
            url: "/forms/immigration-uscis-support?form=form-i-129f",
          },
          {
            title: "Form I-130 – Petition For Alien Relative",
            url: "/forms/immigration-uscis-support?form=form-i-130",
          },
          {
            title: "Form I-130a – Spouse Beneficiary Information",
            url: "/forms/immigration-uscis-support?form=form-i-130a",
          },
          {
            title: "Form I-131 – Travel Document / Advance Parole",
            url: "/forms/immigration-uscis-support?form=form-i-131",
          },
          {
            title: "Form I-485 – Adjustment Of Status",
            url: "/forms/immigration-uscis-support?form=form-i-485",
          },
          {
            title: "Form I-589 – Asylum Application",
            url: "/forms/immigration-uscis-support?form=form-i-589",
          },
          {
            title: "Form I-751 – Remove Conditions On Green Card",
            url: "/forms/immigration-uscis-support?form=form-i-751",
          },
          {
            title: "Form I-765 – Work Permit Application",
            url: "/forms/immigration-uscis-support?form=form-i-765",
          },
          {
            title: "Form I-821 – Temporary Protected Status (TPS)",
            url: "/forms/immigration-uscis-support?form=form-i-821",
          },
          {
            title: "Form I-864 – Affidavit Of Support (Sponsorship)",
            url: "/forms/immigration-uscis-support?form=form-i-864",
          },
          {
            title: "Form N-400 – U.S. Citizenship (Naturalization)",
            url: "/forms/immigration-uscis-support?form=form-n-400",
          },
          {
            title: "Form N-600 – Certificate Of Citizenship",
            url: "/forms/immigration-uscis-support?form=form-n-600",
          },
        ],
      },
      {
        title: "Tax & Financial Services",
        description: "Fill out necessary tax documents and financial forms",
        icon: <FileSpreadsheet className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Tax Financial Services")}`,
      },
      {
        title: "Notary & Document Services",
        description: "Prepare your documents for legal notarization",
        icon: <Scale className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Notary Document Services")}`,
      },
      {
        title: "Business & Administrative Services",
        description: "Business registration and administrative paperwork",
        icon: <Building2 className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Business Administrative Services")}`,
      },
      {
        title: "Translation & Language Services",
        description: "Submit documents for certified translation services",
        icon: <Globe className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Translation Language Services")}`,
      },
      {
        title: "Business Formation Intake Form LLC",
        description: "Submit documents for LLC business",
        icon: <BriefcaseBusiness className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Business Formation Intake Form LLC")}`,
      },
    ],
  },
  { title: "About", url: "/about" },
  { title: "Contact", url: "/contact" },
];

export const Navbar = ({
  logo = { url: "/", src: "/logo.png", alt: "Luxama Premium Group" },
  menu = DEFAULT_MENU,
  auth = {
    login: { text: "Log in", url: "/auth/sign-in" },
    signup: { text: "Sign up", url: "/auth/sign-up" },
  },
}: NavbarProps) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSections, setOpenMobileSections] = useState<string[]>([]);
  const [selectedFormCategory, setSelectedFormCategory] = useState<string>(
    "Immigration & USCIS Support"
  );

  const navContainerRef = useRef<HTMLDivElement>(null);

  // Scroll detection for header style transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Better Auth session
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (isMounted && session?.data?.user) {
          setUser(session.data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setActiveDropdown(null);
      setIsMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileSection = (title: string) => {
    setOpenMobileSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const closeAllMenus = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "LX";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formsItem = menu.find((item) => item.title === "Forms");
  const appointmentsItem = menu.find((item) => item.title === "Appointments");
  const activeFormCategoryObj = formsItem?.items?.find(
    (item) => item.title === selectedFormCategory
  );

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
          <div className="flex items-center shrink-0">
            <Link
              href={logo.url}
              onClick={closeAllMenus}
              className="flex items-center gap-2 group transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
              aria-label={logo.alt}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* 2. Center: Tailark Header-4 Floating Capsule Navigation (Desktop lg+) */}
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
                      onClick={() => setActiveDropdown(null)}
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
                      onClick={() =>
                        setActiveDropdown(isOpen ? null : item.title)
                      }
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

          {/* 3. Right: Authentication / User State (Desktop lg+) */}
          <div className="hidden lg:flex items-center justify-end gap-3 shrink-0">
            {isLoading ? (
              <div className="h-9 w-28 rounded-full bg-muted/60 animate-pulse" />
            ) : user ? (
              <DesktopUserMenu
                user={user}
                getInitials={getInitials}
                handleLogout={handleLogout}
                router={router}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="rounded-full px-4 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/80"
                >
                  <Link href={auth.login.url}>{auth.login.text}</Link>
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  asChild
                  className="rounded-full px-5 text-sm font-semibold shadow-gold hover:shadow-gold-lg"
                >
                  <Link href={auth.signup.url}>{auth.signup.text}</Link>
                </Button>
              </div>
            )}
          </div>

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

        {/* ─── Tailark Header-4 Mega Dropdowns (Desktop lg+) ─────────────────── */}
        {activeDropdown === "Appointments" && appointmentsItem && (
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full pt-3 w-full max-w-4xl z-50">
            <div className="rounded-3xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-xl p-6 transition-all duration-200 animate-in fade-in-0 zoom-in-95">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column: Services list with icon boxes & descriptions */}
                <div className="col-span-7 space-y-1">
                  <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 pb-2">
                    Available Consultation Services
                  </div>
                  <div className="space-y-1">
                    {appointmentsItem.items?.map((sub) => (
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
        )}

        {activeDropdown === "Forms" && formsItem && (
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full pt-3 w-full max-w-5xl z-50">
            <div className="rounded-3xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-xl p-6 transition-all duration-200 animate-in fade-in-0 zoom-in-95">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column: Form categories */}
                <div className="col-span-5 space-y-1">
                  <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 pb-2">
                    Form Categories
                  </div>
                  <div className="space-y-1">
                    {formsItem.items?.map((cat) => {
                      const isSelected = selectedFormCategory === cat.title;
                      const hasSubforms = Boolean(cat.items && cat.items.length > 0);

                      return (
                        <div
                          key={cat.title}
                          onMouseEnter={() => setSelectedFormCategory(cat.title)}
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
                  {activeFormCategoryObj?.items && activeFormCategoryObj.items.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                        <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          {activeFormCategoryObj.title} Forms
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-300 font-medium">
                          {activeFormCategoryObj.items.length} Forms Available
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                        {activeFormCategoryObj.items.map((deep) => (
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
                        {activeFormCategoryObj?.icon || <FileText className="size-6" />}
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {activeFormCategoryObj?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                        {activeFormCategoryObj?.description ||
                          "Complete your submission online with our streamlined intake forms."}
                      </p>
                      {activeFormCategoryObj?.url && (
                        <Button variant="gold" size="sm" asChild className="rounded-full">
                          <Link href={activeFormCategoryObj.url} onClick={closeAllMenus}>
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
        )}
      </div>

      {/* ─── Mobile Menu Panel (fills viewport below header) ──────────────── */}
      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={cn(
          "absolute top-full left-0 right-0 w-full h-[calc(100dvh-100%)] bg-background border-t border-border/80 shadow-2xl z-50 lg:hidden flex flex-col transition-all duration-300 ease-out overflow-hidden",
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 visible pointer-events-auto"
            : "opacity-0 -translate-y-2 invisible pointer-events-none"
        )}
      >
        {/* Scrollable Links Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
          {menu.map((item) => {
            const hasSubmenu = Boolean(item.items && item.items.length > 0);
            const isOpen = openMobileSections.includes(item.title);

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
                  aria-expanded={isOpen}
                  className="flex items-center justify-between w-full p-3.5 text-base font-semibold text-foreground text-left cursor-pointer"
                >
                  <span>{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {isOpen && (
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
                    getInitials(user?.name || user?.email)
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
    </header>
  );
};

// ─── Desktop User Profile Menu ──────────────────────────────────────────────
function DesktopUserMenu({
  user,
  getInitials,
  handleLogout,
  router,
}: {
  user: any;
  getInitials: (name: string) => string;
  handleLogout: () => void;
  router: ReturnType<typeof useRouter>;
}) {
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
            getInitials(user?.name || user?.email)
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
}

export default Navbar;
