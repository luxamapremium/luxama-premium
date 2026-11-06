import { z } from "zod";

/**
 * Shared, reusable pagination helper for backend queries and server actions.
 * Enforces Zod validation, safe fallbacks (never 500s), skip/limit calculation,
 * deterministic sort tie-breakers, and uniform PaginatedResult response format.
 */

export const MAX_PAGE_LIMIT = 100;
export const DEFAULT_PAGE_LIMIT = 10;

export interface PaginationInput {
  page?: unknown;
  limit?: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Safely parse and validate pagination parameters with Zod.
 * Invalid, negative, NaN, or out-of-bounds parameters safely fall back to defaults.
 */
export function parsePaginationParams(
  input?: PaginationInput,
  customDefaultLimit = DEFAULT_PAGE_LIMIT,
  maxLimit = MAX_PAGE_LIMIT,
): PaginationParams {
  const schema = z.object({
    page: z.preprocess((val) => {
      const num = Number(val);
      return Number.isFinite(num) && num >= 1 ? Math.floor(num) : 1;
    }, z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => {
      const num = Number(val);
      if (!Number.isFinite(num) || num < 1) return customDefaultLimit;
      const floored = Math.floor(num);
      return Math.min(Math.max(1, floored), maxLimit);
    }, z.number().int().min(1).max(maxLimit).default(customDefaultLimit)),
  });

  const parsed = schema.safeParse(input ?? {});
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : customDefaultLimit;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Ensures sort order is deterministic by appending _id as a tie-breaker
 * if _id is not already present in the sort definition.
 */
export function withDeterministicSort<T extends Record<string, 1 | -1>>(
  sort: T,
  tieBreakerDirection: 1 | -1 = -1,
): T & { _id: 1 | -1 } {
  if ("_id" in sort) {
    return { ...sort } as T & { _id: 1 | -1 };
  }
  return {
    ...sort,
    _id: tieBreakerDirection,
  };
}

/**
 * Builds a standardized PaginatedResult object.
 * Correctly handles out-of-range pages by returning items: [] with accurate totalPages/metadata.
 */
export function buildPaginationResponse<T>({
  items,
  totalItems,
  page,
  limit,
}: {
  items: T[];
  totalItems: number;
  page: number;
  limit: number;
}): PaginatedResult<T> {
  const validTotalItems = Math.max(0, Math.floor(totalItems));
  const validLimit = Math.max(1, Math.floor(limit));
  const totalPages = Math.ceil(validTotalItems / validLimit);
  const validPage = Math.max(1, Math.floor(page));

  return {
    items: Array.isArray(items) ? items : [],
    page: validPage,
    limit: validLimit,
    totalItems: validTotalItems,
    totalPages,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1 && (totalPages === 0 || validPage <= totalPages + 1),
  };
}

/**
 * Generate visible page numbers with ellipsis for tablet/desktop
 */
export function getPaginationRange(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If near the beginning
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  // If near the end
  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

