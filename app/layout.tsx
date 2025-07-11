import { cookies } from "next/headers";
import { Open_Sans } from "next/font/google";
import "./globals.css";

import InstallPrompt from "@/components/install-prompt";
import { Toaster } from "@/components/ui/sonner";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

export const metadata = {
  title: "Ironclad App",
  description: "Ironclad wholesaler application.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const doNotDisplayPrompt = cookieStore.get("doNotDisplayPrompt");

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-title" content="Ironclad" />
        <meta name="application-name" content="Ironclad" />
        <meta name="theme-color" content="#1d293d" />
      </head>
      <body className={`${openSans.variable} antialiased`}>
        {!doNotDisplayPrompt && <InstallPrompt />}
        {children}
        <Toaster position="top-center" richColors={true} />
      </body>
    </html>
  );
}
