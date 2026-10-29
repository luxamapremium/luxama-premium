"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { NavbarUser } from "./types";

export function useNavbarAuth(onLoggedOut?: () => void) {
  const router = useRouter();
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      if (onLoggedOut) {
        onLoggedOut();
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    user,
    setUser,
    isLoading,
    handleLogout,
    router,
  };
}
