import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";

import ProductActions from "./components/product-actions";
import VariantSelector from "./components/variant-selector";
import SizeSelector from "./components/size-selector";

interface ProductVariantPageProps {
  params: Promise<{ slug: string }>;
}

const ProductVariantPage = async ({ params }: ProductVariantPageProps) => {
  const { slug } = await params;

  const productVariant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.slug, slug),
    with: {
      product: {
        with: {
          variants: true,
        },
      },
      sizes: {
        with: {
          size: true,
        },
      },
    },
  });

  if (!productVariant) return notFound();

  const likelyProducts = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, productVariant.product.categoryId!),
    with: {
      variants: true,
    },
  });

  return (
    <>
      <Header />
      <div className="mt-4"></div>

      <div className="mb-5 flex flex-col space-y-6 md:flex-row md:space-y-0">
        {/* Imagem */}
        <Image
          src={productVariant.imageUrl}
          alt={productVariant.name}
          sizes="100vw"
          height={0}
          width={0}
          className="h-auto w-full object-cover md:h-[500px] md:w-1/2 md:object-contain"
        />

        <div className="md:flex md:flex-col md:justify-center md:space-y-6">
          {/* Variantes */}
          <div className="px-5">
            <VariantSelector
              selectedVariantSlug={productVariant.slug}
              variants={productVariant.product.variants}
            />
          </div>

          {/* Texto */}
          <div className="mt-2 px-5">
            <h2 className="text-lg font-semibold">
              {productVariant.product.name}
            </h2>
            <h3 className="text-muted-foreground mt-2 text-sm">
              {productVariant.name}
            </h3>
            <h3 className="mt-2 text-lg font-semibold">
              {formatCentsToBRL(productVariant.priceInCents)}
            </h3>
          </div>

          {/* Seleção de tamanhos */}
          <div className="px-5">
            <SizeSelector sizes={productVariant.sizes} />
          </div>

          {/* Ações */}
          <ProductActions
            productVariantId={productVariant.id}
            maxStock={productVariant.product.stock} // 👈 AGORA ESTÁ CORRETO
          />

          {/* Descrição */}
          <div className="mt-3 px-5">
            <p>{productVariant.product.description}</p>
          </div>
        </div>
      </div>

      <ProductList title="Talvez você goste" products={likelyProducts} />
      <Footer />
    </>
  );
};

export default ProductVariantPage;
