import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* ============================================================
   USER / AUTH
============================================================ */

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

/* ============================================================
   CATEGORY
============================================================ */

export const categoryTable = pgTable("category", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   PRODUCT
============================================================ */

export const productTable = pgTable("product", {
  id: uuid().primaryKey().defaultRandom(),
  // se a categoria for deletada, o produto continua, mas sem categoria
  categoryId: uuid("category_id").references(() => categoryTable.id, {
    onDelete: "set null",
  }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   VARIANT
============================================================ */

export const productVariantTable = pgTable("product_variant", {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  color: text().notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   SIZE
============================================================ */

export const productSizeTable = pgTable("product_size", {
  id: uuid().primaryKey().defaultRandom(),
  name: text("name").notNull(), // ex.: P, M, G, GG
  slug: text("slug").notNull().unique(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   VARIANT SIZE
============================================================ */

export const productVariantSizeTable = pgTable("product_variant_size", {
  id: uuid().primaryKey().defaultRandom(),

  productVariantId: uuid("product_variant_id")
    .notNull()
    .references(() => productVariantTable.id, { onDelete: "cascade" }),

  sizeId: uuid("size_id")
    .notNull()
    .references(() => productSizeTable.id, { onDelete: "restrict" }),

  stock: integer("stock").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   SHIPPING ADDRESS
============================================================ */

export const shippingAddressTable = pgTable("shipping_address", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  recipientName: text().notNull(),
  street: text().notNull(),
  number: text().notNull(),
  complement: text(),
  city: text().notNull(),
  state: text().notNull(),
  neighborhood: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  cpfOrCnpj: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   CART
============================================================ */

export const cartTable = pgTable("cart", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  shippingAddressId: uuid("shipping_address_id").references(
    () => shippingAddressTable.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cartItemTable = pgTable("cart_item", {
  id: uuid().primaryKey().defaultRandom(),

  cartId: uuid("cart_id")
    .notNull()
    .references(() => cartTable.id, { onDelete: "cascade" }),

  productVariantId: uuid("product_variant_id")
    .notNull()
    .references(() => productVariantTable.id, { onDelete: "cascade" }),

  // tamanho selecionado (pode ser null se variante não tiver tamanho)
  productVariantSizeId: uuid("product_variant_size_id").references(
    () => productVariantSizeTable.id,
    { onDelete: "set null" },
  ),

  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   COUPON
============================================================ */

export const discountTypeEnum = pgEnum("discount_type", ["PERCENT", "FIXED"]);

export const couponTable = pgTable("coupon", {
  id: uuid().primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* ============================================================
   ORDER
============================================================ */

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "canceled",
]);

export const orderTable = pgTable("order", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),

  // guardamos o endereço "snapshot" aqui, então se o address for deletado,
  // o pedido continua válido: por isso set null.
  shippingAddressId: uuid("shipping_address_id")
    .references(() => shippingAddressTable.id, { onDelete: "set null" }),

  recipientName: text().notNull(),
  street: text().notNull(),
  number: text().notNull(),
  complement: text(),
  city: text().notNull(),
  state: text().notNull(),
  neighborhood: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  cpfOrCnpj: text().notNull(),

  couponId: uuid("coupon_id").references(() => couponTable.id, {
    onDelete: "set null",
  }),

  totalPriceInCents: integer("total_price_in_cents").notNull(),
  status: orderStatus().notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   ORDER ITEM
============================================================ */

export const orderItemTable = pgTable("order_item", {
  id: uuid().primaryKey().defaultRandom(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => orderTable.id, { onDelete: "cascade" }),

  productVariantId: uuid("product_variant_id").references(
    () => productVariantTable.id,
    { onDelete: "set null" },
  ),

  productVariantSizeId: uuid("product_variant_size_id").references(
    () => productVariantSizeTable.id,
    { onDelete: "set null" },
  ),

  quantity: integer("quantity").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================================================
   RELATIONS
============================================================ */

export const userRelations = relations(userTable, ({ many, one }) => ({
  shippingAddresses: many(shippingAddressTable),
  cart: one(cartTable, {
    fields: [userTable.id],
    references: [cartTable.userId],
  }),
  orders: many(orderTable),
}));

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  products: many(productTable),
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
  category: one(categoryTable, {
    fields: [productTable.categoryId],
    references: [categoryTable.id],
  }),
  variants: many(productVariantTable),
}));

export const productVariantRelations = relations(
  productVariantTable,
  ({ one, many }) => ({
    product: one(productTable, {
      fields: [productVariantTable.productId],
      references: [productTable.id],
    }),
    cartItems: many(cartItemTable),
    orderItems: many(orderItemTable),
    sizes: many(productVariantSizeTable),
  }),
);

export const productSizeRelations = relations(
  productSizeTable,
  ({ many }) => ({
    variantSizes: many(productVariantSizeTable),
  }),
);

export const productVariantSizeRelations = relations(
  productVariantSizeTable,
  ({ one }) => ({
    variant: one(productVariantTable, {
      fields: [productVariantSizeTable.productVariantId],
      references: [productVariantTable.id],
    }),
    size: one(productSizeTable, {
      fields: [productVariantSizeTable.sizeId],
      references: [productSizeTable.id],
    }),
  }),
);

export const shippingAddressRelations = relations(
  shippingAddressTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [shippingAddressTable.userId],
      references: [userTable.id],
    }),
    cart: one(cartTable, {
      fields: [shippingAddressTable.id],
      references: [cartTable.shippingAddressId],
    }),
    orders: many(orderTable),
  }),
);

export const cartRelations = relations(cartTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [cartTable.userId],
    references: [userTable.id],
  }),
  shippingAddress: one(shippingAddressTable, {
    fields: [cartTable.shippingAddressId],
    references: [shippingAddressTable.id],
  }),
  items: many(cartItemTable),
}));

export const cartItemRelations = relations(cartItemTable, ({ one }) => ({
  cart: one(cartTable, {
    fields: [cartItemTable.cartId],
    references: [cartTable.id],
  }),
  productVariant: one(productVariantTable, {
    fields: [cartItemTable.productVariantId],
    references: [productVariantTable.id],
  }),
  productVariantSize: one(productVariantSizeTable, {
    fields: [cartItemTable.productVariantSizeId],
    references: [productVariantSizeTable.id],
  }),
}));

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [orderTable.userId],
    references: [userTable.id],
  }),
  shippingAddress: one(shippingAddressTable, {
    fields: [orderTable.shippingAddressId],
    references: [shippingAddressTable.id],
  }),
  coupon: one(couponTable, {
    fields: [orderTable.couponId],
    references: [couponTable.id],
  }),
  items: many(orderItemTable),
}));

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderItemTable.orderId],
    references: [orderTable.id],
  }),
  productVariant: one(productVariantTable, {
    fields: [orderItemTable.productVariantId],
    references: [productVariantTable.id],
  }),
  productVariantSize: one(productVariantSizeTable, {
    fields: [orderItemTable.productVariantSizeId],
    references: [productVariantSizeTable.id],
  }),
}));
