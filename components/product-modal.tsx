"use client";

import Image from "next/image";

// Shadcn
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Types
import { Prisma } from "@/lib/generated/prisma";

// Import fallback image.
import FallbackImage from "@/assets/product-fallback.webp";

export default function ProductModal({
  product,
}: {
  product: Prisma.ProductGetPayload<{ include: { thumbnail: true; media: true } }>;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <Image
          src={product.thumbnail?.url || FallbackImage}
          alt={product.name}
          className="object-cover"
          fill
        />
      </DialogTrigger>
      <DialogContent>
        <div>
          <Carousel>
            <CarouselContent>
              {product.media &&
                product.media.length > 0 &&
                product.media.map((media, i) => (
                  <CarouselItem key={i}>
                    <div>
                      <Image
                        src={media.url}
                        alt={media.name}
                        className="object-cover"
                        fill
                      />
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          {/* <div>Fav Icon</div> */}
          {/* <div>Title</div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
