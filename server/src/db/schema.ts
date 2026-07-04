import * as p from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

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

// better auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
