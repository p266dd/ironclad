"use client";

import { usePathname } from "next/navigation";
import Logo from "@/assets/logo.png";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Box,
  Home,
  MessageSquareText,
  PlusCircleIcon,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import DashboardLogout from "./logout";
import Link from "next/link";
import LoadingIndicator from "../loading-indicator";

const items = [
  {
    title: "ホーム",
    url: "/",
    icon: Home,
  },
  {
    title: "注文",
    url: "/dashboard",
    icon: ShoppingBag,
  },
  {
    title: "商品",
    url: "/dashboard/products",
    icon: Box,
  },
  {
    title: "ユーザー",
    url: "/dashboard/users",
    icon: UserCheck,
  },
  {
    title: "メッセージ",
    url: "/dashboard/message",
    icon: MessageSquareText,
  },
];

export function DashboardSidebar() {
  const path = usePathname();

  return (
    <Sidebar className="print:hidden">
      <SidebarHeader className="py-10 px-6">
        <div className="w-[200px]">
          <img src={Logo.src} alt="Irenclad Logo" className="invert" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>アプリ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      path.split("/")[2] !== undefined
                        ? path.split("/")[2] === item.title.toLowerCase()
                        : item.url === "/dashboard"
                    }
                    className="text-base"
                  >
                    <Link href={item.url}>
                      <LoadingIndicator />
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroupLabel>ショートカット</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-4">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base">
                <Link href="/dashboard/products/add">
                  <LoadingIndicator />
                  <PlusCircleIcon />
                  <span>新商品</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base">
                <Link href="/dashboard/users/add">
                  <LoadingIndicator />
                  <PlusCircleIcon />
                  <span>新規顧客</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base">
                <Link href="/dashboard/orders/add">
                  <LoadingIndicator />
                  <PlusCircleIcon />
                  <span>新規注文 </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter>
        <DashboardLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
