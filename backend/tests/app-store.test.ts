import { describe, expect, it } from "vitest";
import {
  defaultMongoDbNameForEnv,
  mongoAppStoreIndexSpecs,
  mongoCollections,
  mongoDatabaseNames,
  normalizeFeedbackInput
} from "../src/repositories/app-store";

describe("app store MongoDB configuration", () => {
  it("uses v2-specific dev and prod database names", () => {
    expect(defaultMongoDbNameForEnv({ NODE_ENV: "development" })).toBe(mongoDatabaseNames.development);
    expect(defaultMongoDbNameForEnv({ NODE_ENV: "test" })).toBe(mongoDatabaseNames.development);
    expect(defaultMongoDbNameForEnv({ NODE_ENV: "production" })).toBe(mongoDatabaseNames.production);
    expect(defaultMongoDbNameForEnv({ MONGODB_DB_NAME: "custom_feedback_db" })).toBe("custom_feedback_db");
  });

  it("declares query indexes for feedback and account collections", () => {
    const specs = mongoAppStoreIndexSpecs();
    const feedback = specs.find((spec) => spec.collection === mongoCollections.feedbackSubmissions);

    expect(feedback?.indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "feedback_created_at_desc", key: { createdAt: -1 } }),
        expect.objectContaining({ name: "feedback_email_sparse", key: { email: 1 }, sparse: true }),
        expect.objectContaining({ name: "feedback_interest_segment", key: { buyerInterest: 1, contributorInterest: 1 } })
      ])
    );
  });
});

describe("feedback normalization", () => {
  it("stores only fields that match the selected answers", () => {
    expect(
      normalizeFeedbackInput({
        buyerInterest: "no",
        buyerPriceUsd: 275,
        buyerComment: "  Too expensive without samples from my field  ",
        contributorInterest: "yes",
        contributorCompensationUsd: 25,
        contributorComment: "  I would not share  ",
        email: "  READER@EXAMPLE.COM  "
      })
    ).toEqual({
      buyerInterest: "no",
      buyerPriceUsd: null,
      buyerComment: "Too expensive without samples from my field",
      contributorInterest: "yes",
      contributorCompensationUsd: 25,
      contributorComment: null,
      email: "reader@example.com"
    });
  });
});
