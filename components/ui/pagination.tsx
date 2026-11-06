"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { getPaginationRange } from "@/lib/pagination";

export interface PaginationProps extends React.ComponentProps<"nav"> {
  page: number;
  totalPages: number;
  totalItems?: number;
  limit?: number;
  pageParamName?: string;
  limitParamName?: string;
  showItemCount?: boolean;
  className?: string;
}

/**
 * Reusable, responsive, accessible Pagination component matching the application design system.
 *
 * Requirements:
 * 1. Mobile (<640px): Previous/Next buttons + "Page X of Y" (no long row of numbers).
 * 2. Touch targets >= 44px on mobile, no horizontal overflow at 320px width.
 * 3. Tablet/desktop: Page numbers with ellipsis + Previous/Next + optional item count.
 * 4. Hides completely when totalPages <= 1.
 * 5. Preserves other query params in URL.
 * 6. Accessibility: <nav aria-label="Pagination">, aria-current="page", aria-disabled.
 */
export function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  pageParamName = "page",
  limitParamName = "limit",
  showItemCount = true,
  className,
  ...props
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If 1 or fewer pages, hide pagination component
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const currentPage = Math.max(1, Math.min(page, totalPages));

  // Build target URL while preserving existing query parameters
  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set(pageParamName, String(targetPage));
    if (limit) {
      params.set(limitParamName, String(limit));
    }
    return `${pathname}?${params.toString()}`;
  };

  const pages = getPaginationRange(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // Calculate item range e.g. "Showing 11–20 of 134"
  const startItem = limit ? (currentPage - 1) * limit + 1 : undefined;
  const endItem = limit && totalItems ? Math.min(currentPage * limit, totalItems) : undefined;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full font-sans", className)}
      {...props}
    >
      {/* Item count summary on desktop */}
      <div className="text-xs font-medium text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
        {showItemCount && totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Showing <strong className="text-navy-900 font-semibold">{startItem}</strong>&ndash;
            <strong className="text-navy-900 font-semibold">{endItem}</strong> of{" "}
            <strong className="text-navy-900 font-semibold">{totalItems}</strong> records
          </span>
        ) : (
          <span className="sm:hidden font-bold uppercase tracking-wider text-[11px]">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* Previous Button */}
        <Link
          href={isFirstPage ? "#" : createPageUrl(currentPage - 1)}
          aria-disabled={isFirstPage}
          tabIndex={isFirstPage ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] h-11 sm:h-9 px-3 gap-1 rounded-xl transition-all cursor-pointer font-sans",
            isFirstPage
              ? "opacity-40 pointer-events-none cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
              : "hover:border-gold-500 hover:text-navy-900 shadow-luxury-sm",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-semibold">Previous</span>
        </Link>

        {/* Mobile: compact "Page X of Y" */}
        <div className="sm:hidden px-3 py-2 text-xs font-bold text-navy-900 bg-card rounded-xl border border-border shadow-xs">
          {currentPage} / {totalPages}
        </div>

        {/* Tablet & Desktop: Numeric Page Buttons with Ellipsis */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <Link
                key={p}
                href={createPageUrl(p)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: isCurrent ? "navy" : "outline",
                    size: "sm",
                  }),
                  "h-9 min-w-[36px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  isCurrent
                    ? "bg-navy-900 text-gold-300 border border-gold-500/40 shadow-luxury-sm pointer-events-none"
                    : "hover:border-gold-500/50 hover:text-navy-900 text-muted-foreground",
                )}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        <Link
          href={isLastPage ? "#" : createPageUrl(currentPage + 1)}
          aria-disabled={isLastPage}
          tabIndex={isLastPage ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] h-11 sm:h-9 px-3 gap-1 rounded-xl transition-all cursor-pointer font-sans",
            isLastPage
              ? "opacity-40 pointer-events-none cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
              : "hover:border-gold-500 hover:text-navy-900 shadow-luxury-sm",
          )}
        >
          <span className="hidden sm:inline text-xs font-semibold">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}

export default Pagination;
