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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef2ff,transparent_34%),#f8fafc] px-6 py-10">
      <section className="mx-auto max-w-[96rem]">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">eb1a.fyi</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">Learn from real redacted EB1A petitions.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">Search by job profile, company, location, or USCIS criteria to find examples most relevant to your case.</p>
          </div>
          <label className="block rounded-[2rem] bg-white p-3 shadow-soft">
            <span className="mb-2 flex items-center gap-2 px-2 text-sm font-medium text-slate-600"><Search size={16} /> Search petitions</span>
            <Input aria-label="Search petitions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Research scientist, Google, awards..." />
          </label>
        </div>
        <div className="mt-12 grid gap-10 xl:grid-cols-2">
          {petitions.map((petition) => <PetitionCard key={petition.id} petition={petition} onOpen={onOpenPetition} />)}
        </div>
      </section>
    </main>
  );
}
