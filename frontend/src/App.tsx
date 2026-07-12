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
  const [route, setRoute] = useState<AppRoute>(initialRoute);
  const [selected, setSelected] = useState<PetitionSummary | null>(null);
  const [access, setAccess] = useState<ViewerAccess>({ allowedPages: 1, paywall: "login" });

  const searchPetitions = useCallback((query: string) => apiClient.searchPetitions(query), []);

  async function openPetition(petition: PetitionSummary) {
    setSelected(petition);
    setAccess(await apiClient.getAccess(petition.id));
    setRoute("viewer");
  }

  if (route === "upload") {
    return <UploadPage api={apiClient} />;
  }

  if (route === "feedback") {
    return <FeedbackPage onBackHome={() => setRoute("home")} />;
  }

  if (route === "viewer" && selected) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_32%),#020617] px-6 py-8 text-white">
        <div className="mx-auto mb-6 flex max-w-6xl justify-between">
          <Button className="bg-white text-slate-950 hover:bg-blue-50" onClick={() => setRoute("home")}>Back home</Button>
          <div className="flex gap-3">
            <Button className="bg-white text-slate-950 hover:bg-blue-50" onClick={() => setRoute("feedback")}>Give feedback</Button>
            <Button className="bg-white text-slate-950 hover:bg-blue-50" onClick={() => setRoute("upload")}>Share a petition</Button>
          </div>
        </div>
        <section className="mx-auto max-w-6xl">
          <PdfViewer petition={selected} access={access} onLogin={() => alert("Login modal placeholder")} onPay={() => alert("Stripe checkout placeholder")} />
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="fixed right-6 top-6 z-10 flex gap-3">
        <Button className="bg-white text-slate-950 hover:bg-blue-50" onClick={() => setRoute("feedback")}>Give feedback</Button>
        <Button className="bg-white text-slate-950 hover:bg-blue-50" onClick={() => setRoute("upload")}>Share a petition</Button>
      </div>
      <HomePage searchPetitions={searchPetitions} onOpenPetition={openPetition} />
    </>
  );
}
