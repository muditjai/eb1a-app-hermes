import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PdfViewer } from "../src/components/PdfViewer";
import type { PetitionSummary, ViewerAccess } from "../src/types";

const petition: PetitionSummary = {
  id: "p1",
  title: "Founder EB1A",
  jobProfile: "Founder",
  company: "Acme",
  location: "Austin",
  criteria: ["critical role"],
  summary: "Founder petition",
  totalPages: 8,
  redactionCount: 4,
  pdfUrl: "/api/petitions/p1/pdf"
};

describe("PdfViewer", () => {
  it("prompts login after one page for anonymous users", async () => {
    const access: ViewerAccess = { allowedPages: 1, paywall: "login" };
    render(<PdfViewer petition={petition} access={access} onLogin={vi.fn()} onPay={vi.fn()} />);

    expect(screen.getByTestId("actual-pdf-page")).toHaveClass("aspect-[210/297]");
    expect(screen.getByTestId("actual-pdf-page").parentElement).toHaveClass("max-w-none");
    expect(screen.getByTestId("pdf-page-blur")).toHaveClass("h-[70%]");

    await userEvent.click(screen.getByRole("button", { name: /continue reading/i }));
    expect(screen.getByText(/log in to view 2 more pages/i)).toBeInTheDocument();
  });

  it("prompts payment after three pages for signed-in unpaid users", async () => {
    const access: ViewerAccess = { allowedPages: 3, paywall: "payment" };
    render(<PdfViewer petition={petition} access={access} onLogin={vi.fn()} onPay={vi.fn()} />);

    expect(screen.getAllByTestId("actual-pdf-page")).toHaveLength(3);

    await userEvent.click(screen.getByRole("button", { name: /continue reading/i }));
    expect(screen.getByText(/unlock the full petition/i)).toBeInTheDocument();
  });
});
