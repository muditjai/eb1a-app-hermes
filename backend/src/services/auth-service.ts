import type { AppStore } from "../repositories/app-store";

export interface UserSession {
  id: string;
  email: string;
  paid: boolean;
  paidPetitionIds: string[];
}

export type LoginSession = UserSession & { token: string };

function toSession(user: { id: string; email: string; paidPetitionIds: string[] }): UserSession {
  return {
    id: user.id,
    email: user.email,
    paid: user.paidPetitionIds.length > 0,
    paidPetitionIds: user.paidPetitionIds
  };
}

export function createAuthService(store: AppStore) {
  return {
    async login(email: string): Promise<LoginSession> {
      const user = await store.upsertUserByEmail(email);
      return { ...toSession(user), token: user.token };
    },

    async getSession(token?: string): Promise<UserSession | null> {
      const user = await store.findUserByToken(token);
      return user ? toSession(user) : null;
    },

    async markPaid(token: string, petitionId: string, checkoutSessionId?: string): Promise<UserSession | null> {
      const user = await store.markPetitionPurchased({ userToken: token, petitionId, checkoutSessionId });
      return user ? toSession(user) : null;
    }
  };
}
