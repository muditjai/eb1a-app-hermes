import posthog from "posthog-js";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY || "";
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

export const analyticsEnabled = Boolean(posthogKey);

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    defaults: "2026-05-30",
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        email: false,
        password: true,
        text: false,
        textarea: false
      }
    }
  });
}

export function capture(eventName: string, properties?: Record<string, unknown>) {
  if (!analyticsEnabled) return;
  posthog.capture(eventName, properties);
}

export function capturePageview() {
  capture("$pageview", {
    path: window.location.pathname,
    host: window.location.host
  });
}
