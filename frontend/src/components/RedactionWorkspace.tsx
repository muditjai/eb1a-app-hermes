import type { PageRedactions, RedactionBox } from "../types";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export function RedactionWorkspace({ boxes, setBoxes }: { boxes: RedactionBox[]; setBoxes: (boxes: RedactionBox[]) => void }) {
  function addBox() {
    setBoxes([...boxes, { x: 72, y: 96 + boxes.length * 54, width: 220, height: 40, label: "PII" }]);
  }

  return (
    <Card className="bg-white/95 p-5 text-slate-950">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Redaction workspace</h2>
          <p className="text-sm text-slate-500">Draw black boxes over names, addresses, emails, phone numbers, receipt numbers, or any other PII.</p>
        </div>
        <Button type="button" onClick={addBox}>Add PII redaction box</Button>
      </div>
      <div className="relative mt-5 aspect-[3/4] max-w-2xl overflow-hidden rounded-3xl border bg-slate-50 p-8">
        <div className="space-y-4">
          <div className="h-4 w-1/2 rounded bg-slate-300" />
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 w-4/5 rounded bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-100" />
        </div>
        {boxes.map((box, index) => (
          <div
            key={`${box.x}-${box.y}-${index}`}
            className="absolute rounded bg-black/90 text-[10px] text-white"
            style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
          >
            {box.label}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function toPageRedactions(boxes: RedactionBox[]): PageRedactions {
  return { page: 1, pageWidth: 800, pageHeight: 1000, boxes };
}
