"use client";

import { usePathname } from "next/navigation";
import BackButton from "./back-button";

export default function AppTopBackButton() {
  const path = usePathname();

  if (path === "/") {
    return null;
  }

  return (
    <div className="hidden sm:block px-8 pt-8">
      <BackButton />
    </div>
  );
}
