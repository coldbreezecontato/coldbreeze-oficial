import crypto from "crypto";

import { db } from ".";
import { categoryTable, productTable, productVariantTable } from "./schema";
import { BedSingle } from "lucide-react";

const productImages = {
  Adidas: {
    Vermelha: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785853/CB_Adidas_ysy8xb.jpg",
    ],
    Branca: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785849/CB_Adidas_azul_uwevmm.jpg",
    ],
  },
  "Quick Silver": {
    Branca: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785858/CB_Quick_Silver_2_aivw4s.jpg",
    ],
  },
  "Nike": {
    Preto: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785858/CB_Nike_sqydfm.jpg",
    ],
  },
  "High": {
    Vermelha: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785856/CB_High_enax7p.jpg",
    ],
  },
  "Hurley": {
    Bege: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785855/CB_Hurley_doomjv.jpg",
    ],
  },
  "Oakley": {
    Branca: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785849/CB_Oakley_branca_gbxarj.jpg",
    ],
    Bege: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785854/CB_Oakley_nldfwu.jpg",
    ],
  },
  "Oakley Secundary": {
    Azul: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785852/CB_Oakley_2_bmikzp.jpg",
    ],
    Vermelha: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785849/CB_Oakley_3_ys6h38.jpg",
    ],
  },
  "Tony Country": {
    Preta: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785852/CB_Tony_Country_hb0u3o.jpg",
    ],
  },
  "Quick Silver two": {
    Bege: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785852/CB_Quick_Silver_3_jctomn.jpg",
    ],
  },
  "Quick Silver three": {
    Branca: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785849/CB_Quick_Silver_4_va3iln.jpg",
    ],
  },
  "Nike Two": {
    Branca: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785849/CB_Nike_2_tcne05.jpg",
    ],
  },
  "Hang Loose": {
    Azul: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785849/CB_Maozinha_cajss3.jpg",
    ],
  },
  "Diesel": {
    Bege: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760785849/CB_Diesel_vlcaky.jpg",
    ],
  },
  "Quick Silver Four": {
    Preta: [
      "https://res.cloudinary.com/dgqjzpown/image/upload/v1760783545/CB_Quick_Silver_zb00rv.jpg",
    ],
  },
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

const categories = [
  {
    name: "Bermuda & Shorts",
    description: "Bermudas e shorts para todas as ocasiões",
  },
  {
    name: "Calças",
    description: "Calças casuais e esportivas",
  },
  {
    name: "Camisetas",
    description: "Camisetas casuais e esportivas",
  },
  {
    name: "Jaquetas & Moletons",
    description: "Jaquetas, corta-ventos e moletons",
  },
  {
    name: "Tênis",
    description: "Tênis casuais e esportivos",
  },
];

const products = [
  {
    name: "Adidas",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Vermelha", price: 5999 },
      { color: "Branca", price: 5999 },
    ],
  },
  {
    name: "Quick Silver",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Branca", price: 5999 },
    ],
  },
  {
    name: "Nike",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Preta", price: 5999 },
    ],
  },
  {
    name: "High",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Vermelha", price: 5999 },
    ],
  },
  {
    name: "Hurley",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Bege", price: 5999 },
    ],
  },
   {
    name: "Oakley",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Branca", price: 5999 },
      { color: "Bege", price: 5999 },
    ],
  },
  {
    name: "Oakley Secundary",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Azul", price: 5999 },
      { color: "Vermelha", price: 5999 },
    ],
  },
  {
    name: "Tony Country",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Preta", price: 5999 },
    ],
  },
  {
    name: "Quick Silver two",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Cinza", price: 5999 },
    ],
  },
  {
    name: "Quick Silver three",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Branca", price: 5999 },
    ],
  },
  {
    name: "Nike Two",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Branca", price: 5999 },
    ],
  },
  {
    name: "Hang Loose",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Azul", price: 5999 },
    ],
  },
  {
    name: "Diesel",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Bege", price: 5999 },
    ],
  },
  {
    name: "Quick Silver Four",
    description:
      "Cold Breeze",
    categoryName: "Camisetas",
    variants: [
      { color: "Preta", price: 5999 },
    ],
  },
];

async function main() {
  console.log("🌱 Iniciando o seeding do banco de dados...");

  try {
    // Limpar dados existentes
    console.log("🧹 Limpando dados existentes...");
    await db.delete(productVariantTable);
    await db.delete(productTable);
    await db.delete(categoryTable);
    console.log("✅ Dados limpos com sucesso!");

    // Inserir categorias primeiro
    const categoryMap = new Map<string, string>();

    console.log("📂 Criando categorias...");
    for (const categoryData of categories) {
      const categoryId = crypto.randomUUID();
      const categorySlug = generateSlug(categoryData.name);

      console.log(`  📁 Criando categoria: ${categoryData.name}`);

      await db.insert(categoryTable).values({
        id: categoryId,
        name: categoryData.name,
        slug: categorySlug,
      });

      categoryMap.set(categoryData.name, categoryId);
    }

    // Inserir produtos
    for (const productData of products) {
      const productId = crypto.randomUUID();
      const productSlug = generateSlug(productData.name);
      const categoryId = categoryMap.get(productData.categoryName);

      if (!categoryId) {
        throw new Error(
          `Categoria "${productData.categoryName}" não encontrada`,
        );
      }

      console.log(`📦 Criando produto: ${productData.name}`);

      await db.insert(productTable).values({
        id: productId,
        name: productData.name,
        slug: productSlug,
        description: productData.description,
        categoryId: categoryId,
      });

      // Inserir variantes do produto
      for (const variantData of productData.variants) {
        const variantId = crypto.randomUUID();
        const productKey = productData.name as keyof typeof productImages;
        const variantImages =
          productImages[productKey]?.[
            variantData.color as keyof (typeof productImages)[typeof productKey]
          ] || [];

        console.log(`  🎨 Criando variante: ${variantData.color}`);

        await db.insert(productVariantTable).values({
          id: variantId,
          name: variantData.color,
          productId: productId,
          color: variantData.color,
          imageUrl: variantImages[0] || "",
          priceInCents: variantData.price,
          slug: generateSlug(`${productData.name}-${variantData.color}`),
        });
      }
    }

    console.log("✅ Seeding concluído com sucesso!");
    console.log(
      `📊 Foram criadas ${categories.length} categorias, ${
        products.length
      } produtos com ${products.reduce(
        (acc, p) => acc + p.variants.length,
        0,
      )} variantes.`,
    );
  } catch (error) {
    console.error("❌ Erro durante o seeding:", error);
    throw error;
  }
}

main().catch(console.error);