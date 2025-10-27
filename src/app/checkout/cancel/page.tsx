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
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="text-center">
          <Image
            src="/breeze-triste.png"
            alt="Pagamento cancelado"
            width={300}
            height={300}
            className="mx-auto"
          />
          <DialogTitle className="mt-4 text-2xl text-red-600">
            Pagamento cancelado
          </DialogTitle>

          <DialogDescription className="font-medium">
            O pagamento foi cancelado. Caso tenha ocorrido um erro, você pode
            tentar novamente.
          </DialogDescription>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              className="rounded-full"
              variant="default"
              size="lg"
              asChild
            >
              <Link href="/cart">Tentar novamente</Link>
            </Button>

            <Button
              className="rounded-full"
              variant="outline"
              size="lg"
              asChild
            >
              <Link href="/">Voltar para a loja</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckoutCancelPage;
