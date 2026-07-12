import { describe, expect, it } from "vitest";
import { getPageAccess } from "../src/domain/entitlements";

describe("viewer page entitlements", () => {
  it("allows anonymous visitors to preview only page 1", () => {
    expect(getPageAccess({ role: "anonymous", totalPages: 10 })).toEqual({ allowedPages: 1, paywall: "login" });
  });

  it("allows signed-in users two more pages before payment", () => {
    expect(getPageAccess({ role: "authenticated", totalPages: 10 })).toEqual({ allowedPages: 3, paywall: "payment" });
  });

  it("allows paid users to view the full petition", () => {
    expect(getPageAccess({ role: "paid", totalPages: 10 })).toEqual({ allowedPages: 10, paywall: null });
  });
});
