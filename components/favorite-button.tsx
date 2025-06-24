"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getFavorites,
  addFavotiteProduct,
  removeFavotiteProduct,
} from "@/data/favorite/action";
import { LoaderCircleIcon, StarIcon } from "lucide-react";

export default function FavoriteButton({ productId }: { productId: string | undefined }) {
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the user's favorite list.
        const userFavorites = await getFavorites();

        if (userFavorites && userFavorites.products) {
          // Check if the current product is in the fetched favorites.
          const currentProductIsFavorite = userFavorites.products.some(
            (favProduct) => favProduct.productId === productId
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
  }, [productId]);

  async function handleFavorite(id: string | undefined) {
    if (!id) return;
    // Update favorites.
    setLoadingFavorite(true);
    if (isFavorite) {
      await removeFavotiteProduct(id);
      setIsFavorite(false);
      toast.success(<p className="font-bold">Removed from Favorites</p>);
    } else {
      await addFavotiteProduct(id);
      setIsFavorite(true);
      toast.success(<p className="font-bold">Added to Favorites</p>);
    }
    setLoadingFavorite(false);
  }

  return (
    <button
      onClick={() => handleFavorite(productId)}
      className="absolute top-2 left-2 z-20"
    >
      <span className="sr-only">Add to Favorites</span>
      {loadingFavorite ? (
        <LoaderCircleIcon className="animate-spin" />
      ) : isFavorite ? (
        <StarIcon fill="#f0d11e" color="#523407" strokeWidth={1.2} size={28} />
      ) : (
        <StarIcon fill="#ccc" color="#ccc" strokeWidth={1.2} size={24} />
      )}
    </button>
  );
}
