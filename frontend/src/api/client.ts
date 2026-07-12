import type { PageRedactions, PetitionSummary, UploadPetitionInput, ViewerAccess } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const apiClient = {
  async searchPetitions(query: string): Promise<PetitionSummary[]> {
    const res = await json<{ data: PetitionSummary[] }>(`/api/petitions?query=${encodeURIComponent(query)}`);
    return res.data;
  },

  async getAccess(id: string, token?: string): Promise<ViewerAccess> {
    const res = await json<{ data: ViewerAccess }>(`/api/petitions/${id}/access`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
    return res.data;
  },

  async uploadPetition(input: UploadPetitionInput): Promise<Pick<PetitionSummary, "id" | "title">> {
    const body = new FormData();
    body.append("title", input.title);
    body.append("jobProfile", input.jobProfile);
    body.append("company", input.company);
    body.append("location", input.location);
    body.append("criteria", input.criteria);
    body.append("petitionPdf", input.file);
    const res = await fetch(`${API_BASE}/api/petitions/upload`, { method: "POST", body });
    if (!res.ok) throw new Error(await res.text());
    const payload = (await res.json()) as { data: PetitionSummary };
    return { id: payload.data.id, title: payload.data.title };
  },

  async saveRedactions(id: string, redactions: PageRedactions): Promise<void> {
    await json(`/api/petitions/${id}/redactions`, { method: "POST", body: JSON.stringify(redactions) });
  },

  async publishPetition(id: string): Promise<void> {
    await json(`/api/petitions/${id}/publish`, { method: "POST" });
  }
};
