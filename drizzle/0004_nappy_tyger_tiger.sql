CREATE TABLE "product_size" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_size_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_variant_size" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"size_id" uuid NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cart_item" ADD COLUMN "product_variant_size_id" uuid;--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "product_variant_size_id" uuid;--> statement-breakpoint
ALTER TABLE "product_variant_size" ADD CONSTRAINT "product_variant_size_product_variant_id_product_variant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_size" ADD CONSTRAINT "product_variant_size_size_id_product_size_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."product_size"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_variant_size_id_product_variant_size_id_fk" FOREIGN KEY ("product_variant_size_id") REFERENCES "public"."product_variant_size"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_variant_size_id_product_variant_size_id_fk" FOREIGN KEY ("product_variant_size_id") REFERENCES "public"."product_variant_size"("id") ON DELETE set null ON UPDATE no action;