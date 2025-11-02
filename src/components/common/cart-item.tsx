"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { formatCentsToBRL } from "@/helpers/money";
import { useDecreaseCartProduct } from "@/hooks/mutations/use-decrease-cart-product";
import { useIncreaseCartProduct } from "@/hooks/mutations/use-increase-cart-product";
import { useRemoveProductFromCart } from "@/hooks/mutations/use-remove-product-from-cart";

import { Button } from "../ui/button";

interface CartItemProps {
  id: string;
  productName: string;
  productVariantId: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantPriceInCents: number;
  quantity: number;
}

const CartItem = ({
  id,
  productName,
  productVariantId,
  productVariantName,
  productVariantImageUrl,
  productVariantPriceInCents,
  quantity,
}: CartItemProps) => {
  const removeProductFromCartMutation = useRemoveProductFromCart(id);
  const decreaseCartProductQuantityMutation = useDecreaseCartProduct(id);
  const increaseCartProductQuantityMutation = useIncreaseCartProduct(productVariantId);

  const handleDeleteClick = () => {
    removeProductFromCartMutation.mutate(undefined, {
      onSuccess: () => toast.success("Produto removido do carrinho."),
      onError: () => toast.error("Erro ao remover produto."),
    });
  };

  const handleDecreaseQuantityClick = () => {
    decreaseCartProductQuantityMutation.mutate(undefined, {
      onSuccess: () => toast.success("Quantidade diminuída."),
    });
  };

  const handleIncreaseQuantityClick = () => {
    increaseCartProductQuantityMutation.mutate(undefined, {
      onSuccess: () => toast.success("Quantidade aumentada."),
    });
  };

  return (
    <div
      className="
        flex flex-col sm:flex-row sm:items-center sm:justify-between
        gap-4 sm:gap-6 rounded-xl border border-white/10
        bg-gradient-to-b from-[#0a0f1f]/40 to-[#0b1220]/60
        p-4 transition hover:border-cyan-400/30 hover:shadow-[0_0_12px_rgba(0,255,255,0.15)]
      "
    >
      {/* 🔹 Imagem + infos */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <Image
            src={productVariantImageUrl}
            alt={productVariantName}
            width={80}
            height={80}
            className="rounded-lg object-cover border border-white/10"
          />
        </div>

        <div className="flex flex-col justify-between">
          <p className="text-sm sm:text-base font-semibold text-white">
            {productName}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">{productVariantName}</p>

          {/* 🔹 Contador responsivo */}
          <div
            className="
              mt-2 flex items-center justify-between
              w-[90px] sm:w-[100px]
              rounded-lg border border-white/10 bg-[#0a0f1f]/50 p-1
            "
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-300 hover:text-cyan-300"
              onClick={handleDecreaseQuantityClick}
            >
              <MinusIcon className="w-4 h-4" />
            </Button>
            <p className="text-xs sm:text-sm font-medium text-white">{quantity}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-300 hover:text-cyan-300"
              onClick={handleIncreaseQuantityClick}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 🔹 Preço + Remover */}
      <div
        className="
          flex items-center justify-between sm:flex-col sm:items-end sm:justify-center
          gap-2 sm:gap-3 mt-1 sm:mt-0
        "
      >
        <Button
          variant="ghost"
          size="icon"
          className="
            h-8 w-8 text-gray-400 hover:text-red-500
            hover:bg-red-500/10 rounded-full transition
          "
          onClick={handleDeleteClick}
        >
          <TrashIcon className="w-4 h-4" />
        </Button>

        <p className="text-sm sm:text-base font-bold text-cyan-300">
          {formatCentsToBRL(productVariantPriceInCents)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
