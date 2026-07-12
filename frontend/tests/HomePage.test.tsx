import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "../src/pages/HomePage";
import type { PetitionSummary } from "../src/types";

const petitions: PetitionSummary[] = [
  {
    id: "p1",
    title: "Research Scientist EB1A",
    jobProfile: "Research Scientist",
    company: "Google",
    location: "Mountain View",
    criteria: ["awards", "original contribution"],
    summary: "AI research petition",
    totalPages: 12,
    redactionCount: 8,
    pdfUrl: "/api/petitions/p1/pdf"
  }
];

describe("HomePage", () => {
  it("shows an attractive searchable gallery with blurred PDF preview overlay", async () => {
    const search = vi.fn(async () => petitions);
    render(<HomePage searchPetitions={search} onOpenPetition={vi.fn()} />);

    expect(await screen.findByText("Research Scientist EB1A")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("wide-shell");
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search/i).closest("label")).toHaveClass("max-w-6xl");
    expect(screen.getByTestId("pdf-preview-viewport")).toHaveClass("min-h-[680px]");
    expect(screen.getByTestId("pdf-preview-blur")).toHaveClass("backdrop-blur-md");

    await userEvent.type(screen.getByLabelText(/search/i), "google awards");
    expect(search).toHaveBeenLastCalledWith("google awards");
  });
});
