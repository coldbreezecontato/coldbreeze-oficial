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
import { LogInIcon, LogOutIcon, MenuIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const menuLink = () => {
  const { data: session } = authClient.useSession();
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" size="icon" className="bg-blue-200 h-10 w-10 hover:bg-blue-300">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="px-5">
            {session?.user ? (
              <>
                <div className="flex justify-between flex-wrap space-y-6">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={session?.user?.image as string | undefined}
                      />
                      <AvatarFallback>
                        {session?.user?.name?.split(" ")?.[0]?.[0]}
                        {session?.user?.name?.split(" ")?.[1]?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold">{session?.user?.name}</h3>
                      <span className="text-muted-foreground block text-[10px]">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => authClient.signOut()}
                  >
                    <LogOutIcon />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Olá. Faça seu login!</h2>
                <Button size="icon" asChild variant="outline">
                  <Link href="/authentication">
                    <LogInIcon />
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

export default menuLink;
