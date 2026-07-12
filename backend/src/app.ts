import cors from "cors";
import express, { type Request } from "express";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import { z } from "zod";
import { getPageAccess } from "./domain/entitlements";
import { countRedactions, normalizeRedactions } from "./domain/redactions";
import type { FeedbackSubmissionInput, UserRole } from "./domain/types";
import { createAppStoreFromEnv, type AppStore } from "./repositories/app-store";
import { createPetitionRepository } from "./repositories/petition-repository";
import { createAuthService } from "./services/auth-service";
import { createPaymentService } from "./services/payment-service";

export interface AppConfig {
  stripeMode?: "mock" | "stripe";
  store?: AppStore;
}

interface UploadBody {
  title: string;
  jobProfile: string;
  company: string;
  location: string;
  summary?: string;
}

interface CheckoutBody {
  petitionId: string;
  successUrl: string;
  cancelUrl: string;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});
const uploadPetitionPdf = upload.single("petitionPdf") as unknown as express.RequestHandler;

const loginSchema = z.object({ email: z.string().email() });
const feedbackSchema = z.object({
  buyerInterest: z.enum(["yes", "no"]),
  buyerPriceUsd: z.number().min(0).nullable(),
  buyerComment: z.string().nullable(),
  contributorInterest: z.enum(["yes", "no"]),
  contributorCompensationUsd: z.number().min(0).nullable(),
  contributorComment: z.string().nullable(),
  email: z.string().email().nullable()
});
const checkoutSchema = z.object({
  petitionId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

function bearerToken(req: Request): string | undefined {
  const header = req.header("authorization") ?? "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7) : undefined;
}

function criteriaFromForm(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createApp(config: AppConfig = {}) {
  const app = express();
  const repo = createPetitionRepository();
  const store = config.store ?? createAppStoreFromEnv();
  const auth = createAuthService(store);
  const payments = createPaymentService({
    mode: config.stripeMode,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    priceId: process.env.STRIPE_PRICE_ID
  });

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("tiny"));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "eb1a.fyi-api" });
  });

  app.post("/api/feedback", async (req, res, next) => {
    try {
      const parsed = feedbackSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid feedback submission" });
      const submission = await store.saveFeedback(parsed.data as FeedbackSubmissionInput);
      res.status(201).json({ data: submission });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Valid email is required" });
    try {
      res.json({ data: await auth.login(parsed.data.email) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/me", async (req, res, next) => {
    try {
      const session = await auth.getSession(bearerToken(req));
      res.json({ data: session });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/petitions", (req, res) => {
    res.json({ data: repo.search({ query: String(req.query.query ?? "") }) });
  });

  app.get("/api/petitions/:id", (req, res) => {
    const petition = repo.findById(req.params.id);
    if (!petition || petition.status !== "published") return res.status(404).json({ error: "Petition not found" });
    res.json({ data: repo.toSummary(petition) });
  });

  app.get("/api/petitions/:id/access", async (req, res, next) => {
    const petition = repo.findById(req.params.id);
    if (!petition) return res.status(404).json({ error: "Petition not found" });
    try {
      const session = await auth.getSession(bearerToken(req));
      const paidForPetition = Boolean(session?.paidPetitionIds.includes(petition.id));
      const role: UserRole = paidForPetition ? "paid" : session ? "authenticated" : "anonymous";
      res.json({ data: getPageAccess({ role, totalPages: petition.totalPages }) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/petitions/:id/pdf", (req, res) => {
    const petition = repo.findById(req.params.id);
    if (!petition) return res.status(404).json({ error: "Petition not found" });
    res.type("application/pdf").send(petition.pdfBuffer ?? Buffer.from("%PDF-1.4\n%%EOF\n"));
  });

  app.post("/api/petitions/upload", uploadPetitionPdf, (req, res) => {
    if (!req.file) return res.status(400).json({ error: "petitionPdf PDF file is required" });
    const body = z
      .object({
        title: z.string().min(2),
        jobProfile: z.string().min(2),
        company: z.string().min(1),
        location: z.string().optional().default(""),
        summary: z.string().optional()
      })
      .safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "Missing required petition metadata" });

    const data = body.data as UploadBody;
    const petition = repo.create({
      ...data,
      criteria: criteriaFromForm(req.body.criteria),
      originalFileName: req.file.originalname,
      pdfBuffer: req.file.buffer
    });

    res.status(201).json({ data: { ...repo.toSummary(petition), status: petition.status } });
  });

  app.post("/api/petitions/:id/redactions", (req, res) => {
    const parsed = normalizeRedactions(req.body);
    const petition = repo.saveRedactions(req.params.id, parsed);
    if (!petition) return res.status(404).json({ error: "Petition not found" });
    res.json({ data: { id: petition.id, redactionCount: countRedactions(petition.redactions), redactions: petition.redactions } });
  });

  app.post("/api/petitions/:id/publish", (req, res) => {
    const petition = repo.publish(req.params.id);
    if (!petition) return res.status(404).json({ error: "Petition not found" });
    res.json({ data: { ...repo.toSummary(petition), status: petition.status } });
  });

  app.post("/api/payments/create-checkout-session", async (req, res, next) => {
    try {
      const token = bearerToken(req);
      const session = await auth.getSession(token);
      if (!token || !session) return res.status(401).json({ error: "Log in before checkout" });
      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid checkout request" });
      const data = parsed.data as CheckoutBody;
      const checkout = await payments.createCheckoutSession({ ...data, userToken: token });
      res.json({ data: checkout });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments/webhook", async (req, res, next) => {
    const userToken = req.body?.data?.object?.metadata?.userToken ?? req.body?.userToken;
    const petitionId = req.body?.data?.object?.metadata?.petitionId ?? req.body?.petitionId;
    const checkoutSessionId = req.body?.data?.object?.id ?? req.body?.checkoutSessionId;
    try {
      if (typeof userToken === "string" && typeof petitionId === "string") {
        await auth.markPaid(userToken, petitionId, typeof checkoutSessionId === "string" ? checkoutSessionId : undefined);
      }
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  });

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: error.message });
  });

  return app;
}
