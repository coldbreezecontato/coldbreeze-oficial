"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Bike,
  LogInIcon,
  LogOutIcon,
  MapPinIcon,
  MenuIcon,
  PackageOpenIcon,
  PackageSearchIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// 🔐 E-mails que têm permissão para ver a área administrativa
const ADMIN_EMAILS = [
  "renang@coldbreeze.com",
  "renaan.profissional@gmail.com",
];

const MenuLink = () => {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex items-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer border-none bg-black transition-all hover:bg-zinc-900 md:h-10 md:w-10"
          >
            <MenuIcon className="text-white" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="overflow-y-auto border-none bg-gradient-to-br from-[#0a0f1f] via-[#0c1a33] to-[#08111f] p-0 text-white"
        >
          <div className="border-b border-white/10 px-6 py-5">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold tracking-wide text-white/90 md:text-xl">
                Menu
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="space-y-8 p-6">
            {/* 🔹 Usuário autenticado */}
            {session?.user ? (
              <div className="space-y-6">
                {/* 🔸 Cabeçalho do usuário */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user.image as string} />
                      <AvatarFallback className="bg-cyan-600 text-white">
                        {session.user.name?.split(" ")?.[0]?.[0]}
                        {session.user.name?.split(" ")?.[1]?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold md:text-base">
                        {session.user.name}
                      </h3>
                      <p className="truncate text-[11px] text-zinc-400 md:text-xs">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => authClient.signOut()}
                    className="transition hover:bg-red-600/20"
                    title="Sair da conta"
                  >
                    <LogOutIcon className="h-4 w-4 text-red-400" />
                  </Button>
                </div>

                {/* 🔸 Opções da conta */}
                <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-lg py-2 text-sm transition hover:bg-cyan-400 hover:text-black md:text-base"
                  >
                    <Link href="/my-orders">
                      <PackageSearchIcon className="h-4 w-4 md:h-5 md:w-5" />
                      Meus Pedidos
                    </Link>
                  </Button>
                </div>

                {/* 🔥 Área Admin (apenas para e-mails permitidos) */}
                {session?.user?.email &&
                  ADMIN_EMAILS.includes(session.user.email) && (
                    <div className="mt-8 border-t border-white/10 pt-4">
                      <p className="mb-3 text-xs font-semibold uppercase text-cyan-400">
                        Área Administrativa
                      </p>

                      <div className="flex flex-col gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full justify-start gap-3 rounded-lg py-2 text-sm hover:bg-cyan-400 hover:text-black md:text-base"
                        >
                          <Link href="/admin-orders">
                            <Bike className="h-4 w-4 md:h-5 md:w-5" />
                            Pedidos (Admin)
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          className="w-full justify-start gap-3 rounded-lg py-2 text-sm hover:bg-cyan-400 hover:text-black md:text-base"
                        >
                          <Link href="/admin">
                            <PackageOpenIcon className="h-4 w-4 md:h-5 md:w-5" />
                            Produtos (Admin)
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              /* 🔹 Usuário não autenticado */
              <div className="flex items-center justify-between rounded-xl border border-white/10 p-4 backdrop-blur-sm">
                <div>
                  <h2 className="text-sm font-semibold text-white md:text-base">
                    Bem-vindo à{" "}
                    <span className="text-cyan-400">Cold Breeze</span>
                  </h2>
                  <p className="text-[12px] text-zinc-400">
                    Faça login para acessar sua conta
                  </p>
                </div>

                <Button
                  size="icon"
                  asChild
                  variant="outline"
                  className="border-zinc-700 bg-transparent transition hover:bg-cyan-400 hover:text-black"
                  title="Entrar"
                >
                  <Link href="/authentication">
                    <LogInIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* 🔹 Rodapé do menu */}
          <div className="mt-auto border-t border-white/10 px-6 py-4 text-center text-[12px] text-zinc-500">
            © 2025 Cold Breeze — Todos os direitos reservados.
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuLink;
