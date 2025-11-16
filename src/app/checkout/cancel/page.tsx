"use client";

import Image from "next/image";
import Link from "next/link";

import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

const CheckoutCancelPage = () => {
  return (
    <>
      <Header />

      <div className="min-h-[80vh] flex items-center justify-center px-5">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent
            className="
              text-center
              border border-white/10
              bg-gradient-to-b from-[#0c1324] to-[#080e1a]
              shadow-xl shadow-black/40
              p-10 max-w-md
              rounded-2xl
            "
          >
            {/* Mascote triste */}
            <Image
              src="/breeze-triste.png"
              alt="Pagamento cancelado"
              width={250}
              height={250}
              className="mx-auto drop-shadow-lg animate-fade-in"
            />

            {/* Título */}
            <DialogTitle className="mt-6 text-3xl font-semibold tracking-tight text-red-500">
              Pagamento cancelado
            </DialogTitle>

            {/* Descrição */}
            <DialogDescription className="mt-3 text-base text-white/70 leading-relaxed">
              O pagamento foi cancelado.  
              Se isso foi um engano ou ocorreu algum erro, você pode tentar novamente.
            </DialogDescription>

            {/* BOTÕES EM GRID PREMIUM */}
            <DialogFooter className="mt-8 grid grid-cols-2 gap-3 w-full">
              <Button
                asChild
                className="
                  w-full h-12 rounded-full
                  bg-white text-[#0a0f1f]
                  hover:bg-white/90
                  font-medium text-base
                "
              >
                <Link href="/">Voltar para a loja</Link>
              </Button>

              <Button
                asChild
                className="
                  w-full h-12 rounded-full
                  bg-[#0a84ff] text-white
                  hover:bg-[#0a84ff]/80
                  font-medium text-base
                "
              >
                <Link href="/my-orders">Meus pedidos</Link>
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default CheckoutCancelPage;
