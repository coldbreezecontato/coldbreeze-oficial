"use client";

import { ShoppingBasketIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useCart } from "@/hooks/queries/use-cart";
import { formatCentsToBRL } from "@/helpers/money";
import CartItem from "./cart-item";

export const Cart = () => {
  const { data: cart } = useCart();
  const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="
              relative rounded-full bg-gradient-to-b from-[#0a0f1f] to-[#0b1220]
              border border-white/10 hover:border-cyan-300/50 hover:shadow-[0_0_12px_rgba(0,255,255,0.15)]
              transition-all duration-300
            "
          >
            <ShoppingBasketIcon className="w-5 h-5 text-cyan-300" />
          </Button>

          {totalItems > 0 && (
            <span
              className="
                absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center
                rounded-full bg-gradient-to-r from-rose-500 to-red-600
                text-[10px] font-bold text-white shadow-lg
                border border-white/20
              "
            >
              {totalItems}
            </span>
          )}
        </div>
      </SheetTrigger>

      <SheetContent className="flex flex-col bg-gradient-to-b from-[#0a0f1f] via-[#0b1220] to-[#090d18] border-none p-0">
        <SheetHeader className="border-b border-white/10 p-5">
          <SheetTitle className="text-lg font-semibold text-cyan-300 tracking-wide">
            🧊 Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* 🔹 Itens */}
          <ScrollArea className="flex-1 px-5 py-6">
            {cart?.items && cart.items.length > 0 ? (
              <div className="flex flex-col gap-6">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    productVariantId={item.productVariant.id}
                    productName={item.productVariant.product.name}
                    productVariantName={item.productVariant.name}
                    productVariantImageUrl={item.productVariant.imageUrl}
                    productVariantPriceInCents={item.productVariant.priceInCents}
                    quantity={item.quantity}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-sm text-gray-400">
                <ShoppingBasketIcon className="w-10 h-10 text-gray-600 mb-3" />
                <p>Seu carrinho está vazio.</p>
                <p className="text-gray-500 text-xs mt-1">
                  Adicione produtos e veja-os aqui.
                </p>
              </div>
            )}
          </ScrollArea>

          {/* 🔹 Totais */}
          {cart?.items && cart.items.length > 0 && (
            <div
              className="
                border-t border-white/10
                bg-gradient-to-t from-[#0b1220]/90 to-[#0a0f1f]/80
                px-5 py-6 backdrop-blur-md
              "
            >
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-between">
                  <p>Subtotal</p>
                  <p className="font-semibold text-white">
                    {formatCentsToBRL(cart.totalPriceInCents ?? 0)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Entrega</p>
                  <p className="text-green-400 font-medium">Grátis</p>
                </div>

                <Separator className="bg-white/10" />

                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-white">Total</p>
                  <p className="text-base font-bold text-cyan-300">
                    {formatCentsToBRL(cart.totalPriceInCents ?? 0)}
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="
                  w-full mt-6 py-5 rounded-full font-semibold text-white
                  bg-gradient-to-r from-cyan-400 to-blue-500
                  hover:from-cyan-300 hover:to-blue-400
                  shadow-[0_0_20px_rgba(0,255,255,0.25)]
                  transition-all duration-300
                "
              >
                <Link href="/cart/identification">Finalizar Compra</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
