"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddToCartButton from "./add-to-cart-button";

interface ProductActionsProps {
  productVariantId: string;
  maxStock: number;
}

const ProductActions = ({ productVariantId, maxStock }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);

  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increment = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const disableMinus = quantity <= 1;
  const disablePlus = quantity >= maxStock;

  return (
    <>
      <div className="px-5">
        <div className="space-y-4">
          <h3 className="font-medium">Quantidade</h3>

          <div className="flex w-[110px] items-center justify-between rounded-lg border border-white/20 bg-[#0d111b]">
            <Button
              size="icon"
              variant="ghost"
              disabled={disableMinus}
              onClick={decrement}
              className={disableMinus ? "opacity-30 cursor-not-allowed" : ""}
            >
              <MinusIcon />
            </Button>

            <p className="text-lg font-semibold">{quantity}</p>

            <Button
              size="icon"
              variant="ghost"
              disabled={disablePlus}
              onClick={increment}
              className={disablePlus ? "opacity-30 cursor-not-allowed" : ""}
            >
              <PlusIcon />
            </Button>
          </div>

          {disablePlus && (
            <p className="text-xs text-red-400">
              Estoque máximo disponível: {maxStock}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4 px-5">
        <AddToCartButton productVariantId={productVariantId} quantity={quantity} />
      </div>
    </>
  );
};

export default ProductActions;
