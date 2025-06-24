import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main>
        <SidebarTrigger className="absolute top-4 left-0 pl-4 pr-6 py-7 bg-primary text-primary-foreground rounded-none rounded-r-full" />
        {children}
      </main>
    </SidebarProvider>
  );
}
