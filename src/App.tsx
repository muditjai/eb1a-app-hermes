import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { capture, capturePageview } from './analytics';

type BinaryAnswer = 'yes' | 'no' | null;

interface QuestionState {
  answer: BinaryAnswer;
  amount: number;
  comment: string;
}

const initialBuyerState: QuestionState = {
  answer: null,
  amount: 250,
  comment: '',
};

const initialContributorState: QuestionState = {
  answer: null,
  amount: 250,
  comment: '',
};

export function App() {
  const [buyer, setBuyer] = useState<QuestionState>(initialBuyerState);
  const [contributor, setContributor] = useState<QuestionState>(initialContributorState);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(buyer.answer && contributor.answer);
  }, [buyer, contributor]);

  useEffect(() => {
    capturePageview();
  }, []);

  function updateBuyer(update: Partial<QuestionState>) {
    setBuyer((current) => ({ ...current, ...update }));
  }

  function updateContributor(update: Partial<QuestionState>) {
    setContributor((current) => ({ ...current, ...update }));
  }

  function selectAnswer(question: 'buyer' | 'contributor', answer: Exclude<BinaryAnswer, null>) {
    capture('survey_answer_selected', { question, answer });

    if (question === 'buyer') {
      updateBuyer({ answer });
      return;
    }

    updateContributor({ answer });
  }

  function submitSurvey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const payload = {
      buyer_interest: buyer.answer,
      buyer_price_usd: buyer.answer === 'yes' ? buyer.amount : null,
      buyer_comment: buyer.answer === 'no' ? buyer.comment.trim() : null,
      contributor_interest: contributor.answer,
      contributor_compensation_usd: contributor.answer === 'yes' ? contributor.amount : null,
      contributor_comment:
        contributor.answer === 'no' ? contributor.comment.trim() : null,
      email: email.trim() || null,
    };

    capture('landing_survey_submitted', payload);
    setSubmitted(true);
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">eb1a.fyi</p>
          <h1>Approved EB1A/O1 petitions</h1>
          <p className="intro">
            A website to find, view, and share redacted approved petitions from
            applicants with backgrounds like yours.
          </p>
        </div>
      </section>

      <form className="survey" onSubmit={submitSurvey}>
        <div className="survey-intro">
          <span>60-second survey</span>
          <p>Help shape the first version.</p>
        </div>

        <QuestionPanel
          number="1"
          question="Would you pay to view EB1A and O1 petitions that match your background?"
          answer={buyer.answer}
          yesLabel="Yes"
          noLabel="No"
          onAnswer={(answer) => selectAnswer('buyer', answer)}
        >
          <Reveal visible={buyer.answer === 'yes'}>
            <SliderField
              id="buyer-price"
              label="How much would you pay?"
              value={buyer.amount}
              min={10}
              max={500}
              step={5}
              suffix="total"
              onChange={(amount) => {
                updateBuyer({ amount });
                capture('survey_slider_changed', {
                  question: 'buyer',
                  amount,
                });
              }}
            />
          </Reveal>

          <Reveal visible={buyer.answer === 'no'}>
            <CommentField
              id="buyer-comment"
              value={buyer.comment}
              onChange={(comment) => updateBuyer({ comment })}
            />
          </Reveal>
        </QuestionPanel>

        <QuestionPanel
          number="2"
          question="Would you be willing to share your approved EB1A or O1 petition after redaction?"
          answer={contributor.answer}
          yesLabel="Yes"
          noLabel="No"
          onAnswer={(answer) => selectAnswer('contributor', answer)}
        >
          <Reveal visible={contributor.answer === 'yes'}>
            <SliderField
              id="contributor-price"
              label="How much would you expect to be compensated for each view of the petition?"
              value={contributor.amount}
              min={1}
              max={500}
              step={1}
              suffix="per view"
              onChange={(amount) => {
                updateContributor({ amount });
                capture('survey_slider_changed', {
                  question: 'contributor',
                  amount,
                });
              }}
            />
          </Reveal>

          <Reveal visible={contributor.answer === 'no'}>
            <CommentField
              id="contributor-comment"
              value={contributor.comment}
              onChange={(comment) => updateContributor({ comment })}
            />
          </Reveal>
        </QuestionPanel>

        <section className="submit-panel">
          <label className="email-field" htmlFor="email">
            <span>Email for early access</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <div className="actions">
            <button className="submit-button" type="submit" disabled={!canSubmit}>
              Submit feedback
            </button>
            <p className={submitted ? 'status visible' : 'status'} role="status">
              Thanks. Your feedback was recorded.
            </p>
          </div>
        </section>
      </form>
    </main>
  );
}

interface QuestionPanelProps {
  number: string;
  question: string;
  answer: BinaryAnswer;
  yesLabel: string;
  noLabel: string;
  onAnswer: (answer: Exclude<BinaryAnswer, null>) => void;
  children: ReactNode;
}

function QuestionPanel({
  number,
  question,
  answer,
  yesLabel,
  noLabel,
  onAnswer,
  children,
}: QuestionPanelProps) {
  return (
    <section className="question-panel">
      <div className="question-heading">
        <span className="question-number">{number}</span>
        <h2>{question}</h2>
      </div>

      <div className="choice-row" role="group" aria-label={question}>
        <button
          className={answer === 'yes' ? 'choice selected' : 'choice'}
          type="button"
          aria-pressed={answer === 'yes'}
          onClick={() => onAnswer('yes')}
        >
          {yesLabel}
        </button>
        <button
          className={answer === 'no' ? 'choice selected' : 'choice'}
          type="button"
          aria-pressed={answer === 'no'}
          onClick={() => onAnswer('no')}
        >
          {noLabel}
        </button>
      </div>

      {children}
    </section>
  );
}

interface RevealProps {
  visible: boolean;
  children: ReactNode;
}

function Reveal({ visible, children }: RevealProps) {
  return <div className={visible ? 'reveal visible' : 'reveal'}>{children}</div>;
}

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}

function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: SliderFieldProps) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <label className="slider-field" htmlFor={id}>
      <span>{label}</span>
      <strong>
        ${value} <small>{suffix}</small>
      </strong>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ '--slider-progress': `${progress}%` } as CSSProperties}
      />
    </label>
  );
}

interface CommentFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

function CommentField({ id, value, onChange }: CommentFieldProps) {
  return (
    <label className="comment-field" htmlFor={id}>
      <span>Any suggestions on making this idea feasible?</span>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="What would need to change?"
        rows={4}
      />
    </label>
  );
}
