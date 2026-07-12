import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UploadPage } from "../src/pages/UploadPage";

describe("UploadPage", () => {
  it("uploads petition metadata and saves creator redactions", async () => {
    const api = {
      uploadPetition: vi.fn(async () => ({ id: "draft-1", title: "ML Engineer EB1A" })),
      saveRedactions: vi.fn(async () => undefined),
      publishPetition: vi.fn(async () => undefined)
    };
    render(<UploadPage api={api} />);

    await userEvent.type(screen.getByLabelText(/petition title/i), "ML Engineer EB1A");
    await userEvent.type(screen.getByLabelText(/job profile/i), "ML Engineer");
    await userEvent.type(screen.getByLabelText(/company/i), "OpenAI");
    await userEvent.upload(screen.getByLabelText(/pdf file/i), new File(["pdf"], "petition.pdf", { type: "application/pdf" }));
    await userEvent.click(screen.getByRole("button", { name: /upload and redact/i }));

    expect(await screen.findByText(/redaction workspace/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /add pii redaction box/i }));
    await userEvent.click(screen.getByRole("button", { name: /save redactions/i }));

    expect(api.saveRedactions).toHaveBeenCalledWith("draft-1", expect.objectContaining({ boxes: expect.any(Array) }));
  });
});
