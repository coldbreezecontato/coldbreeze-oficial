"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const banners = [
  { src: "/banner-cb.jpg", alt: "Leve uma vida com estilo" },
  { src: "/banner-02.jpg", alt: "Nova coleção Cold Breeze" },
  { src: "/banner-03.jpg", alt: "Promoções exclusivas" },
];

export function BannerCarousel() {
  return (
    <div className="px-2">
      <Carousel className="w-full">
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={index}>
              <Image
                src={banner.src}
                alt={banner.alt}
                width={0}
                height={0}
                sizes="100vw"
                className="h-auto w-full rounded-2xl border-1 border-gray-300"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden" />
        <CarouselNext className="hidden" />
      </Carousel>
    </div>
  );
}
