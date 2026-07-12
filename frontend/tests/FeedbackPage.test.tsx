import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FeedbackPage } from "../src/pages/FeedbackPage";

describe("FeedbackPage", () => {
  it("collects buyer and contributor feedback from the GitHub feedback flow", async () => {
    const submitFeedback = vi.fn(async () => undefined);
    render(<FeedbackPage submitFeedback={submitFeedback} />);

    expect(screen.queryByRole("button", { name: /Back to petitions/i })).not.toBeInTheDocument();
    expect(screen.getByText(/60-second survey/i)).toBeInTheDocument();
    expect(screen.getByText(/Approved EB1A\/O1 petitions/i)).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "Yes" })[0]);
    expect(screen.getByLabelText(/How much would you pay/i)).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "No" })[1]);
    await userEvent.type(screen.getAllByLabelText(/Any suggestions/i)[1], "Need more founder examples");
    await userEvent.click(screen.getByRole("button", { name: /Submit feedback/i }));

    expect(submitFeedback).toHaveBeenCalledWith(expect.objectContaining({
      buyerInterest: "yes",
      buyerPriceUsd: 250,
      contributorInterest: "no",
      contributorComment: "Need more founder examples"
    }));
    expect(await screen.findByText(/Thanks/i)).toBeInTheDocument();
  });
});
