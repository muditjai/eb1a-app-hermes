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
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">For creators</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Upload and redact an EB1A petition</h1>
          <form className="mt-6 space-y-4" onSubmit={upload}>
            <label className="block text-sm font-medium text-slate-700">Petition title<Input className="mt-1" value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
            <label className="block text-sm font-medium text-slate-700">Job profile<Input className="mt-1" value={jobProfile} onChange={(event) => setJobProfile(event.target.value)} required /></label>
            <label className="block text-sm font-medium text-slate-700">Company<Input className="mt-1" value={company} onChange={(event) => setCompany(event.target.value)} required /></label>
            <label className="block text-sm font-medium text-slate-700">Location<Input className="mt-1" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
            <label className="block text-sm font-medium text-slate-700">Criteria names<Input className="mt-1" value={criteria} onChange={(event) => setCriteria(event.target.value)} placeholder="awards, original contribution" /></label>
            <label className="block text-sm font-medium text-slate-700">PDF file<Input aria-label="PDF file" name="petitionPdf" className="mt-1" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
            <Button type="submit" className="w-full">Upload and redact</Button>
          </form>
        </Card>
        <div className="space-y-4">
          {draft ? (
            <>
              <RedactionWorkspace boxes={boxes} setBoxes={setBoxes} />
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={saveRedactions}>Save redactions</Button>
                <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={publish}>Publish</Button>
              </div>
              {saved && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">Redactions saved. Review the PDF, then publish.</p>}
            </>
          ) : (
            <Card className="grid min-h-[520px] place-items-center p-8 text-center text-slate-500">Upload a PDF to open the redaction workspace.</Card>
          )}
        </div>
      </section>
    </main>
  );
}
