import { cookies } from "next/headers";
import { Open_Sans } from "next/font/google";
import "./globals.css";

import InstallPrompt from "@/components/install-prompt";
import { Toaster } from "@/components/ui/sonner";

import { TourProvider } from "@/lib/tour/tour-context";
import Tour from "@/lib/tour/tour";
import { CustomCard } from "@/lib/tour/custom-card";
import { Tour as TourInterface } from "@/lib/tour/types";

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

const tours: TourInterface[] = [
  {
    tour: "open-product-preview",
    steps: [
      {
        icon: null,
        title: "Open Preview",
        content: <>First tour, first step</>,
        selector: "#open-product-preview",
        side: "bottom",
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
        // nextRoute: "/foo",
        // prevRoute: "/bar",
      },
    ],
  },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <TourProvider>
          <Tour
            tours={tours}
            showTour={true}
            shadowRgb="55,48,163"
            shadowOpacity="0.8"
            cardComponent={CustomCard}
          >
            {children}
          </Tour>
        </TourProvider>
        <Toaster position="top-center" richColors={true} />
      </body>
    </html>
  );
}
