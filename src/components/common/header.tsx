"use client";

import Image from "next/image";
import Link from "next/link";
import Menu from "../common/menulink";
import { useEffect, useState } from "react";

export const Header = () => {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 🎯 Controla o scroll para esconder/mostrar o header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  
  return (
    <header className={`fixed top-0 left-0 w-full p-2 flex justify-between z-50 transition-transform duration-500 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      } backdrop-blur-md bg-black`}>

      <Link href="/">
        <Image src="/logo.svg" alt="Cold Breeze" width={50} height={50} className=""/>
      </Link>

      <div className="flex items-center">
        <Menu />
      </div>

    </header>
  );
};
