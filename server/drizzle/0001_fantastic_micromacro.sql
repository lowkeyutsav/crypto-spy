ALTER TABLE "cryptocurrencies" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "cryptocurrencies" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "price_alerts" ALTER COLUMN "id" SET NOT NULL;