import { PDFDocument, rgb } from "pdf-lib";
import type { PageRedactions } from "../domain/types";

export async function burnInRedactions(pdfBytes: Buffer, redactions: PageRedactions[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  for (const pageRedactions of redactions) {
    const page = pages[pageRedactions.page - 1];
    if (!page) continue;
    const { height } = page.getSize();
    for (const box of pageRedactions.boxes) {
      page.drawRectangle({
        x: box.x,
        y: height - box.y - box.height,
        width: box.width,
        height: box.height,
        color: rgb(0, 0, 0)
      });
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
