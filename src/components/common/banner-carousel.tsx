"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Banners MOBILE
const mobileBanners = [
  { src: "/mobile/banner-cb.jpg", alt: "Leve uma vida com estilo" },
  { src: "/mobile/banner-02.jpg", alt: "Nova coleção Cold Breeze" },
  { src: "/mobile/banner-03.jpg", alt: "Promoções exclusivas" },
];

// Banners DESKTOP
const desktopBanners = [
  { src: "/desktop/pc-banner-01.svg", alt: "Leve uma vida com estilo" },
  { src: "/desktop/pc-banner-02.svg", alt: "Nova coleção Cold Breeze" },
  { src: "/desktop/pc-banner-03.svg", alt: "Promoções exclusivas" },
];


export function BannerCarousel() {
  return (
    <div className="px-2 md:px-8">
      {/* --- MOBILE --- */}
      <div className="md:hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {mobileBanners.map((banner, index) => (
              <CarouselItem key={index}>
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-auto w-full rounded-2xl mb-4"
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden" />
          <CarouselNext className="hidden" />
        </Carousel>
      </div>

      {/* --- DESKTOP --- */}
      <div className="hidden md:block px-0">
        <Carousel className="w-full">
          <CarouselContent>
            {desktopBanners.map((banner, index) => (
              <CarouselItem key={index}>
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  width={1920}
                  height={600}
                  sizes="100vw"
                  className="h-auto w-full rounded-2xl mb-6"
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
