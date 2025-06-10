import { getSession } from "@/lib/session";
import Navigation from "@/components/navigation";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="relative flex min-h-screen">
      <Navigation cartCount={5} session={session} />
      <main>{children}</main>
    </div>
  );
}
