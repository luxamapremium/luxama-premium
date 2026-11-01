"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DesktopUserMenu } from "./DesktopUserMenu";
import { DesktopAuthButtonsProps } from "./types";

export const DesktopAuthButtons = ({
  isLoading,
  user,
  auth,
  getInitials,
  handleLogout,
  router,
}: DesktopAuthButtonsProps) => {
  return (
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
  );
};
