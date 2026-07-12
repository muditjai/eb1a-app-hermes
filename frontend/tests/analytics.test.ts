import { afterEach, describe, expect, it, vi } from "vitest";

const posthogMock = vi.hoisted(() => ({
  capture: vi.fn(),
  init: vi.fn()
}));

vi.mock("posthog-js", () => ({
  default: posthogMock
}));

describe("analytics", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    posthogMock.capture.mockReset();
    posthogMock.init.mockReset();
  });

  it("configures session replay to show text and email inputs while masking passwords", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "ph_test_key");
    vi.stubEnv("VITE_POSTHOG_HOST", "https://events.example.com");

    await import("../src/analytics");

    expect(posthogMock.init).toHaveBeenCalledWith("ph_test_key", expect.objectContaining({
      api_host: "https://events.example.com",
      capture_pageview: false,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          email: false,
          password: true,
          text: false,
          textarea: false
        }
      }
    }));
  });
});
