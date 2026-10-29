"use client";

import * as React from "react";
import Link from "next/link";
import { NavbarLogoProps } from "./types";

export const NavbarLogo = ({ logo, onClick }: NavbarLogoProps) => {
  return (
    <div className="flex items-center shrink-0">
      <Link
        href={logo.url}
        onClick={onClick}
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
  );
};
