"use client";

import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductImageCarouselProps {
  images: string[];
}

export default function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground rounded-md">
        Sin imágenes
      </div>
    );
  }

  return (
    <Carousel className="w-full h-full group">
      <CarouselContent>
        {images.map((url, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-square w-full h-full">
              <Image
                src={url}
                alt={`Producto imagen ${index + 1}`}
                width={500}
                height={500}
                className="object-contain w-full h-full rounded-md"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index === 0}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
       {images.length > 1 && (
        <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </Carousel>
  );
}
