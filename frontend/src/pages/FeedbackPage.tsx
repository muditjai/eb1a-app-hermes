import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { capture, capturePageview } from "../analytics";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

type BinaryAnswer = "yes" | "no" | null;

interface QuestionState {
  answer: BinaryAnswer;
  amount: number;
  comment: string;
}

const initialBuyerState: QuestionState = { answer: null, amount: 250, comment: "" };
const initialContributorState: QuestionState = { answer: null, amount: 250, comment: "" };

export function FeedbackPage({ onBackHome }: { onBackHome?: () => void }) {
  const [buyer, setBuyer] = useState<QuestionState>(initialBuyerState);
  const [contributor, setContributor] = useState<QuestionState>(initialContributorState);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(() => Boolean(buyer.answer && contributor.answer), [buyer, contributor]);

  useEffect(() => {
    capturePageview();
  }, []);

  function updateBuyer(update: Partial<QuestionState>) {
    setBuyer((current) => ({ ...current, ...update }));
  }

  function updateContributor(update: Partial<QuestionState>) {
    setContributor((current) => ({ ...current, ...update }));
  }

  function selectAnswer(question: "buyer" | "contributor", answer: Exclude<BinaryAnswer, null>) {
    capture("survey_answer_selected", { question, answer });
    if (question === "buyer") updateBuyer({ answer });
    else updateContributor({ answer });
  }

  function submitSurvey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    capture("landing_survey_submitted", {
      buyer_interest: buyer.answer,
      buyer_price_usd: buyer.answer === "yes" ? buyer.amount : null,
      buyer_comment: buyer.answer === "no" ? buyer.comment.trim() : null,
      contributor_interest: contributor.answer,
      contributor_compensation_usd: contributor.answer === "yes" ? contributor.amount : null,
      contributor_comment: contributor.answer === "no" ? contributor.comment.trim() : null,
      email: email.trim() || null
    });
    setSubmitted(true);
  }

  return (
    <main className="feedback-shell">
      {onBackHome && <div className="mb-6 flex justify-end"><Button onClick={onBackHome}>Back to petitions</Button></div>}
      <section className="feedback-hero">
        <p className="feedback-eyebrow">eb1a.fyi</p>
        <h1 className="feedback-title whitespace-nowrap max-[520px]:whitespace-normal">Approved EB1A/O1 petitions</h1>
        <p className="feedback-intro">A website to find, view, and share redacted approved petitions from applicants with backgrounds like yours.</p>
      </section>

      <form className="mt-9 grid gap-4" onSubmit={submitSurvey}>
        <div className="flex items-baseline justify-between gap-4 px-0.5 pb-1">
          <span className="text-sm font-[850] text-[#17201c]">60-second survey</span>
          <p className="m-0 text-sm text-[#68746e]">Help shape the first version.</p>
        </div>

        <QuestionPanel number="1" question="Would you pay to view EB1A and O1 petitions that match your background?" answer={buyer.answer} onAnswer={(answer) => selectAnswer("buyer", answer)}>
          {buyer.answer === "yes" && <SliderField id="buyer-price" label="How much would you pay?" value={buyer.amount} min={10} max={500} step={5} suffix="total" onChange={(amount) => updateBuyer({ amount })} />}
          {buyer.answer === "no" && <CommentField id="buyer-comment" value={buyer.comment} onChange={(comment) => updateBuyer({ comment })} />}
        </QuestionPanel>

        <QuestionPanel number="2" question="Would you be willing to share your approved EB1A or O1 petition after redaction?" answer={contributor.answer} onAnswer={(answer) => selectAnswer("contributor", answer)}>
          {contributor.answer === "yes" && <SliderField id="contributor-price" label="How much would you expect to be compensated for each view of the petition?" value={contributor.amount} min={1} max={500} step={1} suffix="per view" onChange={(amount) => updateContributor({ amount })} />}
          {contributor.answer === "no" && <CommentField id="contributor-comment" value={contributor.comment} onChange={(comment) => updateContributor({ comment })} />}
        </QuestionPanel>

        <Card className="grid gap-5 p-5">
          <label className="grid gap-3 text-sm font-[780] text-[#5c6962]">
            Email for early access <span className="font-[720] text-[#87918c]">(optional)</span>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com - optional, leave blank for anonymous feedback" autoComplete="email" />
          </label>
          <div className="grid gap-3">
            <Button type="submit" disabled={!canSubmit}>Submit feedback</Button>
            <p className={submitted ? "min-h-6 text-sm font-[820] text-[#19624f]" : "min-h-6 translate-y-[-4px] text-sm font-[820] text-[#19624f] opacity-0"} role="status">Thanks. Your feedback was recorded.</p>
          </div>
        </Card>
      </form>
    </main>
  );
}

function QuestionPanel({ number, question, answer, onAnswer, children }: { number: string; question: string; answer: BinaryAnswer; onAnswer: (answer: Exclude<BinaryAnswer, null>) => void; children: ReactNode }) {
  return (
    <Card className="p-[clamp(22px,4vw,30px)] transition focus-within:border-[rgba(27,118,94,0.28)] focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_26px_70px_rgba(28,36,31,0.11)]">
      <div className="grid grid-cols-[32px_1fr] items-start gap-3.5 max-[520px]:grid-cols-1">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-[rgba(27,118,94,0.18)] bg-[#edf6f2] text-sm font-[850] text-[#19624f]">{number}</span>
        <div>
          <h2 className="m-0 pt-px text-[clamp(1.1rem,1.85vw,1.4rem)] font-[760] leading-[1.32] text-[#17201c]">{question}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 max-[520px]:grid-cols-1" role="group" aria-label={question}>
            <button className={answer === "yes" ? "min-h-12 rounded-[8px] border border-[#1b765e] bg-[#1b765e] font-[820] text-white shadow-[0_8px_18px_rgba(27,118,94,0.2)]" : "min-h-12 rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[#eef2ef] font-[820] text-[#44514a] transition hover:-translate-y-px"} type="button" aria-pressed={answer === "yes"} onClick={() => onAnswer("yes")}>Yes</button>
            <button className={answer === "no" ? "min-h-12 rounded-[8px] border border-[#1b765e] bg-[#1b765e] font-[820] text-white shadow-[0_8px_18px_rgba(27,118,94,0.2)]" : "min-h-12 rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[#eef2ef] font-[820] text-[#44514a] transition hover:-translate-y-px"} type="button" aria-pressed={answer === "no"} onClick={() => onAnswer("no")}>No</button>
          </div>
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </Card>
  );
}

function SliderField({ id, label, value, min, max, step, suffix, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (value: number) => void }) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <label className="grid gap-3 text-sm font-[780] text-[#5c6962]" htmlFor={id}>
      <span>{label}</span>
      <strong className="flex items-baseline gap-2 text-[clamp(2rem,5vw,3.1rem)] font-[760] leading-none text-[#17201c]">${value} <small className="text-sm font-[720] text-[#6d7872]">{suffix}</small></strong>
      <input id={id} className="my-2 h-[7px] w-full appearance-none rounded-full bg-[#dfe6e1] accent-[#1b765e]" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ "--slider-progress": `${progress}%` } as CSSProperties} />
    </label>
  );
}

function CommentField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-3 text-sm font-[780] text-[#5c6962]" htmlFor={id}>
      Any suggestions on making this idea feasible?
      <textarea id={id} className="min-h-[116px] w-full resize-y rounded-[8px] border border-[rgba(17,24,21,0.13)] bg-white/90 px-4 py-3.5 leading-normal text-[#17201c] outline-none transition focus:border-[#1b765e] focus:bg-white focus:ring-4 focus:ring-[rgba(27,118,94,0.11)]" value={value} onChange={(event) => onChange(event.target.value)} placeholder="What would need to change?" />
    </label>
  );
}
