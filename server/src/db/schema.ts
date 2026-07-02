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
