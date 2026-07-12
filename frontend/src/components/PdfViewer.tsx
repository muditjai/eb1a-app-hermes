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
            <p className="mb-8 text-sm font-[850] text-[#19624f]">Page {page} of {petition.totalPages}</p>
            <div className="space-y-4">
              <div className="h-4 w-2/3 rounded bg-[#cfd9d3]" />
              <div className="h-4 rounded bg-[#dfe6e1]" />
              <div className="h-4 w-5/6 rounded bg-[#dfe6e1]" />
              <div className="h-56 rounded-[8px] bg-[#eef2ef]" />
              <div className="h-4 rounded bg-[#dfe6e1]" />
              <div className="h-4 w-1/2 rounded bg-[#dfe6e1]" />
            </div>
          </Card>
        ))}
      </div>
      <aside className="sticky top-6 h-fit rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[rgba(255,255,252,0.86)] p-6 text-[#17201c] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_22px_60px_rgba(28,36,31,0.08)] backdrop-blur-[14px]">
        <p className="text-sm font-[850] text-[#19624f]">Viewing access</p>
        <h2 className="mt-2 text-2xl font-[760] leading-tight">{petition.title}</h2>
        <p className="mt-3 leading-7 text-[#56625c]">You can view {access.allowedPages} page{access.allowedPages === 1 ? "" : "s"} now.</p>
        {access.paywall && <Button className="mt-5 w-full" onClick={continueReading}>Continue reading</Button>}
        {prompt === "login" && (
          <div className="mt-5 rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[#eef2ef] p-4">
            <h3 className="font-[760]">Log in to view 2 more pages</h3>
            <p className="mt-2 text-sm leading-6 text-[#56625c]">Create a free reader account before the payment step.</p>
            <Button className="mt-4" onClick={onLogin}>Log in</Button>
          </div>
        )}
        {prompt === "payment" && (
          <div className="mt-5 rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[#eef2ef] p-4">
            <h3 className="font-[760]">Unlock the full petition</h3>
            <p className="mt-2 text-sm leading-6 text-[#56625c]">Pay securely with Stripe to read every redacted page.</p>
            <Button className="mt-4" onClick={onPay}>Pay with Stripe</Button>
          </div>
        )}
      </aside>
    </div>
  );
}
