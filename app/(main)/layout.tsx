import { getSession } from "@/lib/session";
import Navigation from "@/components/navigation";
import MobileTopNav from "@/components/mobile-top-nav";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="relative flex min-h-screen">
      <MobileTopNav />
      <Navigation cartCount={5} session={session} />
      <main className="flex-grow md:pl-[210px]">{children}</main>
    </div>
  );
}
