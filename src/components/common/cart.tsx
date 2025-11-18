"use client";

import { ShoppingBasketIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  const totalItems =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full border border-white/10 bg-gradient-to-b from-[#0a0f1f] to-[#0b1220] transition-all duration-300 hover:border-cyan-300/50 hover:shadow-[0_0_12px_rgba(0,255,255,0.15)]"
          >
            <ShoppingBasketIcon className="h-5 w-5 text-cyan-300" />
          </Button>

          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-gradient-to-r from-rose-500 to-red-600 text-[10px] font-bold text-white shadow-lg">
              {totalItems}
            </span>
          )}
        </div>
      </SheetTrigger>

      <SheetContent className="flex flex-col border-none bg-gradient-to-b from-[#0a0f1f] via-[#0b1220] to-[#090d18] p-0">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-center h-8">
            <Image
              src="/mascote-logo.svg"
              width={110}
              height={110}
              alt="logo"
              className="select-none relative top-4"
            />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col justify-between overflow-hidden">
          {/* 🔹 Itens */}
          <ScrollArea className="/* 🔥 ativa o scroll quando ultrapassar 2 itens */ max-h-[360px] overflow-y-auto px-5 py-6">
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
                    productVariantPriceInCents={
                      item.productVariant.priceInCents
                    }
                    quantity={item.quantity}
                    productVariantSizeId={item.productVariantSize?.id ?? null}
                    sizeName={item.productVariantSize?.size?.name ?? null}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-400">
                <ShoppingBasketIcon className="mb-3 h-10 w-10 text-gray-600" />
                <p>Seu carrinho está vazio.</p>
                <p className="mt-1 text-xs text-gray-500">
                  Adicione produtos e veja-os aqui.
                </p>
              </div>
            )}
          </ScrollArea>

          {/* 🔹 Totais */}
          {cart?.items && cart.items.length > 0 && (
            <div className="border-white/10 px-5 py-6 backdrop-blur-md">
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-between">
                  <p>Subtotal</p>
                  <p className="font-semibold text-white">
                    {formatCentsToBRL(cart.totalPriceInCents ?? 0)}
                  </p>
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
                className="mt-6 w-full rounded-full border-1 border-white bg-gray-950 text-white shadow-[0_0_20px_rgba(0,255,255,0.25)] transition-colors duration-300 hover:border-black hover:bg-blue-300 hover:from-cyan-300 hover:to-blue-400 hover:text-black"
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
