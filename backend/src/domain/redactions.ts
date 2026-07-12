import { z } from "zod";
import type { PageRedactions, RedactionBox } from "./types";

export const redactionsSchema = z.object({
  page: z.coerce.number().int().positive(),
  pageWidth: z.coerce.number().positive(),
  pageHeight: z.coerce.number().positive(),
  boxes: z.array(
    z.object({
      x: z.coerce.number(),
      y: z.coerce.number(),
      width: z.coerce.number().positive(),
      height: z.coerce.number().positive(),
      label: z.string().trim().optional()
    })
  )
});

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeBox(box: RedactionBox, pageWidth: number, pageHeight: number): RedactionBox {
  const x = clamp(box.x, 0, pageWidth);
  const y = clamp(box.y, 0, pageHeight);
  const width = clamp(box.width, 0, pageWidth - x);
  const height = clamp(box.height, 0, pageHeight - y);
  return { x, y, width, height, ...(box.label ? { label: box.label } : {}) };
}

export function normalizeRedactions(input: PageRedactions): PageRedactions {
  const parsed = redactionsSchema.parse(input);
  const boxes = parsed.boxes as RedactionBox[];
  return {
    page: parsed.page,
    pageWidth: parsed.pageWidth,
    pageHeight: parsed.pageHeight,
    boxes: boxes.map((box) => normalizeBox(box, parsed.pageWidth, parsed.pageHeight))
  };
}

export function countRedactions(redactions: PageRedactions[]): number {
  return redactions.reduce((count, page) => count + page.boxes.length, 0);
}
