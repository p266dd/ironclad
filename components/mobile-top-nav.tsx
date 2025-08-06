"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/lib/logout";

// Shadcn
import { ChevronLeftIcon, LockIcon } from "lucide-react";

import Logo from "@/assets/logo.png";

export default function MobileTopNav() {
  const router = useRouter();
  const path = usePathname();

  if (path === "/") {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 w-full flex justify-center py-6 px-6 z-50 sm:hidden">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-lg"
          >
            <ChevronLeftIcon size={20} />
            Back
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <Link href="/">
            <img src={Logo.src} alt="Ironclad Logo" className="w-32" />
          </Link>
        </div>
        <div className="flex-1 flex justify-end">
          <form action={logout}>
            <button className="flex items-center hover:cursor-pointer bg-slate-800 rounded-full p-2 text-white">
              <LockIcon size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
