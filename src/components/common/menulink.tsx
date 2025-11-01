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
  MenuIcon,
  PackageSearchIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const MenuLink = () => {
  const { data: session } = authClient.useSession();

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-black h-8 w-8 cursor-pointer border-none hover:bg-zinc-900"
          >
            <MenuIcon className="text-white" />
          </Button>
        </SheetTrigger>

        <SheetContent className="border-none bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] 
        border-b border-[#0a84ff]/20 text-white">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold text-white/90">
              Menu
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-8 px-2">
            {session?.user ? (
              <>
                {/* Perfil do Usuário */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={session?.user?.image as string} />
                      <AvatarFallback>
                        {session?.user?.name?.split(" ")?.[0]?.[0]}
                        {session?.user?.name?.split(" ")?.[1]?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold text-sm">
                        {session?.user?.name}
                      </h3>
                      <span className="text-zinc-400 block text-[11px]">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => authClient.signOut()}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    <LogOutIcon className="h-4 w-4 text-white" />
                  </Button>
                </div>

                {/* Ações do Usuário */}
                <div className="flex flex-col gap-3 pt-6 border-t border-zinc-800">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-zinc-700 hover:bg-black hover:text-white justify-start gap-2"
                  >
                    <Link href="/my-orders">
                      <PackageSearchIcon className="h-4 w-4" />
                      Meus Pedidos
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">
                  Olá. Faça seu login!
                </h2>
                <Button
                  size="icon"
                  asChild
                  variant="outline"
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  <Link href="/authentication">
                    <LogInIcon className="h-4 w-4 text-white" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuLink;
