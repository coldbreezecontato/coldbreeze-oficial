"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProduct, deleteProduct } from "@/actions/admin/admin-products";
import { categoryTable, productTable } from "@/db/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/header";

type Category = typeof categoryTable.$inferSelect;
type Product = typeof productTable.$inferSelect & {
  category: Category;
  variants?: {
    id: string;
    color: string;
    priceInCents: number;
    imageUrl: string;
  }[];
};

// 🔹 Tipo das variantes que o admin cria
type Variant = {
  color: string;
  priceInCents: string;
  imageUrl: string;
};

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
}

export default function AdminDashboard({
  products,
  categories,
}: AdminDashboardProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [description, setDescription] = useState("Cold Breeze");
  const [variants, setVariants] = useState<Variant[]>([
    { color: "", priceInCents: "", imageUrl: "" },
  ]);
  const router = useRouter();

  // ➕ Adicionar nova variante
  function handleAddVariant() {
    setVariants([...variants, { color: "", priceInCents: "", imageUrl: "" }]);
  }

  // ✏️ Atualizar valor de uma variante
  function handleVariantChange<K extends keyof Variant>(
    index: number,
    field: K,
    value: Variant[K],
  ) {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  }

  // 🚀 Criar produto (envia tudo para o server action)
  async function handleCreateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", categoryId);
    formData.append("description", description);
    formData.append("variants", JSON.stringify(variants));

    const res = await createProduct(formData);

    if (res.ok) {
      toast.success(res.message);
      setName("");
      setVariants([{ color: "", priceInCents: "", imageUrl: "" }]);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  // 🔹 Fallback para produtos sem imagem
  const fallbackImage =
    "https://res.cloudinary.com/dljjztgci/image/upload/v1761498743/CB_Default_noimage.jpg";

  // 🧊 Renderização
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1f] to-[#090d18] p-8 text-white">
      <Header />

      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Formulário de criação */}
      <form onSubmit={handleCreateProduct} className="space-y-6 mb-10">
        {/* Campos principais */}
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            name="name"
            placeholder="Nome do produto"
            className="text-blue-300 flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            name="categoryId"
            className="rounded-lg px-2 py-1 text-black flex-1 bg-white/90"
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

        {/* Variantes */}
        <div className="space-y-4 border border-white/10 rounded-lg p-4">
          <h2 className="font-semibold text-lg">Variantes</h2>

          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"
            >
              <Input
                placeholder="Cor"
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

      {/* Lista de produtos */}
      <div className="space-y-4">
        {products.map((product) => {
          // Pega imagem da primeira variante, ou usa fallback
          const imageUrl =
            product.variants?.[0]?.imageUrl?.trim() || fallbackImage;

          return (
            <div
              key={product.id}
              className="rounded-xl border border-white/10 p-4 bg-[#101626] flex items-center gap-4"
            >
              {/* 🖼️ Imagem */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* 📝 Info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-400">
                  {product.category.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {product.variants?.length || 0} variante(s)
                </p>
              </div>

              {/* ❌ Botão de remover */}
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
