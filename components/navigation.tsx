"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/logout";
import {
  Star,
  Search,
  ShoppingBag,
  CircleUserRound,
  LayoutDashboard,
  LockIcon,
  HouseIcon,
} from "lucide-react";

// Types
import { SessionPayload } from "@/lib/session";

// Assets
import Logo from "@/assets/logo-icon.png";
import LoadingIndicator from "./loading-indicator";

export default function Navigation({
  cartCount,
  session,
}: {
  cartCount: number;
  session: SessionPayload | null;
}) {
  const pathname = usePathname();

  const navigationLinks = [
    {
      title: "Favorites",
      url: "/favorites",
      icon: <Star strokeWidth={1.3} size={28} />,
    },
    {
      title: "Search",
      url: "/search",
      icon: <Search strokeWidth={1.3} size={28} />,
    },
    {
      title: "Cart",
      url: "/cart",
      icon: <ShoppingBag strokeWidth={1.3} size={28} />,
    },
    {
      title: "Account",
      url: "/account",
      icon: <CircleUserRound strokeWidth={1.3} size={28} />,
    },
  ];

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full p-3 z-30",
        "md:top-0 md:left-0 md:max-w-[200px] md:p-0",
        "bg-linear-0 from-50% from-white to-white/20 backdrop-blur-md"
      )}
    >
      <nav
        className={cn(
          "grid grid-cols-4 gap-2 p-2 justify-between bg-slate-800 text-white rounded-2xl",
          "md:flex md:flex-col md:gap-6 md:h-screen md:w-[210px] md:fixed md:top-0 md:left-0 md:justify-center md:rounded-none"
        )}
      >
        <div className="hidden md:flex flex-col justify-center gap-5 px-4 mb-12">
          <Image src={Logo} alt="Ironclad Logo" className="max-w-[40px] invert" />
          <h2 className="text-2xl">
            <span className="block text-base mb-2">Welcome,</span>
            {(session && session.name) || "User"}
          </h2>
        </div>

        <div className="hidden md:flex px-4 py-2">
          <Link
            className={cn(
              "relative flex flex-col items-center gap-2 py-1",
              "md:flex-row md:gap-6"
            )}
            href="/"
          >
            <HouseIcon strokeWidth={1.3} size={28} />
            Home
            <LoadingIndicator />
          </Link>
        </div>

        {navigationLinks.map((link, i) => {
          return (
            <div
              key={i}
              className={`flex-grow md:flex-grow-0 px-4 py-2 rounded-2xl ${
                pathname.startsWith(link.url)
                  ? "border-b-4 border-slate-700 bg-slate-900"
                  : null
              }`}
            >
              <Link
                className={cn(
                  "relative flex flex-col items-center gap-2 py-1",
                  "md:flex-row md:gap-6"
                )}
                href={link.url}
              >
                {link.icon}
                <span className="tracking-wider"> {link.title}</span>
                <LoadingIndicator />
                {link.title === "Cart" && cartCount > 0 ? (
                  <span
                    className={cn(
                      "absolute -top-2 right-0 py-1 px-2 text-sm text-white font-bold bg-red-600 rounded-full",
                      "md:relative top-0"
                    )}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            </div>
          );
        })}

        <div className="hidden md:flex px-4 py-2">
          <form action={logout}>
            <button
              className={cn(
                "relative w-full flex flex-row items-center gap-6 cursor-pointer"
              )}
            >
              <LockIcon strokeWidth={1.3} size={28} /> Logout
            </button>
          </form>
        </div>

        {session && session.role == "admin" && (
          <div className="hidden md:flex py-2 rounded-2xl">
            <Link
              className={cn(
                "relative w-full flex flex-row items-center gap-6 py-2 px-3 rounded-xl bg-slate-600"
              )}
              href="/dashboard"
            >
              <LayoutDashboard />
              <span className="tracking-wider">Dashboard</span>
              <LoadingIndicator />
            </Link>
          </div>
        )}
      </nav>

      {session && session.role == "admin" && (
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center justify-center gap-3 mt-2 px-4 py-2 max-w-[600px] mx-auto bg-slate-800 text-white rounded-2xl",
            "md:hidden"
          )}
        >
          <LoadingIndicator /> <LayoutDashboard size={18} strokeWidth={1.3} />
          <span>Dashboard</span>
        </Link>
      )}
    </div>
  );
}
