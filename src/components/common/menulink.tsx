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
  LogInIcon,
  LogOutIcon,
  MapPinIcon,
  MenuIcon,
  PackageSearchIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const MenuLink = () => {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex items-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-black h-9 w-9 md:h-10 md:w-10 cursor-pointer border-none hover:bg-zinc-900 transition-all"
          >
            <MenuIcon className="text-white" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="border-none p-0 bg-gradient-to-br from-[#0a0f1f] via-[#0c1a33] to-[#08111f] text-white overflow-y-auto"
        >
          <div className="px-6 py-5 border-b border-white/10">
            <SheetHeader>
              <SheetTitle className="text-lg md:text-xl font-bold tracking-wide text-white/90">
                Menu
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="p-6 space-y-8">
            {/* 🔹 Usuário autenticado */}
            {session?.user ? (
              <div className="space-y-6">
                {/* 🔸 Cabeçalho do usuário */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user.image as string} />
                      <AvatarFallback className="bg-cyan-600 text-white">
                        {session.user.name?.split(" ")?.[0]?.[0]}
                        {session.user.name?.split(" ")?.[1]?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm md:text-base truncate">
                        {session.user.name}
                      </h3>
                      <p className="text-[11px] md:text-xs text-zinc-400 truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => authClient.signOut()}
                    className="hover:bg-red-600/20 transition"
                    title="Sair da conta"
                  >
                    <LogOutIcon className="h-4 w-4 text-red-400" />
                  </Button>
                </div>

                {/* 🔸 Opções da conta */}
                <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm md:text-base hover:bg-cyan-400 hover:text-black transition rounded-lg py-2"
                  >
                    <Link href="/my-orders">
                      <PackageSearchIcon className="h-4 w-4 md:h-5 md:w-5" />
                      Meus Pedidos
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm md:text-base hover:bg-cyan-400 hover:text-black transition rounded-lg py-2"
                  >
                    <Link href="/my-addresses">
                      <MapPinIcon className="h-4 w-4 md:h-5 md:w-5" />
                      Meus Endereços
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm md:text-base hover:bg-cyan-400 hover:text-black transition rounded-lg py-2"
                  >
                    <Link href="/cart">
                      <ShoppingBagIcon className="h-4 w-4 md:h-5 md:w-5" />
                      Meu Carrinho
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* 🔹 Usuário não autenticado */
              <div className="flex items-center justify-between border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div>
                  <h2 className="font-semibold text-sm md:text-base text-white">
                    Bem-vindo à <span className="text-cyan-400">Cold Breeze</span>
                  </h2>
                  <p className="text-[12px] text-zinc-400">
                    Faça login para acessar sua conta
                  </p>
                </div>

                <Button
                  size="icon"
                  asChild
                  variant="outline"
                  className="border-zinc-700 bg-transparent hover:bg-cyan-400 hover:text-black transition"
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
          <div className="px-6 py-4 mt-auto border-t border-white/10 text-[12px] text-zinc-500 text-center">
            © 2025 Cold Breeze — Todos os direitos reservados.
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuLink;
