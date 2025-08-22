import { getSession } from "@/lib/session";
import { getCartCount } from "@/data/cart/actions";
import Navigation from "@/components/navigation";
import MobileTopNav from "@/components/mobile-top-nav";
import DisplayMessage from "@/components/message";
import AppTopBackButton from "@/components/app-top-back-button";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const cartCount = await getCartCount();

  return (
    <div className="relative flex min-h-screen">
      <MobileTopNav />
      <DisplayMessage />
      <Navigation cartCount={cartCount || 0} session={session} />
      <main className="flex-grow md:pl-[210px]">
        <AppTopBackButton />
        {children}
      </main>
    </div>
  );
}
