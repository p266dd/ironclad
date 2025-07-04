"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
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
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Orders",
    url: "/dashboard",
    icon: ShoppingBag,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Box,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: UserCheck,
  },
  {
    title: "Message",
    url: "/dashboard/message",
    icon: MessageSquareText,
  },
];

export function DashboardSidebar() {
  const path = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="py-10 px-6">
        <div className="w-[200px]">
          <Image src={Logo} alt="Irenclad Logo" className="invert" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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
        <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-4">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base">
                <Link href="/dashboard/products/add">
                  <LoadingIndicator />
                  <PlusCircleIcon />
                  <span>New Product</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base">
                <Link href="/dashboard/users/add">
                  <LoadingIndicator />
                  <PlusCircleIcon />
                  <span>New Client</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base">
                <Link href="/dashboard/orders/add">
                  <LoadingIndicator />
                  <PlusCircleIcon />
                  <span>New Order</span>
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
