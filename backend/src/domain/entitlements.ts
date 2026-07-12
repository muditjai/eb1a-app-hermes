import type { ViewerAccess, ViewerAccessInput } from "./types";

export function getPageAccess(input: ViewerAccessInput): ViewerAccess {
  const totalPages = Math.max(0, Math.floor(input.totalPages));

  if (input.role === "paid") {
    return { allowedPages: totalPages, paywall: null };
  }

  if (input.role === "authenticated") {
    return { allowedPages: Math.min(3, totalPages), paywall: totalPages > 3 ? "payment" : null };
  }

  return { allowedPages: Math.min(1, totalPages), paywall: totalPages > 1 ? "login" : null };
}
