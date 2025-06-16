"use client";

import Image from "next/image";

// Shadcn
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Types
import { Media } from "@/lib/generated/prisma";

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
  if (!media || media.length === 0) return null;

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
