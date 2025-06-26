import { Viewport } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

import { verifyAdminSession } from "@/lib/session";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  await verifyAdminSession();

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="px-8 pb-12 w-full">
        <SidebarTrigger className="fixed top-4 right-0 pr-4 pl-6 py-7 bg-primary text-primary-foreground rounded-none rounded-l-full" />
        {children}
      </main>
    </SidebarProvider>
  );
}
