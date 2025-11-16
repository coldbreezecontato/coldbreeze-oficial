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

const CheckoutSuccessPage = () => {
  return (
    <>
      <Header />

      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="max-w-md border border-white/10 bg-gradient-to-b from-[#0c1324] to-[#080e1a] p-10 text-center shadow-xl shadow-black/40">
            <Image
              src="/illustration.png"
              alt="Pedido efetuado"
              width={260}
              height={260}
              className="animate-fade-in mx-auto drop-shadow-lg"
            />

            <DialogTitle className="mt-6 text-3xl font-semibold tracking-tight text-white">
              Pedido efetuado!
            </DialogTitle>

            <DialogDescription className="mt-2 text-base leading-relaxed text-white/70">
              Sua compra foi concluída com sucesso. Você pode acompanhar todo o
              progresso na página{" "}
              <span className="font-semibold text-white">Meus Pedidos</span>.
            </DialogDescription>

            <DialogFooter className="mt-8 grid w-full grid-cols-2 gap-3">
              <Button
                className="h-12 w-full rounded-full bg-white text-base font-medium text-[#0a0f1f] hover:bg-white/90"
                asChild
              >
                <Link href="/">Voltar para a loja</Link>
              </Button>

              <Button
                className="h-12 w-full rounded-full bg-[#0a84ff] text-base font-medium text-white hover:bg-[#0a84ff]/90"
                asChild
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

export default CheckoutSuccessPage;
