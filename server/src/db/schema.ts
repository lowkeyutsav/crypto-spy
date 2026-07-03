import * as p from "drizzle-orm/pg-core";

export const cryptocurrencies = p.pgTable("cryptocurrencies", {
  id: p.uuid("id").defaultRandom().primaryKey(),
  ticker: p.varchar("ticker", { length: 10 }).notNull().unique(),
  name: p.varchar("name", { length: 50 }).notNull(),
  currentPrice: p.numeric("current_price", { precision: 20, scale: 8 }).$type<
    number
  >(),
  updatedAt: p.timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).$onUpdate(() => new Date()),
});

export const triggerDirectionEnum = p.pgEnum("trigger_directions", [
  "ABOVE",
  "BELOW",
]);

export const priceAlerts = p.pgTable("price_alerts", {
  id: p.uuid("id").defaultRandom().primaryKey(),
  userId: p.text("user_id").notNull(),
  cryptoId: p.uuid("crypto_id").notNull().references(
    () => cryptocurrencies.id,
    { onDelete: "cascade" },
  ),
  targetPrice: p.numeric("target_price", { precision: 20, scale: 8 }).notNull()
    .$type<number>(),
  direction: triggerDirectionEnum(),
  emailNotification: p.boolean("email_notification").default(true),
  pushNotification: p.boolean("push_notification").default(false),
  is_active: p.boolean("is_active").default(true),
  is_triggered: p.boolean("is_triggered").default(false),
  createdAt: p.timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).notNull().$default(() => new Date()),
}, (table) => [
  p.index("idx_active_alerts").on(
    table.is_active,
    table.is_triggered,
  ),
]);

// better-auth schema for auth
export const user = p.pgTable("user", {
  id: p.text("id").primaryKey(),
  name: p.text("name").notNull(),
  email: p.text("email").notNull().unique(),
  emailVerified: p.boolean("email_verified").notNull(),
  image: p.text("image"),
  createdAt: p.timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: p.timestamp("updated_at", { mode: "date", withTimezone: true }).notNull(),
});

export const session = p.pgTable("session", {
  id: p.text("id").primaryKey(),
  expiresAt: p.timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  token: p.text("token").notNull().unique(),
  createdAt: p.timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: p.timestamp("updated_at", { mode: "date", withTimezone: true }).notNull(),
  userId: p.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = p.pgTable("account", {
  id: p.text("id").primaryKey(),
  accountId: p.text("account_id").notNull(),
  providerId: p.text("provider_id").notNull(),
  userId: p.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: p.text("access_token"),
  refreshToken: p.text("refresh_token"),
  idToken: p.text("id_token"),
  accessTokenExpiresAt: p.timestamp("access_token_expires_at", { mode: "date", withTimezone: true }),
  refreshTokenExpiresAt: p.timestamp("refresh_token_expires_at", { mode: "date", withTimezone: true }),
  scope: p.text("scope"),
  password: p.text("password"),
  createdAt: p.timestamp("created_at", { mode: "date", withTimezone: true }).notNull(),
  updatedAt: p.timestamp("updated_at", { mode: "date", withTimezone: true }).notNull(),
});

export const verification = p.pgTable("verification", {
  id: p.text("id").primaryKey(),
  identifier: p.text("identifier").notNull(),
  value: p.text("value").notNull(),
  expiresAt: p.timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  createdAt: p.timestamp("created_at", { mode: "date", withTimezone: true }),
  updatedAt: p.timestamp("updated_at", { mode: "date", withTimezone: true }),
});
