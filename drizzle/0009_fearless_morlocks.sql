ALTER TABLE "cart" ADD COLUMN "shipping_method" text DEFAULT 'cold' NOT NULL;--> statement-breakpoint
ALTER TABLE "cart" ADD COLUMN "shipping_price_in_cents" integer DEFAULT 0 NOT NULL;