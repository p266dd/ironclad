"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import {
  getFavorites,
  addFavotiteProduct,
  removeFavotiteProduct,
} from "@/data/favorite/action";

// Shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { MousePointerClickIcon, StarIcon } from "lucide-react";

// Types & Schemas
import { Prisma } from "@/lib/generated/prisma";

// Import fallback image.
import FallbackImage from "@/assets/product-fallback.webp";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

export default function ProductModal({
  product,
}: {
  product: Prisma.ProductGetPayload<{ include: { thumbnail: true; media: true } }>;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  async function handleFavorite(productId: string) {
    // Update favorites.
    if (isFavorite) {
      await removeFavotiteProduct(productId);
      setIsFavorite(false);
      toast.success(<p className="font-bold">Removed from Favorites</p>);
    } else {
      await addFavotiteProduct(productId);
      setIsFavorite(true);
      toast.success(<p className="font-bold">Added to Favorites</p>);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the user's favorite list.
        const userFavorites = await getFavorites();

        if (userFavorites && userFavorites.products) {
          // Check if the current product is in the fetched favorites
          const currentProductIsFavorite = userFavorites.products.some(
            (favProduct) => favProduct.productId === product.id
          );
          setIsFavorite(currentProductIsFavorite);
        } else {
          // Not found in favorites.
          setIsFavorite(false);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setIsFavorite(false);
      }
    };
    fetchData();
  }, [product.id]);

  return (
    <Dialog>
      <DialogTrigger>
        <div
          className={cn(
            "relative h-[240px] sm:h-[320px] md:h-[320px] lg:h-[420px] xl:h-[500px]"
          )}
        >
          <Image
            src={product.thumbnail?.url || FallbackImage}
            alt={product.name}
            className="object-cover border"
            fill
          />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <button
            onClick={() => handleFavorite(product.id)}
            className="absolute top-0 left-0 z-20"
          >
            <span className="sr-only">Add to Favorites</span>
            {isFavorite ? (
              <StarIcon fill="#f0d11e" color="#f0d11e" size={28} />
            ) : (
              <StarIcon color="#333" size={28} />
            )}
          </button>

          <Carousel>
            <CarouselContent>
              {product.media &&
                product.media.length > 0 &&
                product.media.map((media) => (
                  <CarouselItem key={media.id}>
                    <div className="relative h-[60vh]">
                      <Image
                        src={media.url}
                        alt={media.name}
                        className="object-contain"
                        fill
                      />
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <Separator className="my-4" />
          <Link href={"/products/" + product.id} className="text-lg">
            <div className="relative flex flex-col gap-1">
              <span className="text-xs text-slate-400 uppercase tracking-widest">
                Product
              </span>
              <h4 className="text-xl font-semibold leading-tight">
                OEM Shiro#1 Stainless clad / Oak Lacquer (KOP)
              </h4>
              <span className="absolute -bottom-2 -right-2 md:hidden">
                <MousePointerClickIcon color="#ccc" />
              </span>
            </div>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
