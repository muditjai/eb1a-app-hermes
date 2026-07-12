export interface UserSession {
  id: string;
  email: string;
  paid: boolean;
}

export function createAuthService() {
  const sessions = new Map<string, UserSession>();

  return {
    login(email: string): UserSession & { token: string } {
      const normalizedEmail = email.trim().toLowerCase();
      const id = `user_${Buffer.from(normalizedEmail).toString("base64url")}`;
      const token = id;
      const existing = sessions.get(token);
      const session = existing ?? { id, email: normalizedEmail, paid: false };
      sessions.set(token, session);
      return { ...session, token };
    },

    getSession(token?: string): UserSession | null {
      if (!token) return null;
      return sessions.get(token) ?? null;
    },

    markPaid(token: string): UserSession | null {
      const session = sessions.get(token);
      if (!session) return null;
      const updated = { ...session, paid: true };
      sessions.set(token, updated);
      return updated;
    }
  };
}
