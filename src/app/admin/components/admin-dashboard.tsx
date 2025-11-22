"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createProduct, deleteProduct } from "@/actions/admin/admin-products";
import {
  createSizeAction,
  deleteSizeAction,
} from "@/actions/admin/admin-sizes";

import { categoryTable, productTable, productSizeTable } from "@/db/schema";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/header";

/* -------------------------------------------
   TYPES
-------------------------------------------- */
type Category = typeof categoryTable.$inferSelect;
type Size = typeof productSizeTable.$inferSelect;

type Product = typeof productTable.$inferSelect & {
  category: Category | null;
  variants?: {
    id: string;
    color: string;
    priceInCents: number;
    imageUrl: string;
  }[];
};

// Variante criada no admin
type Variant = {
  color: string;
  priceInCents: string;
  imageUrl: string;
  sizes: { sizeId: string; stock: number }[];
};

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  sizes: Size[];
}

/* -------------------------------------------
   COMPONENT
-------------------------------------------- */
export default function AdminDashboard({
  products,
  categories,
  sizes,
}: AdminDashboardProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [description, setDescription] = useState("Cold Breeze");
  const [stock, setStock] = useState(0);
  const [variants, setVariants] = useState<Variant[]>([
    { color: "", priceInCents: "", imageUrl: "", sizes: [] },
  ]);

  const router = useRouter();

  /* -------------------------------------------
     VARIANTS HANDLERS
  -------------------------------------------- */
  function handleAddVariant() {
    setVariants((prev) => [
      ...prev,
      { color: "", priceInCents: "", imageUrl: "", sizes: [] },
    ]);
  }

  function handleVariantChange<K extends keyof Variant>(
    index: number,
    field: K,
    value: Variant[K],
  ) {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleSizeStockChange(
    variantIndex: number,
    sizeId: string,
    stock: number | null,
  ) {
    setVariants((prev) => {
      const updated = [...prev];
      const v = { ...updated[variantIndex] };
      const currentSizes = [...(v.sizes ?? [])];

      const existingIndex = currentSizes.findIndex((s) => s.sizeId === sizeId);

      // 🔥 CORREÇÃO: 0 agora é permitido!
      if (stock === null || Number.isNaN(stock)) {
        if (existingIndex >= 0) currentSizes.splice(existingIndex, 1);
      } else {
        if (existingIndex >= 0) {
          currentSizes[existingIndex] = { sizeId, stock };
        } else {
          currentSizes.push({ sizeId, stock });
        }
      }

      v.sizes = currentSizes;
      updated[variantIndex] = v;
      return updated;
    });
  }

  /* -------------------------------------------
     CREATE PRODUCT
  -------------------------------------------- */
  async function handleCreateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", categoryId);
    formData.append("description", description);
    formData.append("variants", JSON.stringify(variants));
    formData.append("stock", String(stock));

    const res = await createProduct(formData);

    if (res.ok) {
      toast.success(res.message);
      setName("");
      setVariants([{ color: "", priceInCents: "", imageUrl: "", sizes: [] }]);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  const fallbackImage =
    "https://res.cloudinary.com/dljjztgci/image/upload/v1761498743/CB_Default_noimage.jpg";

  /* -------------------------------------------
     RENDER
  -------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1f] to-[#090d18] p-8 text-white">
      <Header />

      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      {/* ---------------- TABELA DE TAMANHOS (CRUD GLOBAL) ---------------- */}
      <div className="mb-10 rounded-lg border border-white/10 p-4">
        <h2 className="mb-4 text-lg font-semibold">Tamanhos Disponíveis</h2>

        {/* FORM CREATE SIZE */}
        <form action={createSizeAction} className="mb-4 flex gap-3">
          <Input
            name="sizeName"
            placeholder="Adicionar tamanho (ex: P, M, G, GG, 38...)"
            className="text-blue-300"
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Criar
          </Button>
        </form>

        {/* LISTA DOS TAMANHOS */}
        <ul className="space-y-2">
          {sizes.map((size) => (
            <li
              key={size.id}
              className="flex items-center justify-between rounded-lg border border-white/10 p-3"
            >
              <span>{size.name}</span>

              <form action={deleteSizeAction}>
                <input type="hidden" name="sizeId" value={size.id} />
                <Button variant="destructive">Remover</Button>
              </form>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------------- FORM DE CRIAÇÃO DE PRODUTOS ---------------- */}
      <form onSubmit={handleCreateProduct} className="mb-10 space-y-6">
        {/* Campos principais */}
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            name="name"
            placeholder="Nome do produto"
            className="flex-1 text-blue-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            name="categoryId"
            className="flex-1 rounded-lg bg-white/90 px-2 py-1 text-black"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          name="description"
          placeholder="Descrição do produto"
          className="text-blue-300"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          type="number"
          placeholder="Estoque total"
          className="text-blue-300"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />

        {/* ---------------- VARIANTES + TAMANHOS ---------------- */}
        <div className="space-y-4 rounded-lg border border-white/10 p-4">
          <h2 className="text-lg font-semibold">Variantes</h2>

          {variants.map((variant, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-white/10 p-3"
            >
              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-3">
                <Input
                  placeholder="Cor (ex: Preto, Branco, Vermelho...)"
                  className="text-blue-300"
                  value={variant.color}
                  onChange={(e) =>
                    handleVariantChange(index, "color", e.target.value)
                  }
                />

                <Input
                  placeholder="Preço em centavos (ex: 5999)"
                  className="text-blue-300"
                  value={variant.priceInCents}
                  onChange={(e) =>
                    handleVariantChange(index, "priceInCents", e.target.value)
                  }
                />

                <Input
                  placeholder="URL da imagem"
                  className="text-blue-300"
                  value={variant.imageUrl}
                  onChange={(e) =>
                    handleVariantChange(index, "imageUrl", e.target.value)
                  }
                />
              </div>

              {/* TAMANHOS DESSA VARIANTE */}
              <div className="mt-2 space-y-2">
                <h4 className="text-sm font-medium">Tamanhos dessa variante</h4>

                {sizes.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    Nenhum tamanho cadastrado ainda.
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const current = variant.sizes.find(
                      (s) => s.sizeId === size.id,
                    );
                    const isActive = current && Number(current.stock) > 0;

                    return (
                      <div
                        key={size.id}
                        className={
                          "flex w-[80px] flex-col items-center gap-1 rounded-lg border px-3 py-2 transition-all " +
                          (isActive
                            ? "border-blue-400 bg-blue-600 shadow-md"
                            : "border-white/10 bg-[#111827]")
                        }
                      >
                        <span className="text-xs font-semibold">
                          {size.name}
                        </span>

                        <Input
                          type="number"
                          min={0}
                          className="h-7 border border-white/10 bg-transparent text-xs text-blue-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder="Qtd"
                          value={current?.stock ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const stock = raw === "" ? null : Number(raw);
                            handleSizeStockChange(index, size.id, stock);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={handleAddVariant}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Adicionar Variante
          </Button>
        </div>

        <Button type="submit" className="bg-[#192344] hover:bg-[#22315c]">
          Criar Produto
        </Button>
      </form>

      {/* ---------------- LISTA DE PRODUTOS ---------------- */}
      <div className="space-y-4">
        {products.map((product) => {
          const imageUrl =
            product.variants?.[0]?.imageUrl?.trim() || fallbackImage;

          return (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#101626] p-4"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-400">
                  {product.category?.name ?? "Sem categoria"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {product.variants?.length || 0} variante(s)
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={async () => {
                  const res = await deleteProduct(product.id);
                  if (res.ok) {
                    toast.success(res.message);
                    router.refresh();
                  } else {
                    toast.error(res.message);
                  }
                }}
              >
                Remover
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
