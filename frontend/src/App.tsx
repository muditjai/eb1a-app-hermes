import { useCallback, useState } from "react";
import { apiClient } from "./api/client";
import { PdfViewer } from "./components/PdfViewer";
import { Button } from "./components/ui/Button";
import { FeedbackPage } from "./pages/FeedbackPage";
import { HomePage } from "./pages/HomePage";
import { UploadPage } from "./pages/UploadPage";
import type { PetitionSummary, ViewerAccess } from "./types";

type AppRoute = "home" | "upload" | "viewer" | "feedback";

function initialRoute(): AppRoute {
  return window.location.pathname.startsWith("/feedback") ? "feedback" : "home";
}

export function App() {
  const [route, setRouteState] = useState<AppRoute>(initialRoute);
  const [selected, setSelected] = useState<PetitionSummary | null>(null);
  const [access, setAccess] = useState<ViewerAccess>({ allowedPages: 1, paywall: "login" });

  const searchPetitions = useCallback((query: string) => apiClient.searchPetitions(query), []);

  function setRoute(nextRoute: AppRoute) {
    setRouteState(nextRoute);
    const nextPath = nextRoute === "feedback" ? "/feedback" : "/";
    window.history.pushState({}, "", nextPath);
  }

  async function openPetition(petition: PetitionSummary) {
    setSelected(petition);
    setAccess(await apiClient.getAccess(petition.id));
    setRouteState("viewer");
  }

  if (route === "upload") {
    return <UploadPage api={apiClient} />;
  }

  if (route === "feedback") {
    return <FeedbackPage />;
  }

  if (route === "viewer" && selected) {
    return (
      <main className="pdf-shell">
        <div className="mx-auto flex w-full max-w-[1180px] justify-between gap-3 px-2">
          <Button onClick={() => setRoute("home")}>Back home</Button>
          <div className="flex gap-3">
            <Button onClick={() => setRoute("feedback")}>Give feedback</Button>
            <Button onClick={() => setRoute("upload")}>Share a petition</Button>
          </div>
        </div>
        <PdfViewer petition={selected} access={access} onLogin={() => alert("Login modal placeholder")} onPay={() => alert("Stripe checkout placeholder")} />
      </main>
    );
  }

  return (
    <>
      <div className="fixed right-6 top-6 z-10 flex gap-3">
        <Button onClick={() => setRoute("feedback")}>Give feedback</Button>
        <Button onClick={() => setRoute("upload")}>Share a petition</Button>
      </div>
      <HomePage searchPetitions={searchPetitions} onOpenPetition={openPetition} />
    </>
  );
}
