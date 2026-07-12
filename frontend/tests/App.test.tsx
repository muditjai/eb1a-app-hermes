import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

describe("App landing flag", () => {
  it("shows the placeholder landing page by default", () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Approved EB1A/O1 petitions" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/search petitions/i)).not.toBeInTheDocument();
  });
});
