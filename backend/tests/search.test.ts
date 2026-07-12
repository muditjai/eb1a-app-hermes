import { describe, expect, it } from "vitest";
import { createPetitionRepository } from "../src/repositories/petition-repository";

describe("petition repository search", () => {
  it("finds published petitions by profile, company, location, and criteria", () => {
    const repo = createPetitionRepository();

    expect(repo.search({ query: "research scientist google niw awards" }).map((petition) => petition.id)).toContain("seed-research-scientist");
    expect(repo.search({ query: "founder india original contribution" }).map((petition) => petition.id)).toContain("seed-founder");
    expect(repo.search({ query: "unpublished" })).toHaveLength(0);
  });
});
