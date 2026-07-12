import { describe, expect, it } from "vitest";
import { normalizeRedactions } from "../src/domain/redactions";

describe("redaction normalization", () => {
  it("keeps redaction boxes inside the page viewport and preserves labels", () => {
    const result = normalizeRedactions({
      page: 1,
      pageWidth: 800,
      pageHeight: 1000,
      boxes: [{ x: -5, y: 900, width: 2000, height: 200, label: "home address" }]
    });

    expect(result.boxes).toEqual([{ x: 0, y: 900, width: 800, height: 100, label: "home address" }]);
  });
});
