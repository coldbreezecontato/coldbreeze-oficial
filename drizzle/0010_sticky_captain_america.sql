ALTER TABLE "order" ADD COLUMN "subtotal_in_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "shipping_in_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "discount_in_cents" integer DEFAULT 0 NOT NULL;