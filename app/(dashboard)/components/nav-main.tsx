"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Home,
  Timer,
  CalendarPlus,
  CalendarDays,
  UserRoundCog,
  ChevronRight,
  ClipboardPen,
  UserCheck,
  Calculator,
  Stamp,
  Briefcase,
  Languages,
} from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";

const FORM_CATEGORIES = [
  {
    title: "Immigration & USCIS Support",
    icon: <UserCheck className="size-4 shrink-0" />,
  },
  {
    title: "Tax & Financial Services",
    icon: <Calculator className="size-4 shrink-0" />,
  },
  {
    title: "Notary & Document Services",
    icon: <Stamp className="size-4 shrink-0" />,
  },
  {
    title: "Business & Administrative Services",
    icon: <Briefcase className="size-4 shrink-0" />,
  },
  {
    title: "Translation & Language Services",
    icon: <Languages className="size-4 shrink-0" />,
  },
];

export function NavMain() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const role = session?.user?.role;

  const createSlug = (text: string) =>
    text.replace(/&/g, "").replace(/\s+/g, "-").toLowerCase();

  // Updated getClass to handle active hover states with brand palette
  const getClass = (path: string) => {
    const isActive = pathname === path;
    return `transition-colors duration-200 font-sans ${
      isActive
        ? "bg-navy-900 text-gold-400 font-semibold hover:bg-navy-800 hover:text-gold-300"
        : "text-foreground/80 hover:bg-ice-100 hover:text-navy-900"
    }`;
  };

  if (isPending) return null;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* OVERVIEW */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={getClass("/dashboard")}>
              <Link href="/dashboard">
                <Home />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* ADMIN + SUPER ADMIN SECTION */}
          {(role === "super-admin" || role === "admin") && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={getClass("/admin/events")}
                >
                  <Link href="/admin/events">
                    <CalendarPlus />
                    <span>Services</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={getClass("/admin/schedule")}
                >
                  <Link href="/admin/schedule">
                    <CalendarDays />
                    <span>Schedule</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* COLLAPSIBLE BOOKINGS */}
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Bookings"
                      // We keep the trigger gray on hover, or use getClass if you want it blue when a child is active
                      className="transition-colors duration-200"
                    >
                      <Timer />
                      <span>Bookings</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          className={getClass("/admin/bookings")}
                        >
                          <Link href="/admin/bookings">
                            <span>My Bookings</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {role === "super-admin" && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            className={getClass("/admin/all-bookings")}
                          >
                            <Link href="/admin/all-bookings">
                              <span>All Bookings</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* COLLAPSIBLE SUBMISSIONS
              {role === "super-admin" && (
                <Collapsible asChild className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Forms"
                        className="transition-colors duration-200"
                      >
                        <ClipboardPen />
                        <span>Submissions</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {FORM_CATEGORIES.map((category) => {
                          const url = `/admin/submissions/${createSlug(category.title)}`;
                          return (
                            <SidebarMenuSubItem key={category.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={getClass(url)}
                              >
                                <Link
                                  href={url}
                                  className="flex items-center gap-2"
                                >
                                  {category.icon}
                                  <span>{category.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )} */}
            </>
          )}

          {/* USER ONLY */}
          {role === "user" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={getClass("/client/bookings")}
              >
                <Link href="/client/bookings">
                  <Timer />
                  <span>My Bookings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* SUPER ADMIN ONLY - MANAGE TEAM */}
          {role === "super-admin" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={getClass("/admin/manageAdmin")}
              >
                <Link href="/admin/manageAdmin">
                  <UserRoundCog />
                  <span>Manage Team</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
