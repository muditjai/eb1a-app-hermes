import { useState } from "react";
import type { PetitionSummary, ViewerAccess } from "../types";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export function PdfViewer({
  petition,
  access,
  onLogin,
  onPay
}: {
  petition: PetitionSummary;
  access: ViewerAccess;
  onLogin: () => void;
  onPay: () => void;
}) {
  const [prompt, setPrompt] = useState<"login" | "payment" | null>(null);
  const pages = Array.from({ length: Math.min(access.allowedPages, petition.totalPages) }, (_, index) => index + 1);

  function continueReading() {
    setPrompt(access.paywall);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        {pages.map((page) => (
          <Card key={page} className="mx-auto aspect-[3/4] min-h-[840px] max-w-5xl overflow-hidden p-14">
            <p className="mb-8 text-sm font-semibold text-slate-500">Page {page} of {petition.totalPages}</p>
            <div className="space-y-4">
              <div className="h-4 w-2/3 rounded bg-slate-300" />
              <div className="h-4 rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
              <div className="h-56 rounded-2xl bg-slate-100" />
              <div className="h-4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
          </Card>
        ))}
      </div>
      <aside className="sticky top-6 h-fit rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
        <p className="text-sm text-slate-300">Viewing access</p>
        <h2 className="mt-2 text-2xl font-bold">{petition.title}</h2>
        <p className="mt-3 text-slate-300">You can view {access.allowedPages} page{access.allowedPages === 1 ? "" : "s"} now.</p>
        {access.paywall && <Button className="mt-5 w-full bg-white text-slate-950 hover:bg-slate-100" onClick={continueReading}>Continue reading</Button>}
        {prompt === "login" && (
          <div className="mt-5 rounded-3xl bg-white/10 p-4">
            <h3 className="font-semibold">Log in to view 2 more pages</h3>
            <p className="mt-2 text-sm text-slate-300">Create a free reader account before the payment step.</p>
            <Button className="mt-4 bg-white text-slate-950" onClick={onLogin}>Log in</Button>
          </div>
        )}
        {prompt === "payment" && (
          <div className="mt-5 rounded-3xl bg-white/10 p-4">
            <h3 className="font-semibold">Unlock the full petition</h3>
            <p className="mt-2 text-sm text-slate-300">Pay securely with Stripe to read every redacted page.</p>
            <Button className="mt-4 bg-white text-slate-950" onClick={onPay}>Pay with Stripe</Button>
          </div>
        )}
      </aside>
    </div>
  );
}
