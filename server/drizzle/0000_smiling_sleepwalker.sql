CREATE TYPE "public"."trigger_directions" AS ENUM('ABOVE', 'BELOW');--> statement-breakpoint
CREATE TABLE "cryptocurrencies" (
	"id" uuid DEFAULT gen_random_uuid(),
	"ticker" varchar(10) NOT NULL,
	"name" varchar(50) NOT NULL,
	"current_price" numeric(20, 8),
	"updated_at" timestamp with time zone,
	CONSTRAINT "cryptocurrencies_ticker_unique" UNIQUE("ticker")
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" uuid DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"crypto_id" integer NOT NULL,
	"target_price" numeric(20, 8) NOT NULL,
	"direction" "trigger_directions",
	"email_notification" boolean DEFAULT true,
	"push_notification" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_triggered" boolean DEFAULT false,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_crypto_id_cryptocurrencies_id_fk" FOREIGN KEY ("crypto_id") REFERENCES "public"."cryptocurrencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_active_alerts" ON "price_alerts" USING btree ("is_active","is_triggered");