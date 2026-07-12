export interface PetitionSummary {
  id: string;
  title: string;
  jobProfile: string;
  company: string;
  location: string;
  criteria: string[];
  summary: string;
  totalPages: number;
  redactionCount: number;
  pdfUrl: string;
}

export interface ViewerAccess {
  allowedPages: number;
  paywall: "login" | "payment" | null;
}

export interface RedactionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface PageRedactions {
  page: number;
  pageWidth: number;
  pageHeight: number;
  boxes: RedactionBox[];
}

export interface UploadPetitionInput {
  title: string;
  jobProfile: string;
  company: string;
  location: string;
  criteria: string;
  file: File;
}
