import { FileText } from "lucide-react";
import type { PetitionSummary } from "../types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export function PetitionCard({ petition, onOpen }: { petition: PetitionSummary; onOpen: (petition: PetitionSummary) => void }) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-px hover:border-[rgba(27,118,94,0.28)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_26px_70px_rgba(28,36,31,0.11)]">
      <div className="block w-full text-left">
        <div data-testid="pdf-preview-viewport" className="relative mx-auto mt-6 aspect-[3/4] min-h-[680px] w-[94%] max-w-[720px] overflow-hidden rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[#eef2ef] p-10">
          <div className="mb-5 flex items-center gap-2 text-[#5c6962]">
            <FileText size={18} /> Redacted PDF
          </div>
          <div className="space-y-5 text-[#56625c]">
            <div className="h-5 w-3/4 rounded bg-[#cfd9d3]" />
            <div className="h-4 w-full rounded bg-[#dfe6e1]" />
            <div className="h-4 w-5/6 rounded bg-[#dfe6e1]" />
            <div className="mt-8 h-40 rounded-[8px] bg-[#dfe6e1]" />
            <div className="h-4 w-full rounded bg-[#dfe6e1]" />
            <div className="h-4 w-2/3 rounded bg-[#dfe6e1]" />
          </div>
          <div data-testid="pdf-preview-blur" className="absolute bottom-0 left-0 h-[70%] w-full bg-[rgba(255,255,252,0.68)] backdrop-blur-md" />
        </div>
        <div className="space-y-4 p-7">
          <div>
            <h3 className="text-2xl font-[760] leading-tight text-[#17201c]">{petition.title}</h3>
            <p className="mt-1 text-sm text-[#68746e]">{petition.jobProfile} · {petition.company} · {petition.location}</p>
          </div>
          <p className="line-clamp-2 text-base leading-7 text-[#56625c]">{petition.summary}</p>
          <div className="flex flex-wrap gap-2">
            {petition.criteria.map((criterion) => <Badge key={criterion}>{criterion}</Badge>)}
          </div>
          <Button type="button" className="w-full" onClick={() => onOpen(petition)}>Open petition</Button>
        </div>
      </div>
    </Card>
  );
}
