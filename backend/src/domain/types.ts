export type UserRole = "anonymous" | "authenticated" | "paid";
export type PaywallReason = "login" | "payment" | null;

export interface ViewerAccessInput {
  role: UserRole;
  totalPages: number;
}

export interface ViewerAccess {
  allowedPages: number;
  paywall: PaywallReason;
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

export type PetitionStatus = "draft" | "published";

export interface Petition {
  id: string;
  title: string;
  jobProfile: string;
  company: string;
  location: string;
  criteria: string[];
  summary: string;
  totalPages: number;
  status: PetitionStatus;
  pdfUrl: string;
  originalFileName?: string;
  pdfBuffer?: Buffer;
  redactions: PageRedactions[];
  createdAt: string;
  updatedAt: string;
}

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

export type BinarySurveyAnswer = "yes" | "no";

export interface FeedbackSubmissionInput {
  buyerInterest: BinarySurveyAnswer;
  buyerPriceUsd: number | null;
  buyerComment: string | null;
  contributorInterest: BinarySurveyAnswer;
  contributorCompensationUsd: number | null;
  contributorComment: string | null;
  email: string | null;
}

export interface FeedbackSubmission extends FeedbackSubmissionInput {
  id: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  token: string;
  paidPetitionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PetitionPurchase {
  id: string;
  userId: string;
  userToken: string;
  petitionId: string;
  checkoutSessionId?: string;
  status: "paid";
  createdAt: string;
  updatedAt: string;
}
