"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { addProductToCart } from "@/actions/add-cart-product";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
}

const AddToCartButton = ({
  productVariantId,
  quantity,
}: AddToCartButtonProps) => {
  const queryClient = useQueryClient();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId, quantity],
    mutationFn: async () =>
      addProductToCart({
        productVariantId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      // ✅ Se for não autorizado, mostra o aviso de login
      if (error instanceof Error && error.message === "Unauthorized") {
        setShowLoginPrompt(true);
      }
    },
  });

  return (
    <>
      <Button
        className="rounded-full mt-5 cursor-pointer border-[#192344]"
        size="lg"
        variant="outline"
        disabled={isPending}
        onClick={() => mutate()}
      >
        {isPending && <Loader2 className="animate-spin mr-2" />}
        Adicionar à sacola
      </Button>

      {/* ✅ Modal simples de login */}
      {showLoginPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] 
        border-b border-[#0a84ff]/20  p-6 rounded-2xl shadow-xl text-center space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                asChild
                className="rounded-full bg-[#192344] text-white hover:bg-[#22315c]"
              >
                <Link href="/authentication">Fazer login</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLoginPrompt(false)}
                className="cursor-pointer"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddToCartButton;
