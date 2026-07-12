import { Button } from "../components/ui/Button";

export function PlaceholderHomePage({ onGiveFeedback }: { onGiveFeedback: () => void }) {
  return (
    <main className="placeholder-shell">
      <span className="eyebrow">eb1a.fyi</span>
      <h1>Approved EB1A/O1 petitions</h1>
      <p className="intro">
        A website to find, view, and share redacted approved petitions from applicants with backgrounds like yours.
      </p>
      <Button className="mt-[34px] min-w-[172px]" onClick={onGiveFeedback}>
        Give Feedback
      </Button>
    </main>
  );
}
