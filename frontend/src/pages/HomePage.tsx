import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PetitionCard } from "../components/PetitionCard";
import { Input } from "../components/ui/Input";
import type { PetitionSummary } from "../types";

export function HomePage({
  searchPetitions,
  onOpenPetition
}: {
  searchPetitions: (query: string) => Promise<PetitionSummary[]>;
  onOpenPetition: (petition: PetitionSummary) => void;
}) {
  const [query, setQuery] = useState("");
  const [petitions, setPetitions] = useState<PetitionSummary[]>([]);

  useEffect(() => {
    void searchPetitions(query).then(setPetitions);
  }, [query, searchPetitions]);

  return (
    <main className="wide-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">eb1a.fyi</p>
          <h1>Learn from real redacted EB1A petitions.</h1>
          <p className="intro">Search by job profile, company, location, or USCIS criteria to find examples most relevant to your case.</p>
        </div>
      </section>

      <label className="mx-auto mt-9 block max-w-3xl rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[rgba(255,255,252,0.86)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_22px_60px_rgba(28,36,31,0.08)] backdrop-blur-[14px]">
        <span className="mb-3 flex items-center justify-center gap-2 text-sm font-[850] text-[#17201c]"><Search size={16} /> Search petitions</span>
        <Input aria-label="Search petitions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Research scientist, Google, awards..." />
      </label>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        {petitions.map((petition) => <PetitionCard key={petition.id} petition={petition} onOpen={onOpenPetition} />)}
      </div>
    </main>
  );
}
