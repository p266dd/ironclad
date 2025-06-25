import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="px-8 w-full">
        <SidebarTrigger className="absolute top-4 right-0 pr-4 pl-6 py-7 bg-primary text-primary-foreground rounded-none rounded-l-full" />
        {children}
      </main>
    </SidebarProvider>
  );
}
