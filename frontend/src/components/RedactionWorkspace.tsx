import type { PageRedactions, RedactionBox } from "../types";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export function RedactionWorkspace({ boxes, setBoxes }: { boxes: RedactionBox[]; setBoxes: (boxes: RedactionBox[]) => void }) {
  function addBox() {
    setBoxes([...boxes, { x: 72, y: 96 + boxes.length * 54, width: 220, height: 40, label: "PII" }]);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[clamp(1.1rem,1.85vw,1.4rem)] font-[760] leading-[1.32] text-[#17201c]">Redaction workspace</h2>
          <p className="mt-2 text-sm leading-6 text-[#56625c]">Draw black boxes over names, addresses, emails, phone numbers, receipt numbers, or any other PII.</p>
        </div>
        <Button type="button" onClick={addBox}>Add PII redaction box</Button>
      </div>
      <div className="relative mt-6 aspect-[3/4] max-w-2xl overflow-hidden rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[#eef2ef] p-8">
        <div className="space-y-4">
          <div className="h-4 w-1/2 rounded bg-[#cfd9d3]" />
          <div className="h-4 rounded bg-[#dfe6e1]" />
          <div className="h-4 w-4/5 rounded bg-[#dfe6e1]" />
          <div className="h-24 rounded-[8px] bg-[#dfe6e1]" />
        </div>
        {boxes.map((box, index) => (
          <div
            key={`${box.x}-${box.y}-${index}`}
            className="absolute rounded-[3px] bg-[#111815] text-[10px] text-white"
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
