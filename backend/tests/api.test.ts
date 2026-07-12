import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const app = createApp({ stripeMode: "mock" });

describe("EB1A API", () => {
  it("reports health", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body).toMatchObject({ status: "ok", service: "eb1a.fyi-api" });
  });

  it("lists and searches published petitions", async () => {
    const res = await request(app).get("/api/petitions?query=google%20awards").expect(200);
    expect(res.body.data[0]).toMatchObject({ id: "seed-research-scientist", company: "Google" });
  });

  it("uploads a petition draft with a PDF and metadata", async () => {
    const fixture = path.join(process.cwd(), "tests", "fixtures", "sample.pdf");
    const res = await request(app)
      .post("/api/petitions/upload")
      .field("title", "Senior ML Engineer EB1A")
      .field("jobProfile", "ML Engineer")
      .field("company", "OpenAI")
      .field("location", "San Francisco")
      .field("criteria", "original contribution,critical role")
      .attach("petitionPdf", fixture)
      .expect(201);

    expect(res.body.data).toMatchObject({ title: "Senior ML Engineer EB1A", status: "draft", company: "OpenAI" });
  });

  it("saves redactions and publishes a petition", async () => {
    const fixture = path.join(process.cwd(), "tests", "fixtures", "sample.pdf");
    const uploaded = await request(app)
      .post("/api/petitions/upload")
      .field("title", "Product Leader EB1A")
      .field("jobProfile", "Product Manager")
      .field("company", "Stripe")
      .field("location", "New York")
      .field("criteria", "high salary,critical role")
      .attach("petitionPdf", fixture)
      .expect(201);

    const id = uploaded.body.data.id;
    await request(app)
      .post(`/api/petitions/${id}/redactions`)
      .send({ page: 1, pageWidth: 800, pageHeight: 1000, boxes: [{ x: 10, y: 10, width: 120, height: 40, label: "name" }] })
      .expect(200);

    const published = await request(app).post(`/api/petitions/${id}/publish`).expect(200);
    expect(published.body.data).toMatchObject({ id, status: "published", redactionCount: 1 });
  });

  it("logs in and creates a Stripe checkout session in mock mode", async () => {
    const login = await request(app).post("/api/auth/login").send({ email: "reader@example.com" }).expect(200);
    expect(login.body.data.token).toContain("user_");

    const checkout = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", `Bearer ${login.body.data.token}`)
      .send({ petitionId: "seed-founder", successUrl: "https://eb1a.fyi/success", cancelUrl: "https://eb1a.fyi/cancel" })
      .expect(200);

    expect(checkout.body.data.url).toContain("stripe.mock");
  });

  it("returns page access limits for anonymous and logged-in users", async () => {
    const anonymous = await request(app).get("/api/petitions/seed-founder/access").expect(200);
    expect(anonymous.body.data).toMatchObject({ allowedPages: 1, paywall: "login" });

    const login = await request(app).post("/api/auth/login").send({ email: "reader@example.com" }).expect(200);
    const authenticated = await request(app)
      .get("/api/petitions/seed-founder/access")
      .set("Authorization", `Bearer ${login.body.data.token}`)
      .expect(200);
    expect(authenticated.body.data).toMatchObject({ allowedPages: 3, paywall: "payment" });
  });
});
