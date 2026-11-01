"use client";

import { AppSidebar } from "./components/app-sidebar";
import { AppHeader } from "./components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="flex h-screen items-center justify-center font-sans bg-background text-foreground">
        <span className="text-muted-foreground animate-pulse font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className="font-sans [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_h4]:font-sans [&_h5]:font-sans [&_h6]:font-sans min-h-screen bg-background text-foreground">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 50)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="bg-background text-foreground">
          <AppHeader />
          <main className="flex flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
