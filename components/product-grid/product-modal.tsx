"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

// Shadcn
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { MousePointerClickIcon } from "lucide-react";

// Types & Schemas
import { Prisma } from "@/lib/generated/prisma";

// Import fallback image.
import FallbackImage from "@/assets/product-fallback.webp";
import FavoriteButton from "../favorite-button";

export default function ProductModal({
  product,
}: {
  product: Prisma.ProductGetPayload<{ include: { thumbnail: true; media: true } }>;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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

    if (triggerRef.current) {
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
    }

    if (triggerRef.current) {
      triggerRef.current.addEventListener("dblclick", () => {
        clearTimeout(clickTimer);
        setOpen(true);
        return;
      });
    }
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
          className="object-cover rounded-md overflow-hidden border"
          fill
        />
      </div>
      <Dialog open={open} onOpenChange={() => setOpen((prev) => !prev)}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-h-[95vh]"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>{product.description}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <FavoriteButton productId={product.id} />

            <Carousel>
              <CarouselContent>
                {product.media && product.media.length > 0 ? (
                  product.media.map((media) => (
                    <CarouselItem key={media.id}>
                      <div className="relative min-h-[300px] h-[65vh] rounded-lg overflow-hidden">
                        <img
                          src={media.url}
                          alt={media.name}
                          className="w-full object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={FallbackImage.src}
                      alt="Image Placeholder"
                      className="w-full"
                    />
                  </div>
                )}
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
                <h4 className="text-xl font-semibold leading-tight capitalize">
                  {product.name}
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
