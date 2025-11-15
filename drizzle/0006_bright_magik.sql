ALTER TYPE "public"."order_status" ADD VALUE 'in_production' BEFORE 'canceled';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'on_the_way' BEFORE 'canceled';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'delivered' BEFORE 'canceled';