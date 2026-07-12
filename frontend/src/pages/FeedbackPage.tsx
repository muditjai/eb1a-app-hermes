import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_32%),#020617] px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">eb1a.fyi feedback</p>
          {onBackHome && <Button className="bg-white text-slate-950 hover:bg-blue-50" onClick={onBackHome}>Back to petitions</Button>}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <div>
            <h1 className="text-5xl font-black tracking-tight md:text-7xl">Approved EB1A/O1 petitions</h1>
            <p className="mt-6 text-xl leading-8 text-slate-300">
              Help shape the first version of a marketplace for finding, viewing, and sharing redacted approved petitions from applicants with backgrounds like yours.
            </p>
          </div>

          <Card className="bg-white/95 p-6 text-slate-950">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">60-second survey</p>
            <p className="mt-2 text-slate-600">This feedback code was merged from the GitHub version into the current product app.</p>
          </Card>
        </div>

        <form className="mt-10 space-y-6" onSubmit={submitSurvey}>
          <QuestionPanel
            number="1"
            question="Would you pay to view EB1A and O1 petitions that match your background?"
            answer={buyer.answer}
            onAnswer={(answer) => selectAnswer("buyer", answer)}
          >
            {buyer.answer === "yes" && (
              <SliderField id="buyer-price" label="How much would you pay?" value={buyer.amount} min={10} max={500} step={5} suffix="total" onChange={(amount) => updateBuyer({ amount })} />
            )}
            {buyer.answer === "no" && <CommentField id="buyer-comment" value={buyer.comment} onChange={(comment) => updateBuyer({ comment })} />}
          </QuestionPanel>

          <QuestionPanel
            number="2"
            question="Would you be willing to share your approved EB1A or O1 petition after redaction?"
            answer={contributor.answer}
            onAnswer={(answer) => selectAnswer("contributor", answer)}
          >
            {contributor.answer === "yes" && (
              <SliderField id="contributor-price" label="How much would you expect to be compensated for each view?" value={contributor.amount} min={1} max={500} step={1} suffix="per view" onChange={(amount) => updateContributor({ amount })} />
            )}
            {contributor.answer === "no" && <CommentField id="contributor-comment" value={contributor.comment} onChange={(comment) => updateContributor({ comment })} />}
          </QuestionPanel>

          <Card className="grid gap-5 bg-white p-6 text-slate-950 md:grid-cols-[1fr_auto] md:items-end">
            <label className="block text-sm font-medium text-slate-700">
              Email for early access <span className="font-normal text-slate-400">(optional)</span>
              <Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
            </label>
            <div>
              <Button type="submit" disabled={!canSubmit}>Submit feedback</Button>
              <p className={submitted ? "mt-3 text-sm font-semibold text-emerald-600" : "sr-only"} role="status">Thanks. Your feedback was recorded.</p>
            </div>
          </Card>
        </form>
      </section>
    </main>
  );
}

function QuestionPanel({
  number,
  question,
  answer,
  onAnswer,
  children
}: {
  number: string;
  question: string;
  answer: BinaryAnswer;
  onAnswer: (answer: Exclude<BinaryAnswer, null>) => void;
  children: ReactNode;
}) {
  return (
    <Card className="bg-white p-6 text-slate-950">
      <div className="flex gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">{number}</span>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{question}</h2>
          <div className="mt-5 flex gap-3" role="group" aria-label={question}>
            <Button type="button" className={answer === "yes" ? "bg-emerald-600" : "bg-slate-950"} aria-pressed={answer === "yes"} onClick={() => onAnswer("yes")}>Yes</Button>
            <Button type="button" className={answer === "no" ? "bg-rose-600" : "bg-slate-950"} aria-pressed={answer === "no"} onClick={() => onAnswer("no")}>No</Button>
          </div>
          {children && <div className="mt-5">{children}</div>}
        </div>
      </div>
    </Card>
  );
}

function SliderField({ id, label, value, min, max, step, suffix, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-700" htmlFor={id}>
      <span>{label}</span>
      <strong className="ml-3 text-lg text-slate-950">${value} <small className="text-slate-500">{suffix}</small></strong>
      <input id={id} className="mt-4 w-full accent-slate-950" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function CommentField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
      Any suggestions on making this idea feasible?
      <textarea id={id} className="mt-2 min-h-28 w-full rounded-3xl border border-slate-200 p-4 outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-200" value={value} onChange={(event) => onChange(event.target.value)} placeholder="What would need to change?" />
    </label>
  );
}
