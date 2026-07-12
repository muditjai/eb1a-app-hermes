import { useState } from "react";
import type { PetitionSummary, ViewerAccess } from "../types";
import { Button } from "./ui/Button";

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
    <section className="mx-auto grid w-full gap-6">
      <header className="feedback-card mx-auto grid w-full max-w-[1180px] gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="eyebrow !mx-0 !mb-2">Viewing access</p>
          <h1 className="!m-0 !whitespace-normal !text-left !text-[clamp(1.6rem,3vw,2.4rem)]">{petition.title}</h1>
          <p className="intro !mx-0 !mt-3 !text-left">You can view {access.allowedPages} page{access.allowedPages === 1 ? "" : "s"} now. Each page below loads the actual redacted sample PDF in an A4 viewport.</p>
        </div>
        {access.paywall && <Button onClick={continueReading}>Continue reading</Button>}
        {prompt === "login" && (
          <div className="rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[#eef2ef] p-4 md:col-span-2">
            <h2>Log in to view 2 more pages</h2>
            <p className="intro !mx-0 !mt-2 !text-left !text-sm">Create a free reader account before the payment step.</p>
            <Button className="mt-4" onClick={onLogin}>Log in</Button>
          </div>
        )}
        {prompt === "payment" && (
          <div className="rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[#eef2ef] p-4 md:col-span-2">
            <h2>Unlock the full petition</h2>
            <p className="intro !mx-0 !mt-2 !text-left !text-sm">Pay securely with Stripe to read every redacted page.</p>
            <Button className="mt-4" onClick={onPay}>Pay with Stripe</Button>
          </div>
        )}
      </header>

      <div className="mx-auto grid w-full gap-8">
        {pages.map((page) => (
          <article key={page} className="mx-auto w-full max-w-none">
            <p className="mb-3 text-center text-sm font-[850] text-[#19624f]">Page {page} of {petition.totalPages}</p>
            <div data-testid="actual-pdf-page" className="feedback-card relative mx-auto aspect-[210/297] w-full overflow-hidden p-0">
              <object
                aria-label={`${petition.title} page ${page}`}
                className="h-full w-full"
                data={`${petition.pdfUrl}#page=${page}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                type="application/pdf"
              >
                <iframe title={`${petition.title} page ${page}`} className="h-full w-full" src={`${petition.pdfUrl}#page=${page}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`} />
              </object>
              <div data-testid="pdf-page-blur" className="pointer-events-none absolute bottom-0 left-0 h-[70%] w-full bg-[rgba(255,255,252,0.52)] backdrop-blur-md" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
