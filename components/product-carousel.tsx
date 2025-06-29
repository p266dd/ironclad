"use client";

// Shadcn
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import FallbackImage from "@/assets/product-fallback.webp";

export default function ProductCarousel({
  media,
}: {
  media:
    | {
        id: string;
        name: string;
        url: string;
        productId: string | null;
      }[]
    | null;
}) {
  // Don't show carousel if there is no product
  if (!media || media.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden">
        <img src={FallbackImage.src} alt="Product Placeholder" className="w-full" />
      </div>
    );
  }

  return (
    <Carousel>
      <CarouselContent>
        {media.map((media) => (
          <CarouselItem key={media.id}>
            <div className="rounded-lg overflow-hidden">
              <img src={media.url} alt={media.name} className="w-full" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
