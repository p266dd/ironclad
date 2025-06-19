"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

import {
  getFavorites,
  addFavotiteProduct,
  removeFavotiteProduct,
} from "@/data/favorite/action";

// Shadcn
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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

  // Long press simulation.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let clickTimer: NodeJS.Timeout;
    let timerStarted: number = 0;
    let hasMoved: boolean = false;
    const navigator = window.navigator;

    // Disabled context menu for the entire component.
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    // Hide the default context menu on mobile browsers [iOS issue].
    if (triggerRef.current) {
      triggerRef.current.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        return;
      });
    }

    if (triggerRef.current) {
      triggerRef.current.addEventListener("touchstart", () => {
        setOpen(false);
        // Simulate long press.
        timer = setTimeout(() => {
          setOpen(true);
        }, 500);

        timerStarted = Date.now();
        return;
      });
    }

    if (triggerRef.current) {
      triggerRef.current.addEventListener("touchend", () => {
        clearTimeout(timer);
        // Clear any selection.
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          selection.removeAllRanges();
        }

        const timerEnded = Date.now();
        const duration = timerEnded - timerStarted;

        if (duration <= 400 && !hasMoved) {
          // Treat as a click if very short hold.
          router.push("/products/" + product.id);
        }
        return;
      });
    }

    if (triggerRef.current) {
      triggerRef.current.addEventListener("touchmove", () => {
        // Cancel long hold and cancel tap if finger moves.
        clearTimeout(timer);
        hasMoved = true;
        return;
      });
    }

    triggerRef.current &&
      triggerRef.current.addEventListener("click", (e) => {
        if (navigator.userAgent.match(/Mobi|Android|Tablet|iPad/i)) {
          e.preventDefault();
        }
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
          router.push("/products/" + product.id);
        }, 200);
        return;
      });

    triggerRef.current &&
      triggerRef.current.addEventListener("dblclick", () => {
        clearTimeout(clickTimer);
        setOpen(true);
        return;
      });
  }, [product.id, router]);

  return (
    <>
      <div
        ref={triggerRef}
        className={cn(
          "relative h-[240px] sm:h-[320px] md:h-[320px] lg:h-[420px] xl:h-[500px]"
        )}
      >
        <Image
          src={product.thumbnail?.url || FallbackImage}
          alt={product.name}
          className="object-cover rounded-md overflow-hidden"
          fill
        />
      </div>
      <Dialog open={open} onOpenChange={() => setOpen((prev) => !prev)}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="sr-only">
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>{product.description}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <button
              onClick={() => handleFavorite(product.id)}
              className="absolute top-2 left-2 z-20"
            >
              <span className="sr-only">Add to Favorites</span>
              {isFavorite ? (
                <StarIcon fill="#f0d11e" color="#523407" strokeWidth={1.2} size={28} />
              ) : (
                <StarIcon fill="#ccc" color="#ccc" strokeWidth={1.2} size={24} />
              )}
            </button>

            <Carousel>
              <CarouselContent>
                {product.media &&
                  product.media.length > 0 &&
                  product.media.map((media) => (
                    <CarouselItem key={media.id}>
                      <div className="relative rounded-lg overflow-hidden">
                        <img src={media.url} alt={media.name} className="w-ful" />
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
                <Button type="button" className="mt-2">
                  See Product
                </Button>
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
