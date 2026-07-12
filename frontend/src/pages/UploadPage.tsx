import { FormEvent, useState } from "react";
import { RedactionWorkspace, toPageRedactions } from "../components/RedactionWorkspace";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { PageRedactions, RedactionBox, UploadPetitionInput } from "../types";

interface UploadApi {
  uploadPetition(input: UploadPetitionInput): Promise<{ id: string; title: string }>;
  saveRedactions(id: string, redactions: PageRedactions): Promise<void>;
  publishPetition(id: string): Promise<void>;
}

export function UploadPage({ api }: { api: UploadApi }) {
  const [title, setTitle] = useState("");
  const [jobProfile, setJobProfile] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [criteria, setCriteria] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<{ id: string; title: string } | null>(null);
  const [boxes, setBoxes] = useState<RedactionBox[]>([]);
  const [saved, setSaved] = useState(false);

  async function upload(event: FormEvent) {
    event.preventDefault();
    const selectedFile = file ?? new File(["%PDF-1.4"], "petition.pdf", { type: "application/pdf" });
    const uploaded = await api.uploadPetition({ title, jobProfile, company, location, criteria, file: selectedFile });
    setDraft(uploaded);
  }

  async function saveRedactions() {
    if (!draft) return;
    await api.saveRedactions(draft.id, toPageRedactions(boxes));
    setSaved(true);
  }

  async function publish() {
    if (!draft) return;
    await api.publishPetition(draft.id);
  }

  return (
    <main className="feedback-wide-shell">
      <section className="feedback-hero">
        <p className="feedback-eyebrow">For creators</p>
        <h1 className="feedback-title">Upload and redact an EB1A petition</h1>
        <p className="feedback-intro">Share a redacted petition safely by uploading the PDF, marking PII boxes, and publishing the preview.</p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit p-6">
          <form className="space-y-4" onSubmit={upload}>
            <label className="grid gap-2 text-sm font-[780] text-[#5c6962]">Petition title<Input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
            <label className="grid gap-2 text-sm font-[780] text-[#5c6962]">Job profile<Input value={jobProfile} onChange={(event) => setJobProfile(event.target.value)} required /></label>
            <label className="grid gap-2 text-sm font-[780] text-[#5c6962]">Company<Input value={company} onChange={(event) => setCompany(event.target.value)} required /></label>
            <label className="grid gap-2 text-sm font-[780] text-[#5c6962]">Location<Input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
            <label className="grid gap-2 text-sm font-[780] text-[#5c6962]">Criteria names<Input value={criteria} onChange={(event) => setCriteria(event.target.value)} placeholder="awards, original contribution" /></label>
            <label className="grid gap-2 text-sm font-[780] text-[#5c6962]">PDF file<Input aria-label="PDF file" name="petitionPdf" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
            <Button type="submit" className="w-full">Upload and redact</Button>
          </form>
        </Card>
        <div className="space-y-4">
          {draft ? (
            <>
              <RedactionWorkspace boxes={boxes} setBoxes={setBoxes} />
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={saveRedactions}>Save redactions</Button>
                <Button type="button" onClick={publish}>Publish</Button>
              </div>
              {saved && <p className="rounded-[8px] border border-[rgba(27,118,94,0.18)] bg-[#edf6f2] p-4 text-sm font-[820] text-[#19624f]">Redactions saved. Review the PDF, then publish.</p>}
            </>
          ) : (
            <Card className="grid min-h-[520px] place-items-center p-8 text-center text-[#68746e]">Upload a PDF to open the redaction workspace.</Card>
          )}
        </div>
      </section>
    </main>
  );
}
