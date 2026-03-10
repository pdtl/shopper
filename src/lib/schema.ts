import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  apiKey: text("api_key").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: text("expires_at").notNull(),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  category: text("category"),
  defaultStore: text("default_store"),
  createdAt: text("created_at").notNull(),
  deletedAt: text("deleted_at"),
});

export const listEntries = sqliteTable("list_entries", {
  itemId: text("item_id")
    .primaryKey()
    .references(() => items.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  pickedUp: integer("picked_up", { mode: "boolean" }).notNull().default(false),
  unavailable: integer("unavailable", { mode: "boolean" })
    .notNull()
    .default(false),
  storeOverride: text("store_override"),
  addedAt: text("added_at").notNull(),
});

export const inventoryNotes = sqliteTable("inventory_notes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id),
  note: text("note").notNull(),
  createdAt: text("created_at").notNull(),
});
