import { MongoClient, type Collection, type Db, type Document, type IndexDescription } from "mongodb";
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

export const mongoDatabaseNames = {
  development: "eb1a_app_v2_dev",
  production: "eb1a_app_v2_prod"
} as const;

export const mongoCollections = {
  feedbackSubmissions: "feedback_submissions",
  users: "users",
  purchases: "purchases"
} as const;

export interface MongoCollectionIndexSpec {
  collection: string;
  indexes: IndexDescription[];
}

export interface MongoDbNameEnv {
  MONGODB_DB_NAME?: string;
  NODE_ENV?: string;
}

const now = () => new Date().toISOString();

function userIdForEmail(email: string): string {
  return `user_${Buffer.from(email).toString("base64url")}`;
}

function purchaseIdFor(userToken: string, petitionId: string): string {
  return `purchase_${Buffer.from(`${userToken}:${petitionId}`).toString("base64url")}`;
}

export function normalizeFeedbackInput(input: FeedbackSubmissionInput): FeedbackSubmissionInput {
  return {
    buyerInterest: input.buyerInterest,
    buyerPriceUsd: input.buyerInterest === "yes" ? input.buyerPriceUsd : null,
    buyerComment: input.buyerInterest === "no" ? normalizeOptionalText(input.buyerComment) : null,
    contributorInterest: input.contributorInterest,
    contributorCompensationUsd: input.contributorInterest === "yes" ? input.contributorCompensationUsd : null,
    contributorComment: input.contributorInterest === "no" ? normalizeOptionalText(input.contributorComment) : null,
    email: normalizeOptionalEmail(input.email)
  };
}

export function defaultMongoDbNameForEnv(env: MongoDbNameEnv = process.env): string {
  const configuredName = env.MONGODB_DB_NAME?.trim();
  if (configuredName) return configuredName;
  return env.NODE_ENV === "production" ? mongoDatabaseNames.production : mongoDatabaseNames.development;
}

export function mongoAppStoreIndexSpecs(collections = mongoCollections): MongoCollectionIndexSpec[] {
  return [
    {
      collection: collections.feedbackSubmissions,
      indexes: [
        { key: { createdAt: -1 }, name: "feedback_created_at_desc" },
        { key: { email: 1 }, name: "feedback_email_sparse", sparse: true },
        { key: { buyerInterest: 1, contributorInterest: 1 }, name: "feedback_interest_segment" }
      ]
    },
    {
      collection: collections.users,
      indexes: [
        { key: { token: 1 }, name: "users_token_unique", unique: true },
        { key: { email: 1 }, name: "users_email_unique", unique: true }
      ]
    },
    {
      collection: collections.purchases,
      indexes: [
        { key: { id: 1 }, name: "purchases_id_unique", unique: true },
        { key: { userToken: 1, petitionId: 1 }, name: "purchases_user_petition_unique", unique: true }
      ]
    }
  ];
}

export function createMemoryAppStore(): AppStore {
  const feedback = new Map<string, FeedbackSubmission>();
  const users = new Map<string, UserAccount>();
  const purchases = new Map<string, PetitionPurchase>();

  return {
    async saveFeedback(input) {
      const normalized = normalizeFeedbackInput(input);
      const submission: FeedbackSubmission = {
        ...normalized,
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
  ensureIndexes?: boolean;
}

export function createMongoAppStore({ uri, dbName = defaultMongoDbNameForEnv(), ensureIndexes = true }: MongoAppStoreOptions): AppStore {
  const client = new MongoClient(uri);
  let dbPromise: Promise<Db> | null = null;
  let indexesPromise: Promise<void> | null = null;

  async function db(): Promise<Db> {
    dbPromise ??= client.connect().then(() => client.db(dbName));
    return dbPromise;
  }

  async function collection<T extends object>(name: string): Promise<Collection<T & Document>> {
    if (ensureIndexes) await ensureMongoIndexes();
    return (await db()).collection<T & Document>(name);
  }

  async function ensureMongoIndexes(): Promise<void> {
    indexesPromise ??= (async () => {
      const database = await db();
      await Promise.all(
        mongoAppStoreIndexSpecs().map(({ collection: collectionName, indexes }) => database.collection(collectionName).createIndexes(indexes))
      );
    })();
    return indexesPromise;
  }

  return {
    async saveFeedback(input) {
      const submissions = await collection<FeedbackSubmission>(mongoCollections.feedbackSubmissions);
      const normalized = normalizeFeedbackInput(input);
      const submission: FeedbackSubmission = {
        ...normalized,
        id: `feedback_${uuid()}`,
        createdAt: now()
      };
      await submissions.insertOne(submission);
      return withoutMongoId(submission);
    },

    async upsertUserByEmail(email) {
      const normalizedEmail = email.trim().toLowerCase();
      const token = userIdForEmail(normalizedEmail);
      const timestamp = now();
      const users = await collection<UserAccount>(mongoCollections.users);

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
      const users = await collection<UserAccount>(mongoCollections.users);
      const user = await users.findOne({ token });
      return user ? withoutMongoId(user) : null;
    },

    async markPetitionPurchased(input) {
      const users = await collection<UserAccount>(mongoCollections.users);
      const user = await users.findOne({ token: input.userToken });
      if (!user) return null;

      const timestamp = now();
      const purchaseId = purchaseIdFor(input.userToken, input.petitionId);
      const purchases = await collection<PetitionPurchase>(mongoCollections.purchases);
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
    return createMongoAppStore({ uri: env.MONGODB_URI, dbName: defaultMongoDbNameForEnv(env) });
  }

  return createMemoryAppStore();
}

function normalizeOptionalText(value: string | null): string | null {
  const normalized = value?.trim() ?? "";
  return normalized || null;
}

function normalizeOptionalEmail(value: string | null): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized || null;
}

function withoutMongoId<T extends object>(document: T & { _id?: unknown }): T {
  const { _id: _ignored, ...rest } = document;
  return rest as T;
}
