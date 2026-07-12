import { FileText } from "lucide-react";
import type { PetitionSummary } from "../types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export function PetitionCard({ petition, onOpen }: { petition: PetitionSummary; onOpen: (petition: PetitionSummary) => void }) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-1 hover:border-slate-300">
      <div className="block w-full text-left">
        <div data-testid="pdf-preview-viewport" className="relative mx-auto mt-6 aspect-[3/4] min-h-[680px] w-[94%] max-w-[720px] overflow-hidden rounded-[2rem] border bg-slate-50 p-10">
          <div className="mb-5 flex items-center gap-2 text-slate-500">
            <FileText size={18} /> Redacted PDF
          </div>
          <div className="space-y-5 text-slate-700">
            <div className="h-5 w-3/4 rounded bg-slate-300" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="mt-8 h-40 rounded-2xl bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
          <div data-testid="pdf-preview-blur" className="absolute bottom-0 left-0 h-[70%] w-full backdrop-blur-md bg-white/60" />
        </div>
        <div className="space-y-4 p-7">
          <div>
            <h3 className="text-2xl font-bold text-slate-950">{petition.title}</h3>
            <p className="text-sm text-slate-500">{petition.jobProfile} · {petition.company} · {petition.location}</p>
          </div>
          <p className="line-clamp-2 text-base text-slate-600">{petition.summary}</p>
          <div className="flex flex-wrap gap-2">
            {petition.criteria.map((criterion) => <Badge key={criterion}>{criterion}</Badge>)}
          </div>
          <Button type="button" className="w-full" onClick={() => onOpen(petition)}>Open petition</Button>
        </div>
      </div>
    </Card>
  );
}
