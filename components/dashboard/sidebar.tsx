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
  PlusCircleIcon,
  Settings,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import DashboardLogout from "./logout";

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
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
                <a href="/dashboard/products/new">
                  <PlusCircleIcon />
                  <span>New Product</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-base">
                <a href="/dashboard/users/new">
                  <PlusCircleIcon />
                  <span>New User</span>
                </a>
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
