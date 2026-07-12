import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const endpoints = [
  "GET /api/health",
  "GET /api/petitions",
  "GET /api/petitions/:id",
  "GET /api/petitions/:id/access",
  "GET /api/petitions/:id/pdf",
  "POST /api/petitions/upload",
  "POST /api/petitions/:id/redactions",
  "POST /api/petitions/:id/publish",
  "POST /api/auth/login",
  "GET /api/me",
  "POST /api/payments/create-checkout-session",
  "POST /api/payments/webhook"
];

describe("API sample request/response documentation", () => {
  it("documents every endpoint with samples", () => {
    const docs = readFileSync("../docs/api.md", "utf8");
    for (const endpoint of endpoints) {
      expect(docs).toContain(`### ${endpoint}`);
      const section = docs.slice(docs.indexOf(`### ${endpoint}`));
      expect(section).toContain("Sample request");
      expect(section).toContain("Sample response");
    }
  });
});
