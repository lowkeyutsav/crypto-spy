import * as p from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- ENUMS ---

export const triggerDirectionEnum = p.pgEnum("trigger_directions", [
  "ABOVE",
  "BELOW",
]);

export const roleEnum = p.pgEnum("user_roles", [
  "USER",
  "ADMIN",
]);

// --- TABLES ---

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

export const user = p.pgTable("user", {
  id: p.text("id").primaryKey(),
  name: p.text("name").notNull(),
  email: p.text("email").notNull().unique(),
  emailVerified: p.boolean("email_verified").default(false).notNull(),
  role: roleEnum("role").default("USER").notNull(), // Swapped to native DB Enum
  image: p.text("image"),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  updatedAt: p.timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const priceAlerts = p.pgTable("price_alerts", {
  id: p.uuid("id").defaultRandom().primaryKey(),
  userId: p.text("user_id").notNull().references(() => user.id, {
    onDelete: "cascade",
  }), // Added foreign key safety
  cryptoId: p.uuid("crypto_id").notNull().references(
    () => cryptocurrencies.id,
    { onDelete: "cascade" },
  ),
  targetPrice: p.numeric("target_price", { precision: 20, scale: 8 }).notNull()
    .$type<number>(),
  direction: triggerDirectionEnum(),
  emailNotification: p.boolean("email_notification").default(true),
  pushNotification: p.boolean("push_notification").default(false),
  isActive: p.boolean("is_active").default(true), // camelCase alignment
  isTriggered: p.boolean("is_triggered").default(false), // camelCase alignment
  createdAt: p.timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).notNull().$default(() => new Date()),
}, (table) => [
  p.index("idx_active_alerts").on(
    table.isActive,
    table.isTriggered,
  ),
]);

export const session = p.pgTable(
  "session",
  {
    id: p.text("id").primaryKey(),
    expiresAt: p.timestamp("expires_at").notNull(),
    token: p.text("token").notNull().unique(),
    createdAt: p.timestamp("created_at").defaultNow().notNull(),
    updatedAt: p.timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: p.text("ip_address"),
    userAgent: p.text("user_agent"),
    userId: p.text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [p.index("session_userId_idx").on(table.userId)],
);

export const account = p.pgTable(
  "account",
  {
    id: p.text("id").primaryKey(),
    accountId: p.text("account_id").notNull(),
    providerId: p.text("provider_id").notNull(),
    userId: p.text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: p.text("access_token"),
    refreshToken: p.text("refresh_token"),
    idToken: p.text("id_token"),
    accessTokenExpiresAt: p.timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: p.timestamp("refresh_token_expires_at"),
    scope: p.text("scope"),
    password: p.text("password"),
    createdAt: p.timestamp("created_at").defaultNow().notNull(),
    updatedAt: p.timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [p.index("account_userId_idx").on(table.userId)],
);

export const verification = p.pgTable(
  "verification",
  {
    id: p.text("id").primaryKey(),
    identifier: p.text("identifier").notNull(),
    value: p.text("value").notNull(),
    expiresAt: p.timestamp("expires_at").notNull(),
    createdAt: p.timestamp("created_at").defaultNow().notNull(),
    updatedAt: p.timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [p.index("verification_identifier_idx").on(table.identifier)],
);

// --- RELATIONS ---

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  priceAlerts: many(priceAlerts), // Linked user to their alerts
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

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(user, {
    fields: [priceAlerts.userId],
    references: [user.id],
  }),
  cryptocurrency: one(cryptocurrencies, {
    fields: [priceAlerts.cryptoId],
    references: [cryptocurrencies.id],
  }),
}));
