import { Manifest } from "next/dist/lib/metadata/types/manifest-types";

export default function manifest(): Manifest {
  return {
    name: "Ironclad",
    short_name: "Ironclad",
    id: "ironclad",
    description: "International application description.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f3f4",
    theme_color: "#1d293d",
    orientation: "portrait",
    lang: "en-US",
    categories: ["Shopping", "Utilities"],
    icons: [
      {
        src: "/manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshot.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Ironclad App On Mobile",
      },
    ],
  };
}
