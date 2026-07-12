import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlaceholderHomePage } from "../src/pages/PlaceholderHomePage";

describe("PlaceholderHomePage", () => {
  it("matches the production placeholder landing page and links to feedback", async () => {
    const onGiveFeedback = vi.fn();
    render(<PlaceholderHomePage onGiveFeedback={onGiveFeedback} />);

    expect(screen.getByRole("main")).toHaveClass("placeholder-shell");
    expect(screen.getByText("eb1a.fyi")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Approved EB1A/O1 petitions" })).toBeInTheDocument();
    expect(screen.getByText(/A website to find, view, and share redacted approved petitions/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Give Feedback/i }));
    expect(onGiveFeedback).toHaveBeenCalledOnce();
  });
});
