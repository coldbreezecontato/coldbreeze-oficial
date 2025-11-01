"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { addProductToCart } from "@/actions/add-cart-product";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
}

const AddToCartButton = ({ productVariantId, quantity }: AddToCartButtonProps) => {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId],
    mutationFn: async () =>
      addProductToCart({
        productVariantId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleAddToCart = () => {
    if (!session?.user) {
      setIsLoginDialogOpen(true);
      return;
    }
    mutate();
  };

  return (
    <>
      <Button
        className="rounded-full mt-5 cursor-pointer border-[#192344]"
        size="lg"
        variant="outline"
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending && <Loader2 className="animate-spin mr-2" />}
        Adicionar à sacola
      </Button>

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="w-[90%] max-w-xs text-center bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] border border-[#0a84ff]/20 rounded-2xl shadow-xl p-6 flex flex-col gap-4 items-center justify-center">
          {/* Adiciona título apenas para acessibilidade */}
          <DialogTitle className="sr-only">Login necessário</DialogTitle>

          <div className="flex justify-center gap-4">
            <Button
              asChild
              className="rounded-full bg-[#192344] text-white hover:bg-[#22315c]"
            >
              <Link href="/authentication">Fazer login</Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full cursor-pointer"
              onClick={() => setIsLoginDialogOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToCartButton;
