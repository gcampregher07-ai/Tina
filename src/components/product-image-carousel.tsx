
"use client";

import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

interface ProductImageCarouselProps {
  images: string[];
}

export default function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  if (!images || images.length === 0) {
    return <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">Sin imágenes</div>;
  }

  return (
    <div className="w-full h-80 max-h-80 relative">
      <Carousel
        swipeable
        draggable={false}
        showDots
        responsive={responsive}
        infinite
        autoPlay={false}
        keyBoardControl
        customTransition="all 0.5s ease-in-out"
        transitionDuration={500}
        containerClass="carousel-container h-full"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-40-px"
      >
        {images.map((url, index) => (
          <div key={index} className="relative w-full h-full">
            <Image
              src={url}
              alt={`Producto imagen ${index + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 500px"
              priority={index === 0} // Prioriza la primera imagen para mejorar la carga
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
