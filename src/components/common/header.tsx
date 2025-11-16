"use client";

import Image from "next/image";
import Link from "next/link";
import Menu from "../common/menulink";
import { useEffect, useState } from "react";
import { Cart } from "./cart";

export const Header = () => {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    <>
      {/* Barra promocional sempre visível */}
      <div className="fixed top-0 left-0 w-full z-50 
        bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] 
        border-b border-[#0a84ff]/20 
        text-center text-xs md:text-sm font-medium tracking-wide 
        text-blue-100 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,50,0.4)]">
        <div className="py-2 px-4 flex items-center justify-center gap-2">
          <div>
            <Image
              src="/mascote-logo.svg"
              alt="Ícone de Desconto"
              width={30}
              height={30}
              className="inline-block"
            />
          </div>
          <span className="text-[#afb9d8] font-semibold"> CUPOM:</span>
          <span className="font-bold text-white tracking-wider bg-[#afb9d8]/20 px-2 py-0.5 rounded-md border border-[#afb9d8]/30">
            PRIMEIRACOMPRA
          </span>
          <span className="text-blue-200">
            — Ganhe <span className="font-bold text-[#afb9d8]">10% OFF</span>
          </span>
          <div>
            <Image
              src="/mascote-logo.svg"
              alt="Ícone de Desconto"
              width={30}
              height={30}
              className="inline-block"
            />
          </div>
        </div>
      </div>

      {/* Header flutuante */}
      <header
        className={`fixed top-[43px] left-0 w-full z-40 transition-all duration-500 ${
          showNav ? "opacity-100 translate-y-0" : "-translate-y-full opacity-0"
        }`}
      >
        <div
          className="mx-auto mt-3 w-[94%] max-w-7xl 
          flex justify-between items-center 
          px-5 py-3 
          rounded-2xl border border-white/10 
          bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] 
          backdrop-blur-md shadow-lg shadow-black/30 
          transition-all duration-300"
        >
          <Link href="/" className="flex items-center gap-2">
            <Image src="/white-logo.svg" alt="Cold Breeze" width={45} height={45} />
          </Link>

          <div className="flex items-center gap-3">
            <Cart />
            <Menu />
          </div>
        </div>
      </header>

      {/* Espaço compensatório para não sobrepor o conteúdo */}
      <div className="h-[120px]" />
    </>
  );
};
