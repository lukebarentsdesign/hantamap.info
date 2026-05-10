import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, outbreakCases, signals, emailSubscribers, InsertOutbreakCase, InsertSignal, InsertEmailSubscriber } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Fetch all outbreak cases, sorted by date descending.
 */
export async function getOutbreakCases() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(outbreakCases).orderBy(desc(outbreakCases.dateReported)).limit(1000);
    return result;
  } catch (error) {
    console.error("[Database] Failed to fetch outbreak cases:", error);
    return [];
  }
}

/**
 * Fetch a single outbreak case by ID.
 */
export async function getOutbreakCaseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(outbreakCases).where(eq(outbreakCases.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to fetch outbreak case:", error);
    return undefined;
  }
}

/**
 * Create or update an outbreak case.
 */
export async function upsertOutbreakCase(data: InsertOutbreakCase) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(outbreakCases).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to upsert outbreak case:", error);
    return null;
  }
}

/**
 * Fetch all signals (outbreak reports), sorted by date descending.
 */
export async function getSignals(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(signals).orderBy(desc(signals.datePublished)).limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to fetch signals:", error);
    return [];
  }
}

/**
 * Create a new signal.
 */
export async function createSignal(data: InsertSignal) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(signals).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create signal:", error);
    return null;
  }
}

/**
 * Fetch all email subscribers.
 */
export async function getEmailSubscribers() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(emailSubscribers).limit(10000);
    return result;
  } catch (error) {
    console.error("[Database] Failed to fetch email subscribers:", error);
    return [];
  }
}

/**
 * Subscribe an email address.
 */
export async function subscribeEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(emailSubscribers).values({ email, verified: 0 });
    return result;
  } catch (error) {
    console.error("[Database] Failed to subscribe email:", error);
    return null;
  }
}

/**
 * Check if an email is already subscribed.
 */
export async function isEmailSubscribed(email: string) {
  const db = await getDb();
  if (!db) return false;
  try {
    const result = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email)).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to check email subscription:", error);
    return false;
  }
}
