CREATE TYPE "public"."user_roles" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_roles" DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;