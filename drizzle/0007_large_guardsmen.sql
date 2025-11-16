ALTER TABLE "order" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'in_production', 'on_the_way', 'delivered', 'canceled');--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "shipping_in_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_address" ADD COLUMN "shipping_in_cents" integer DEFAULT 0 NOT NULL;