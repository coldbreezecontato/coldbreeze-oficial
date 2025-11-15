"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { formatCentsToBRL } from "@/helpers/money";

import { Button } from "@/components/ui/button";

// 🔥 MUTATIONS NOVAS COM SIZE
import { useRemoveProductFromCart } from "@/hooks/mutations/use-remove-product-from-cart";
import { useIncreaseCartProduct } from "@/hooks/mutations/use-increase-cart-product";
import { useDecreaseCartProduct } from "@/hooks/mutations/use-decrease-cart-product";

interface CartItemProps {
  id: string;
  productName: string;

  productVariantId: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantPriceInCents: number;

  productVariantSizeId: string | null;
  sizeName: string | null;

  quantity: number;
}

const CartItem = ({
  id,
  productName,

  productVariantId,
  productVariantName,
  productVariantImageUrl,
  productVariantPriceInCents,

  productVariantSizeId,
  sizeName,

  quantity,
}: CartItemProps) => {
  const removeMutation = useRemoveProductFromCart(id);
  const decreaseMutation = useDecreaseCartProduct(id);

  const increaseMutation = useIncreaseCartProduct(
    productVariantId,
    productVariantSizeId!,
  );

  const handleRemove = () => {
    removeMutation.mutate(undefined, {
      onSuccess: () => toast.success("Produto removido do carrinho."),
      onError: () => toast.error("Erro ao remover produto."),
    });
  };

  const handleDecrease = () => {
    decreaseMutation.mutate(undefined, {
      onSuccess: () => {},
    });
  };

  const handleIncrease = () => {
    increaseMutation.mutate(undefined, {
      onSuccess: () => {},
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-gradient-to-b from-[#0a0f1f]/40 to-[#0b1220]/60 p-4 transition hover:border-cyan-400/30 hover:shadow-[0_0_12px_rgba(0,255,255,0.15)] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      {/* 🔹 Imagem + informações */}
      <div className="flex items-center gap-4">
        <Image
          src={productVariantImageUrl}
          alt={productVariantName}
          width={80}
          height={80}
          className="rounded-lg border border-white/10 object-cover"
        />

        <div className="flex flex-col justify-between">
          <p className="text-sm font-semibold text-white sm:text-base">
            {productName}
          </p>

          <p className="text-xs text-gray-400">{productVariantName}</p>

          {/* 🔹 Mostrar tamanho */}
          {sizeName && (
            <p className="mt-1 text-xs font-semibold text-cyan-300">
              Tamanho: {sizeName}
            </p>
          )}

          {/* 🔹 Contador */}
          <div className="mt-2 flex w-[90px] items-center justify-between rounded-lg border border-white/10 bg-[#0a0f1f]/50 p-1 sm:w-[100px]">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-300 hover:text-cyan-300"
              onClick={handleDecrease}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>

            <p className="text-xs font-medium text-white sm:text-sm">
              {quantity}
            </p>

            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-300 hover:text-cyan-300"
              onClick={handleIncrease}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 🔹 Preço + remover */}
      <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-gray-400 transition hover:bg-red-500/10 hover:text-red-500"
          onClick={handleRemove}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>

        <p className="text-sm font-bold text-cyan-300 sm:text-base">
          {formatCentsToBRL(productVariantPriceInCents)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
