import { pbkdf2Sync, randomBytes } from "crypto";
import { eq, and, gte } from "drizzle-orm";
import { db } from "./db";
import * as schema from "./schema";

/** Set AUTO_APPROVE_AUTH=false in env to require real login. */
export const AUTO_APPROVE_AUTH =
  process.env.AUTO_APPROVE_AUTH !== "false";

const DEV_USER_ID = "dev-user";
const DEV_USERNAME = "dev";

export interface User {
  id: string;
  username: string;
  apiKey: string;
  createdAt: string;
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}

function randomToken(): string {
  return randomBytes(32).toString("hex");
}

function randomId(): string {
  return randomBytes(6).toString("hex");
}

export async function ensureDevUser(): Promise<User> {
  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, DEV_USER_ID))
    .get();
  if (existing) return existing;

  const salt = randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${hashPassword("dev", salt)}`;
  const user = {
    id: DEV_USER_ID,
    username: DEV_USERNAME,
    passwordHash,
    apiKey: process.env.SHOPPER_API_KEY ?? "dev-key-local-only",
    createdAt: new Date().toISOString(),
  };
  db.insert(schema.users).values(user).run();
  return user;
}

export async function getUserCount(): Promise<number> {
  const rows = db.select().from(schema.users).all();
  return rows.length;
}

export async function createUser(
  username: string,
  password: string
): Promise<User | { error: string }> {
  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();
  if (existing) return { error: "Username already taken" };

  const salt = randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${hashPassword(password, salt)}`;
  const user = {
    id: randomId(),
    username: username.trim().toLowerCase(),
    passwordHash,
    apiKey: randomToken(),
    createdAt: new Date().toISOString(),
  };
  db.insert(schema.users).values(user).run();
  return user;
}

export async function verifyUser(
  username: string,
  password: string
): Promise<User | null> {
  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username.trim().toLowerCase()))
    .get();
  if (!user) return null;

  const [salt, storedHash] = user.passwordHash.split(":");
  const hash = hashPassword(password, salt);
  if (hash !== storedHash) return null;
  return user;
}

export async function createSession(userId: string): Promise<string> {
  const token = randomToken();
  const expiresAt = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toISOString();
  db.insert(schema.sessions).values({ token, userId, expiresAt }).run();
  return token;
}

export async function getSessionUser(token: string): Promise<User | null> {
  if (AUTO_APPROVE_AUTH) {
    return ensureDevUser();
  }
  const now = new Date().toISOString();
  const session = db
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.token, token),
        gte(schema.sessions.expiresAt, now)
      )
    )
    .get();
  if (!session) return null;
  return (
    db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId))
      .get() ?? null
  );
}

export async function deleteSession(token: string): Promise<void> {
  db.delete(schema.sessions).where(eq(schema.sessions.token, token)).run();
}

export async function getUserByApiKey(apiKey: string): Promise<User | null> {
  if (AUTO_APPROVE_AUTH) {
    return ensureDevUser();
  }
  return (
    db
      .select()
      .from(schema.users)
      .where(eq(schema.users.apiKey, apiKey))
      .get() ?? null
  );
}
