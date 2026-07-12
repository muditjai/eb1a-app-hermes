import { MongoClient, type Collection, type Db, type Document } from "mongodb";
import { v4 as uuid } from "uuid";
import type { FeedbackSubmission, FeedbackSubmissionInput, PetitionPurchase, UserAccount } from "../domain/types";

export interface MarkPetitionPurchasedInput {
  userToken: string;
  petitionId: string;
  checkoutSessionId?: string;
}

export interface AppStore {
  saveFeedback(input: FeedbackSubmissionInput): Promise<FeedbackSubmission>;
  upsertUserByEmail(email: string): Promise<UserAccount>;
  findUserByToken(token?: string): Promise<UserAccount | null>;
  markPetitionPurchased(input: MarkPetitionPurchasedInput): Promise<UserAccount | null>;
}

const now = () => new Date().toISOString();

function userIdForEmail(email: string): string {
  return `user_${Buffer.from(email).toString("base64url")}`;
}

function purchaseIdFor(userToken: string, petitionId: string): string {
  return `purchase_${Buffer.from(`${userToken}:${petitionId}`).toString("base64url")}`;
}

export function createMemoryAppStore(): AppStore {
  const feedback = new Map<string, FeedbackSubmission>();
  const users = new Map<string, UserAccount>();
  const purchases = new Map<string, PetitionPurchase>();

  return {
    async saveFeedback(input) {
      const submission: FeedbackSubmission = {
        ...input,
        id: `feedback_${uuid()}`,
        createdAt: now()
      };
      feedback.set(submission.id, submission);
      return submission;
    },

    async upsertUserByEmail(email) {
      const normalizedEmail = email.trim().toLowerCase();
      const token = userIdForEmail(normalizedEmail);
      const existing = users.get(token);
      if (existing) {
        const updated = { ...existing, updatedAt: now() };
        users.set(token, updated);
        return updated;
      }

      const timestamp = now();
      const user: UserAccount = {
        id: token,
        email: normalizedEmail,
        token,
        paidPetitionIds: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      users.set(token, user);
      return user;
    },

    async findUserByToken(token) {
      if (!token) return null;
      return users.get(token) ?? null;
    },

    async markPetitionPurchased(input) {
      const user = users.get(input.userToken);
      if (!user) return null;

      const timestamp = now();
      const purchase: PetitionPurchase = {
        id: purchaseIdFor(input.userToken, input.petitionId),
        userId: user.id,
        userToken: input.userToken,
        petitionId: input.petitionId,
        checkoutSessionId: input.checkoutSessionId,
        status: "paid",
        createdAt: purchases.get(purchaseIdFor(input.userToken, input.petitionId))?.createdAt ?? timestamp,
        updatedAt: timestamp
      };
      purchases.set(purchase.id, purchase);

      const updated: UserAccount = {
        ...user,
        paidPetitionIds: Array.from(new Set([...user.paidPetitionIds, input.petitionId])),
        updatedAt: timestamp
      };
      users.set(input.userToken, updated);
      return updated;
    }
  };
}

export interface MongoAppStoreOptions {
  uri: string;
  dbName?: string;
}

export function createMongoAppStore({ uri, dbName = "eb1a_fyi" }: MongoAppStoreOptions): AppStore {
  const client = new MongoClient(uri);
  let dbPromise: Promise<Db> | null = null;

  async function db(): Promise<Db> {
    dbPromise ??= client.connect().then(() => client.db(dbName));
    return dbPromise;
  }

  async function collection<T extends object>(name: string): Promise<Collection<T & Document>> {
    return (await db()).collection<T & Document>(name);
  }

  return {
    async saveFeedback(input) {
      const submissions = await collection<FeedbackSubmission>("feedback_submissions");
      const submission: FeedbackSubmission = {
        ...input,
        id: `feedback_${uuid()}`,
        createdAt: now()
      };
      await submissions.insertOne(submission);
      return submission;
    },

    async upsertUserByEmail(email) {
      const normalizedEmail = email.trim().toLowerCase();
      const token = userIdForEmail(normalizedEmail);
      const timestamp = now();
      const users = await collection<UserAccount>("users");

      await users.updateOne(
        { token },
        {
          $setOnInsert: {
            id: token,
            email: normalizedEmail,
            token,
            paidPetitionIds: [],
            createdAt: timestamp
          },
          $set: { updatedAt: timestamp }
        },
        { upsert: true }
      );

      const user = await users.findOne({ token });
      if (!user) throw new Error("Failed to create user");
      return withoutMongoId(user);
    },

    async findUserByToken(token) {
      if (!token) return null;
      const users = await collection<UserAccount>("users");
      const user = await users.findOne({ token });
      return user ? withoutMongoId(user) : null;
    },

    async markPetitionPurchased(input) {
      const users = await collection<UserAccount>("users");
      const user = await users.findOne({ token: input.userToken });
      if (!user) return null;

      const timestamp = now();
      const purchaseId = purchaseIdFor(input.userToken, input.petitionId);
      const purchases = await collection<PetitionPurchase>("purchases");
      await purchases.updateOne(
        { id: purchaseId },
        {
          $setOnInsert: {
            id: purchaseId,
            userId: user.id,
            userToken: input.userToken,
            petitionId: input.petitionId,
            status: "paid",
            createdAt: timestamp
          },
          $set: {
            checkoutSessionId: input.checkoutSessionId,
            updatedAt: timestamp
          }
        },
        { upsert: true }
      );

      await users.updateOne(
        { token: input.userToken },
        {
          $addToSet: { paidPetitionIds: input.petitionId },
          $set: { updatedAt: timestamp }
        }
      );

      const updated = await users.findOne({ token: input.userToken });
      return updated ? withoutMongoId(updated) : null;
    }
  };
}

export function createAppStoreFromEnv(env: NodeJS.ProcessEnv = process.env): AppStore {
  if (env.MONGODB_URI) {
    return createMongoAppStore({ uri: env.MONGODB_URI, dbName: env.MONGODB_DB_NAME });
  }

  return createMemoryAppStore();
}

function withoutMongoId<T extends object>(document: T & { _id?: unknown }): T {
  const { _id: _ignored, ...rest } = document;
  return rest as T;
}
