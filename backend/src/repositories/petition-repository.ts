import { v4 as uuid } from "uuid";
import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { countRedactions, normalizeRedactions } from "../domain/redactions";
import type { PageRedactions, Petition, PetitionSummary } from "../domain/types";

export interface SearchPetitionsInput {
  query?: string;
}

export interface CreatePetitionInput {
  title: string;
  jobProfile: string;
  company: string;
  location: string;
  criteria: string[];
  summary?: string;
  originalFileName?: string;
  pdfBuffer?: Buffer;
}

const now = () => new Date().toISOString();

const samplePdfPath = path.join(process.cwd(), "assets", "sample-redacted-eb1a.pdf");
const seedPdf = existsSync(samplePdfPath)
  ? readFileSync(samplePdfPath)
  : Buffer.from(`%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n`);

function toSummary(petition: Petition): PetitionSummary {
  return {
    id: petition.id,
    title: petition.title,
    jobProfile: petition.jobProfile,
    company: petition.company,
    location: petition.location,
    criteria: petition.criteria,
    summary: petition.summary,
    totalPages: petition.totalPages,
    redactionCount: countRedactions(petition.redactions),
    pdfUrl: petition.pdfUrl
  };
}

function searchableText(petition: Petition): string {
  return [petition.title, petition.jobProfile, petition.company, petition.location, petition.summary, ...petition.criteria]
    .join(" ")
    .toLowerCase();
}

export function createPetitionRepository(initialPetitions: Petition[] = seedPetitions()) {
  const petitions = new Map(initialPetitions.map((petition) => [petition.id, petition]));

  return {
    search(input: SearchPetitionsInput = {}): PetitionSummary[] {
      const tokens = (input.query ?? "")
        .toLowerCase()
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);

      return Array.from(petitions.values())
        .filter((petition) => petition.status === "published")
        .filter((petition) => tokens.every((token) => searchableText(petition).includes(token)))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(toSummary);
    },

    findById(id: string): Petition | undefined {
      return petitions.get(id);
    },

    create(input: CreatePetitionInput): Petition {
      const timestamp = now();
      const id = `petition_${uuid()}`;
      const petition: Petition = {
        id,
        title: input.title,
        jobProfile: input.jobProfile,
        company: input.company,
        location: input.location,
        criteria: input.criteria,
        summary: input.summary || `${input.jobProfile} EB1A petition from ${input.company}`,
        totalPages: 12,
        status: "draft",
        pdfUrl: `/api/petitions/${id}/pdf`,
        originalFileName: input.originalFileName,
        pdfBuffer: input.pdfBuffer,
        redactions: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      petitions.set(id, petition);
      return petition;
    },

    saveRedactions(id: string, pageRedactions: PageRedactions): Petition | undefined {
      const petition = petitions.get(id);
      if (!petition) return undefined;
      const normalized = normalizeRedactions(pageRedactions);
      const otherPages = petition.redactions.filter((page) => page.page !== normalized.page);
      const updated = { ...petition, redactions: [...otherPages, normalized], updatedAt: now() };
      petitions.set(id, updated);
      return updated;
    },

    publish(id: string): Petition | undefined {
      const petition = petitions.get(id);
      if (!petition) return undefined;
      const updated = { ...petition, status: "published" as const, updatedAt: now() };
      petitions.set(id, updated);
      return updated;
    },

    toSummary
  };
}

function seedPetitions(): Petition[] {
  const timestamp = "2026-01-01T00:00:00.000Z";
  return [
    {
      id: "seed-research-scientist",
      title: "Research Scientist EB1A petition",
      jobProfile: "Research Scientist",
      company: "Google",
      location: "Mountain View, CA",
      criteria: ["awards", "original contribution", "scholarly articles", "NIW reference"],
      summary: "Approved AI research scientist EB1A with NIW context, awards, citations, and original contributions.",
      totalPages: 11,
      status: "published",
      pdfUrl: "/api/petitions/seed-research-scientist/pdf",
      pdfBuffer: seedPdf,
      redactions: [{ page: 1, pageWidth: 800, pageHeight: 1000, boxes: [{ x: 40, y: 70, width: 260, height: 32, label: "name" }] }],
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "seed-founder",
      title: "Founder EB1A petition",
      jobProfile: "Founder",
      company: "Venture-backed startup",
      location: "Bengaluru, India",
      criteria: ["critical role", "original contribution", "press", "high salary"],
      summary: "Founder from India showing original contribution, critical role, media, and business impact evidence.",
      totalPages: 14,
      status: "published",
      pdfUrl: "/api/petitions/seed-founder/pdf",
      pdfBuffer: seedPdf,
      redactions: [{ page: 1, pageWidth: 800, pageHeight: 1000, boxes: [{ x: 80, y: 120, width: 200, height: 28, label: "address" }] }],
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z"
    },
    {
      id: "seed-unpublished",
      title: "Unpublished draft",
      jobProfile: "Designer",
      company: "Unpublished Co",
      location: "Remote",
      criteria: ["unpublished"],
      summary: "Should not be visible in public search.",
      totalPages: 5,
      status: "draft",
      pdfUrl: "/api/petitions/seed-unpublished/pdf",
      pdfBuffer: seedPdf,
      redactions: [],
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];
}
