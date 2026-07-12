import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const root = process.cwd();
const outputTargets = [
  path.join(root, "backend", "assets", "sample-redacted-eb1a.pdf"),
  path.join(root, "frontend", "public", "samples", "sample-redacted-eb1a.pdf")
];

const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

function text(page, value, x, y, size = 11, isBold = false) {
  page.drawText(value, { x, y, size, font: isBold ? bold : font, color: rgb(0.1, 0.12, 0.18) });
}

function redaction(page, x, y, width, height, label = "REDACTED") {
  page.drawRectangle({ x, y, width, height, color: rgb(0.02, 0.02, 0.03) });
  page.drawText(label, { x: x + 8, y: y + height / 2 - 4, size: 8, font: bold, color: rgb(1, 1, 1) });
}

const pages = [
  {
    title: "Sample EB1A Petition — Research Scientist",
    subtitle: "Redacted public preview for eb1a.fyi",
    bullets: [
      "Criterion 1: Original scientific contributions of major significance",
      "Criterion 2: Scholarly articles in professional publications",
      "Criterion 3: Judge of the work of others",
      "Criterion 4: Leading or critical role for distinguished organizations"
    ]
  },
  {
    title: "Evidence Summary",
    subtitle: "How the petition organizes proof by USCIS criterion",
    bullets: [
      "Citation evidence and independent adoption by industry teams",
      "Recommendation letters from recognized experts",
      "Conference program committee and peer review service",
      "Product impact metrics tied to deployed ML systems"
    ]
  },
  {
    title: "Final Merits Determination",
    subtitle: "Public-facing sample language with PII removed",
    bullets: [
      "Sustained acclaim is supported by third-party evidence",
      "Work has been used by teams beyond the petitioner’s employer",
      "Record includes objective metrics, letters, and publication history",
      "This sample is synthetic and not legal advice"
    ]
  }
];

for (const [index, pageData] of pages.entries()) {
  const page = pdf.addPage([612, 792]);
  text(page, "eb1a.fyi", 48, 740, 12, true);
  text(page, `Page ${index + 1} of ${pages.length}`, 500, 740, 10);
  text(page, pageData.title, 48, 700, 22, true);
  text(page, pageData.subtitle, 48, 674, 12);
  page.drawLine({ start: { x: 48, y: 650 }, end: { x: 564, y: 650 }, thickness: 1, color: rgb(0.82, 0.86, 0.91) });

  text(page, "Petitioner:", 48, 612, 12, true);
  redaction(page, 128, 605, 190, 22, "NAME");
  text(page, "Receipt number:", 340, 612, 12, true);
  redaction(page, 440, 605, 96, 22, "ID");

  text(page, "Public petition excerpt", 48, 562, 15, true);
  let y = 532;
  for (const bullet of pageData.bullets) {
    text(page, `• ${bullet}`, 66, y, 11);
    y -= 30;
  }

  text(page, "Selected excerpt", 48, y - 20, 15, true);
  const paragraph = [
    "The petitioner has established a record of achievements through independent documentation,",
    "expert testimony, publications, and evidence of influence in the field. Personal identifiers,",
    "addresses, employer-sensitive details, and receipt numbers have been redacted for safe sharing."
  ];
  y -= 50;
  for (const line of paragraph) {
    text(page, line, 66, y, 11);
    y -= 22;
  }

  redaction(page, 66, y - 6, 260, 20, "EMAIL / PHONE");
  redaction(page, 66, y - 42, 420, 20, "HOME ADDRESS");

  page.drawRectangle({ x: 48, y: 56, width: 516, height: 72, borderColor: rgb(0.8, 0.84, 0.9), borderWidth: 1, color: rgb(0.96, 0.98, 1) });
  text(page, "Sample only", 66, 100, 12, true);
  text(page, "This generated PDF demonstrates how redacted EB1A petitions should appear in previews.", 66, 78, 10);
}

const bytes = await pdf.save();
for (const target of outputTargets) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  console.log(target);
}
